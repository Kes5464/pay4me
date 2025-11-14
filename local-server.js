// Simple local test server for registration
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for testing
const users = new Map();
const otps = new Map();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for testing
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

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
  console.log('Received auth request:', req.method, req.url, req.query, req.body);
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
      if (users.has(email)) {
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
      users.set(email, user);
      users.set(phone, user);

      // Generate OTP
      const otp = generateOTP();

      // Store OTP
      otps.set(userId, {
        otp,
        type: verificationType || 'email',
        expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
        userId
      });

      console.log(`OTP for ${email}: ${otp}`); // For testing

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
      const otpData = otps.get(userId);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP not found or expired'
        });
      }

      if (otpData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }

      if (Date.now() > otpData.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }

      // Get user and update verification status
      const user = users.get(otpData.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.verified = true;

      // Clean up OTP
      otps.delete(userId);

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
      const user = users.get(identifier);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

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
        'pay4me_secret_key',
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

      // Get user to find email
      const user = Array.from(users.values()).find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Store new OTP
      otps.set(userId, {
        otp,
        type: 'email',
        expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
        userId
      });

      console.log(`New OTP for ${user.email}: ${otp}`); // For testing

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
    const decoded = jwt.verify(token, 'pay4me_secret_key');
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
    // Simulate successful transaction
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
  console.log('Registration API is ready for testing');
});