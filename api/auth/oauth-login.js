// OAuth Authentication API Endpoint
// Handles Google and Facebook OAuth authentication

const { createHash, randomBytes } = require('crypto');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { id, email, name, picture, provider, verified } = req.body;

        // Validate required fields
        if (!id || !email || !name || !provider) {
            return res.status(400).json({
                success: false,
                error: 'Missing required user information'
            });
        }

        // Validate provider
        if (!['google', 'facebook'].includes(provider)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid OAuth provider'
            });
        }

        // Create user data structure
        const userData = {
            id: id,
            email: email.toLowerCase(),
            name: name,
            picture: picture || null,
            provider: provider,
            verified: verified || false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Generate a simple user token (in production, use proper JWT)
        const userToken = createHash('sha256')
            .update(`${userData.id}-${userData.email}-${Date.now()}`)
            .digest('hex');

        // In a real application, you would:
        // 1. Check if user exists in database
        // 2. Create new user if doesn't exist
        // 3. Update last login time
        // 4. Generate proper JWT token
        // 5. Store user session

        // For this demo, we'll simulate a successful OAuth login
        console.log('OAuth Login:', {
            provider: provider,
            email: userData.email,
            name: userData.name,
            timestamp: new Date().toISOString()
        });

        // Simulate database operations
        let userRecord = {
            ...userData,
            token: userToken,
            isNewUser: false
        };

        // Check if this is a new user (simulation)
        // In production, this would be a real database query
        const isExistingUser = Math.random() > 0.3; // 70% chance user exists

        if (!isExistingUser) {
            userRecord.isNewUser = true;
            console.log('New OAuth user registered:', userData.email);
        } else {
            console.log('Existing OAuth user logged in:', userData.email);
        }

        // Success response
        res.status(200).json({
            success: true,
            message: userRecord.isNewUser ? 'Account created successfully' : 'Login successful',
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
                provider: userData.provider,
                verified: userData.verified,
                isNewUser: userRecord.isNewUser
            },
            token: userToken,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

    } catch (error) {
        console.error('OAuth Login Error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Authentication failed',
            message: 'An error occurred during authentication. Please try again.'
        });
    }
};