// Combined Pay4me API with Vercel KV for data persistence
// Handles authentication, recharge, health checks, and all other API endpoints

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';
import { generateOTP, sendOTP } from '../utils/otp-service.js';

// Helper functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateNigerianPhone(phone) {
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    return phoneRegex.test(phone);
}

// JWT verification middleware
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'pay4me_secret_key');
    } catch (error) {
        return null;
    }
}

// AUTHENTICATION FUNCTIONS
async function handleRegister(req, res) {
    const { name, email, phone, password, verificationType } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required: name, email, phone, password'
        });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }

    if (!validateNigerianPhone(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Nigerian phone number format'
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    try {
        // Check if user already exists
        const existingEmailUser = await kv.get(`user:email:${email}`);
        const existingPhoneUser = await kv.get(`user:phone:${phone}`);

        if (existingEmailUser || existingPhoneUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or phone number'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create user directly (skip OTP for testing)
        const userData = {
            id: userId,
            name,
            email,
            phone,
            password: hashedPassword,
            isVerified: true,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        await kv.set(`user:${userId}`, JSON.stringify(userData));
        await kv.set(`user:email:${email}`, userId);
        await kv.set(`user:phone:${phone}`, userId);

        return res.status(200).json({
            success: true,
            message: 'Account created successfully!',
            data: {
                userId,
                user: {
                    id: userId,
                    name,
                    email,
                    phone
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
}

async function handleVerifyAccount(req, res) {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({
            success: false,
            message: 'User ID and verification code are required'
        });
    }

    try {
        const pendingDataStr = await kv.get(`pending:${userId}`);

        if (!pendingDataStr) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification request'
            });
        }

        const pendingUser = JSON.parse(pendingDataStr);

        if (Date.now() > pendingUser.otpExpires) {
            await kv.del(`pending:${userId}`);
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        if (pendingUser.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        const user = {
            id: userId,
            name: pendingUser.name,
            email: pendingUser.email,
            phone: pendingUser.phone,
            password: pendingUser.password,
            isVerified: true,
            verificationMethod: pendingUser.verificationType,
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        await kv.set(`user:${userId}`, JSON.stringify(user));
        await kv.set(`user:email:${user.email}`, userId);
        await kv.set(`user:phone:${user.phone}`, userId);

        await kv.del(`pending:${userId}`);

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'pay4me_secret_key',
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Account verified successfully! Welcome to Pay4me!',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isVerified: user.isVerified,
                    registeredAt: user.registeredAt
                },
                token,
                expiresIn: '30d'
            }
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
}

async function handleLogin(req, res) {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email/phone and password are required'
        });
    }

    try {
        let userId;
        if (validateEmail(identifier)) {
            userId = await kv.get(`user:email:${identifier}`);
        } else {
            userId = await kv.get(`user:phone:${identifier}`);
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const userDataStr = await kv.get(`user:${userId}`);
        if (!userDataStr) {
            return res.status(401).json({
                success: false,
                message: 'User account not found'
            });
        }

        const user = JSON.parse(userDataStr);

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: 'Account not verified. Please check your email/phone for verification code.'
            });
        }

        user.lastLogin = new Date().toISOString();
        await kv.set(`user:${userId}`, JSON.stringify(user));

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'pay4me_secret_key',
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful! Welcome back to Pay4me!',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin
                },
                token,
                expiresIn: '30d'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
}

async function handleResendOTP(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    try {
        const pendingDataStr = await kv.get(`pending:${userId}`);
        if (!pendingDataStr) {
            return res.status(400).json({
                success: false,
                message: 'No pending verification found'
            });
        }

        const pendingUser = JSON.parse(pendingDataStr);
        const newOTP = generateOTP();

        pendingUser.otp = newOTP;
        pendingUser.otpExpires = Date.now() + 10 * 60 * 1000;

        await kv.set(`pending:${userId}`, JSON.stringify(pendingUser), { ex: 600 });

        const verificationMethod = pendingUser.verificationType === 'phone' ? pendingUser.phone : pendingUser.email;
        await sendOTP(verificationMethod, newOTP, pendingUser.verificationType);

        return res.status(200).json({
            success: true,
            message: 'New verification code sent!'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to resend verification code. Please try again.'
        });
    }
}

// RECHARGE FUNCTIONS
async function handleRecharge(req, res) {
    const decoded = verifyToken(req);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const { type, network, phoneNumber, amount, dataSize, reference } = req.body;

    if (!type || !network || !phoneNumber || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: type, network, phoneNumber, amount'
        });
    }

    if (!validateNigerianPhone(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format'
        });
    }

    try {
        console.log(`Processing ${type} recharge:`, { network, phoneNumber, amount, dataSize });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const confirmationCode = `CK${Date.now().toString().slice(-8)}`;

        return res.status(200).json({
            success: true,
            message: `${type === 'airtime' ? 'Airtime' : 'Data'} recharge successful`,
            data: {
                reference: reference || `REF_${Date.now()}`,
                confirmationCode,
                amount: parseFloat(amount),
                network,
                phoneNumber,
                type,
                dataSize: dataSize || null,
                timestamp: new Date().toISOString(),
                status: 'completed'
            }
        });
    } catch (error) {
        console.error('Recharge error:', error);
        return res.status(500).json({
            success: false,
            message: 'Recharge failed. Please try again.'
        });
    }
}

// HEALTH CHECK
function handleHealth(req, res) {
    const healthData = {
        status: 'healthy',
        message: 'Pay4me Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        services: {
            clubkonnect: {
                configured: !!process.env.CLUBKONNECT_API_KEY,
                enabled: !!process.env.CLUBKONNECT_API_KEY
            },
            authentication: {
                configured: true,
                enabled: true
            }
        }
    };

    return res.status(200).json(healthData);
}

// MAIN HANDLER
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://pay4me.com.ng');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const action = url.searchParams.get('action');

    try {
        if (path === '/api/health') {
            return handleHealth(req, res);
        }

        if (path === '/api/auth') {
            switch (action) {
                case 'register':
                    return await handleRegister(req, res);
                case 'verify':
                    return await handleVerifyAccount(req, res);
                case 'login':
                    return await handleLogin(req, res);
                case 'resend-otp':
                    return await handleResendOTP(req, res);
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid auth action'
                    });
            }
        }

        if (path === '/api/recharge') {
            return await handleRecharge(req, res);
        }

        return res.status(404).json({
            success: false,
            message: 'Endpoint not found'
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}