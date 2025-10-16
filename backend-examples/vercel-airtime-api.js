// Vercel Serverless Function - Backend API
// File: api/recharge/airtime.js

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, amount, network } = req.body;
        
        // Validate input
        if (!phone || !amount || !network) {
            return res.status(400).json({
                success: false,
                message: 'Phone, amount, and network are required'
            });
        }

        // Process with Flutterwave Bills API
        const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
            },
            body: JSON.stringify({
                country: 'NG',
                customer: phone,
                amount: amount,
                type: 'AIRTIME',
                reference: `airtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            })
        });

        const result = await flutterwaveResponse.json();

        if (result.status === 'success') {
            // Save transaction to database here
            
            return res.status(200).json({
                success: true,
                transaction_id: result.data.reference,
                message: 'Airtime recharge successful',
                balance: result.data.phone_number,
                network: network,
                amount: amount
            });
        } else {
            return res.status(400).json({
                success: false,
                message: result.message || 'Recharge failed'
            });
        }

    } catch (error) {
        console.error('Airtime recharge error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}