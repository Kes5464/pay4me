// Health Check API - Test if backend is working
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const healthData = {
        status: 'healthy',
        message: 'UtilityHub Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        services: {
            paystack: {
                configured: !!process.env.PAYSTACK_SECRET_KEY,
                test_mode: process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test') || false
            },
            database: {
                configured: false, // TODO: Add when database is connected
                connected: false
            }
        },
        endpoints: [
            'GET /api/health',
            'POST /api/verify-payment',
            'POST /api/webhook/paystack'
        ]
    };

    res.status(200).json(healthData);
}