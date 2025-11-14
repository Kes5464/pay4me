import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@vercel/kv';
import { generateOTP, sendOTP } from './utils/otp-service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Vercel KV
const kv = createClient({
  url: process.env.KV_URL,
  token: process.env.KV_REST_API_TOKEN
});

// Middleware
app.use(cors({
  origin: ['https://pay4me.com.ng', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Helper functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateNigerianPhone(phone) {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pay4me API is running',
    timestamp: new Date().toISOString()
  });
});

// Register user
app.post('/api/auth', async (req, res) => {
  const { action } = req.query;

  if (action === 'register') {
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
        message: 'Invalid Nigerian phone number'
      });
    }

    try {
      // Check if user already exists
      const existingUser = await kv.get(`user:${email}`);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user object
      const user = {
        id: userId,
        name,
        email,
        phone,
        password: hashedPassword,
        verified: false,
        createdAt: new Date().toISOString()
      };

      // Store user
      await kv.set(`user:${email}`, JSON.stringify(user));
      await kv.set(`user:${phone}`, JSON.stringify(user));

      // Generate OTP
      const otp = generateOTP();
      const otpId = `otp_${Date.now()}`;

      // Store OTP
      await kv.set(`otp:${userId}`, JSON.stringify({
        otp,
        type: verificationType || 'email',
        expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
        userId
      }));

      // Send OTP (simulated)
      await sendOTP(email, otp);

      res.json({
        success: true,
        message: 'User registered successfully. Please verify your account.',
        data: {
          userId,
          verificationType: verificationType || 'email'
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  } else if (action === 'verify') {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'User ID and OTP are required'
      });
    }

    try {
      const otpData = await kv.get(`otp:${userId}`);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP not found or expired'
        });
      }

      const parsedOtp = JSON.parse(otpData);
      if (parsedOtp.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (Date.now() > parsedOtp.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }

      // Get user and update verification status
      const userData = await kv.get(`user:${parsedOtp.userId}`);
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = JSON.parse(userData);
      user.verified = true;
      await kv.set(`user:${user.email}`, JSON.stringify(user));
      await kv.set(`user:${user.phone}`, JSON.stringify(user));

      // Clean up OTP
      await kv.del(`otp:${userId}`);

      res.json({
        success: true,
        message: 'Account verified successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            verified: true
          }
        }
      });

    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Verification failed',
        error: error.message
      });
    }
  } else if (action === 'login') {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/phone and password are required'
      });
    }

    try {
      const userData = await kv.get(`user:${identifier}`);
      if (!userData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = JSON.parse(userData);

      if (!user.verified) {
        return res.status(401).json({
          success: false,
          message: 'Account not verified. Please verify your account first.'
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'pay4me_secret_key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            verified: user.verified
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  } else if (action === 'resend-otp') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    try {
      // Generate new OTP
      const otp = generateOTP();
      const otpId = `otp_${Date.now()}`;

      // Get user to find email
      const userData = await kv.get(`user:${userId}`);
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = JSON.parse(userData);

      // Store new OTP
      await kv.set(`otp:${userId}`, JSON.stringify({
        otp,
        type: 'email',
        expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
        userId
      }));

      // Send OTP (simulated)
      await sendOTP(user.email, otp);

      res.json({
        success: true,
        message: 'New OTP sent successfully'
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
        error: error.message
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid auth action'
    });
  }
});

// Recharge endpoint
app.post('/api/recharge', async (req, res) => {
  // Verify token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pay4me_secret_key');
    req.user = decoded;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  const { type, network, phoneNumber, amount, reference, dataSize } = req.body;

  if (!type || !network || !phoneNumber || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  try {
    // Here you would integrate with ClubKonnect API
    // For now, we'll simulate a successful transaction

    const transaction = {
      id: `txn_${Date.now()}`,
      type,
      network,
      phoneNumber,
      amount: parseFloat(amount),
      dataSize: dataSize || null,
      reference: reference || `PAY4ME_${Date.now()}`,
      status: 'success',
      userId: req.user.userId,
      createdAt: new Date().toISOString()
    };

    // Store transaction
    await kv.set(`transaction:${transaction.id}`, JSON.stringify(transaction));

    res.json({
      success: true,
      message: `${type === 'airtime' ? 'Airtime' : 'Data'} purchase successful`,
      data: transaction
    });

  } catch (error) {
    console.error('Recharge error:', error);
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Pay4me API server running on port ${PORT}`);
});