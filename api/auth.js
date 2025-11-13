// User Authentication API
// Real registration and login with email/phone verification

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP, sendOTP } from '../utils/otp-service.js';

// In production, this would be a database
// For now, using in-memory storage (will be replaced with MongoDB/PostgreSQL)
const users = new Map();
const pendingVerifications = new Map();

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://pay4me.com.ng');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;

    try {
        switch (action) {
            case 'register':
                return handleRegister(req, res);
            case 'verify':
                return handleVerifyAccount(req, res);
            case 'login':
                return handleLogin(req, res);
            case 'resend-otp':
                return handleResendOTP(req, res);
            case 'forgot-password':
                return handleForgotPassword(req, res);
            case 'reset-password':
                return handleResetPassword(req, res);
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Use: register, verify, login, resend-otp, forgot-password, reset-password'
                });
        }
    } catch (error) {
        console.error('Auth API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication service error',
            error: error.message
        });
    }
}

// POST /api/auth?action=register
async function handleRegister(req, res) {
    const { name, email, phone, password, verificationType } = req.body;

    // Validation
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

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
        user => user.email === email || user.phone === phone
    );

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email or phone number'
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const otp = generateOTP();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store pending verification
    pendingVerifications.set(userId, {
        name,
        email,
        phone,
        password: hashedPassword,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
        verificationType: verificationType || 'email',
        createdAt: new Date().toISOString()
    });

    // Send OTP
    const verificationMethod = verificationType === 'phone' ? phone : email;
    
    try {
        await sendOTP(verificationMethod, otp, verificationType);
        
        return res.status(200).json({
            success: true,
            message: `Verification code sent to your ${verificationType === 'phone' ? 'phone' : 'email'}`,
            data: {
                userId,
                verificationType,
                verificationMethod: verificationType === 'phone' ? 
                    phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3') :
                    email.replace(/(.{2})(.*)(@.*)/, '$1****$3'),
                expiresIn: 600 // 10 minutes
            }
        });
    } catch (error) {
        pendingVerifications.delete(userId);
        return res.status(500).json({
            success: false,
            message: 'Failed to send verification code. Please try again.'
        });
    }
}

// POST /api/auth?action=verify
function handleVerifyAccount(req, res) {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({
            success: false,
            message: 'User ID and verification code are required'
        });
    }

    const pendingUser = pendingVerifications.get(userId);
    
    if (!pendingUser) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or expired verification request'
        });
    }

    if (Date.now() > pendingUser.otpExpires) {
        pendingVerifications.delete(userId);
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

    // Create verified user
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

    users.set(userId, user);
    pendingVerifications.delete(userId);

    // Generate JWT token
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
}

// POST /api/auth?action=login
async function handleLogin(req, res) {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email/phone and password are required'
        });
    }

    // Find user by email or phone
    const user = Array.from(users.values()).find(
        user => user.email === identifier || user.phone === identifier
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check password
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

    // Update last login
    user.lastLogin = new Date().toISOString();
    users.set(user.id, user);

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'pay4me_secret_key',
        { expiresIn: '30d' }
    );

    return res.status(200).json({
        success: true,
        message: 'Login successful!',
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
}

// POST /api/auth?action=resend-otp
async function handleResendOTP(req, res) {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    const pendingUser = pendingVerifications.get(userId);
    
    if (!pendingUser) {
        return res.status(400).json({
            success: false,
            message: 'Invalid verification request'
        });
    }

    // Generate new OTP
    const newOtp = generateOTP();
    pendingUser.otp = newOtp;
    pendingUser.otpExpires = Date.now() + 10 * 60 * 1000;
    pendingVerifications.set(userId, pendingUser);

    // Send new OTP
    const verificationMethod = pendingUser.verificationType === 'phone' ? 
        pendingUser.phone : pendingUser.email;
    
    try {
        await sendOTP(verificationMethod, newOtp, pendingUser.verificationType);
        
        return res.status(200).json({
            success: true,
            message: 'New verification code sent!',
            data: {
                expiresIn: 600 // 10 minutes
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to send verification code. Please try again.'
        });
    }
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateNigerianPhone(phone) {
    const phoneRegex = /^(0[789][01]|0[789][0-9])\d{8}$/;
    return phoneRegex.test(phone);
}