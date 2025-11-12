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
        message: 'Pay4me Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        services: {
            paystack: {
                configured: !!process.env.PAYSTACK_SECRET_KEY,
                test_mode: process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test') || false
            },
            hustlesim: {
                configured: !!process.env.HUSTLESIM_API_KEY,
                enabled: !!process.env.HUSTLESIM_API_KEY
            },
            database: {
                configured: false, // TODO: Add when database is connected
                connected: false
            }
        },
        endpoints: [
            'GET /api/health - Health check',
            'POST /api/recharge - Universal recharge endpoint',
            'GET /api/transactions - Transaction history',
            'GET /api/my-phone - Get saved phone',
            'POST /api/my-phone - Save phone number',
            'DELETE /api/my-phone - Delete saved phone',
            'POST /api/verify-payment - Verify Paystack payment',
            'POST /api/webhook/paystack - Payment webhooks'
        ],
        features: {
            airtime_recharge: true,
            data_purchase: true,
            my_phone_feature: true,
            transaction_history: true,
            paystack_integration: true,
            multi_provider_support: true,
            webhook_support: true
        }
    };

    res.status(200).json(healthData);
}