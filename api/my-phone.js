// My Phone Management API
// REST endpoint to save/get/delete user's phone number

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGetPhone(req, res);
            case 'POST':
                return handleSavePhone(req, res);
            case 'DELETE':
                return handleDeletePhone(req, res);
            default:
                return res.status(405).json({ 
                    success: false, 
                    message: 'Method not allowed' 
                });
        }
    } catch (error) {
        console.error('My Phone API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

// GET /api/my-phone - Retrieve saved phone number
function handleGetPhone(req, res) {
    const userId = req.query.userId || 'anonymous';
    
    // In production, you'd get this from a database
    // For now, we'll simulate with a simple response
    
    return res.status(200).json({
        success: true,
        message: 'Phone number retrieved successfully',
        data: {
            userId: userId,
            phoneNumber: null, // Would be retrieved from database
            network: null,
            savedAt: null,
            lastUsed: null
        }
    });
}

// POST /api/my-phone - Save phone number
function handleSavePhone(req, res) {
    const { phoneNumber, network, userId } = req.body;
    
    // Validation
    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            message: 'Phone number is required'
        });
    }

    if (!validateNigerianPhone(phoneNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Nigerian phone number format'
        });
    }

    // Auto-detect network if not provided
    const detectedNetwork = network || detectNetworkFromPhone(phoneNumber);

    // In production, you'd save this to a database
    const savedData = {
        userId: userId || 'anonymous',
        phoneNumber: phoneNumber,
        network: detectedNetwork,
        savedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
    };

    return res.status(200).json({
        success: true,
        message: 'Phone number saved successfully',
        data: savedData
    });
}

// DELETE /api/my-phone - Delete saved phone number
function handleDeletePhone(req, res) {
    const userId = req.query.userId || 'anonymous';
    
    // In production, you'd delete from database
    
    return res.status(200).json({
        success: true,
        message: 'Phone number deleted successfully',
        data: {
            userId: userId,
            deletedAt: new Date().toISOString()
        }
    });
}

// Validate Nigerian phone number
function validateNigerianPhone(phone) {
    const phoneRegex = /^(0[789][01]|0[789][0-9])\d{8}$/;
    return phoneRegex.test(phone);
}

// Detect network from phone number
function detectNetworkFromPhone(phoneNumber) {
    const mtnPrefixes = ['0803', '0806', '0703', '0706', '0813', '0816', '0814', '0810', '0903', '0906'];
    const airtelPrefixes = ['0802', '0808', '0708', '0701', '0812', '0901', '0902', '0904', '0907'];
    const gloPrefixes = ['0805', '0807', '0705', '0815', '0811', '0905'];
    const nineMobilePrefixes = ['0809', '0817', '0818', '0909', '0908'];
    
    const prefix = phoneNumber.substring(0, 4);
    
    if (mtnPrefixes.includes(prefix)) return 'mtn';
    if (airtelPrefixes.includes(prefix)) return 'airtel';
    if (gloPrefixes.includes(prefix)) return 'glo';
    if (nineMobilePrefixes.includes(prefix)) return '9mobile';
    
    return 'unknown';
}