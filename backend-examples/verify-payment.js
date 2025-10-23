// Simple Backend API for UtilityHub - Vercel Functions
// File: api/verify-payment.js

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://kes5464.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reference } = req.body;
        
        if (!reference) {
            return res.status(400).json({
                success: false,
                message: 'Payment reference is required'
            });
        }

        // Verify payment with Paystack using SECRET key
        const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await paystackResponse.json();

        if (result.status && result.data.status === 'success') {
            // Payment is verified - now process the service
            const { metadata } = result.data;
            
            // Extract service details from metadata
            const serviceType = metadata.type; // 'airtime' or 'data'
            const network = metadata.network;
            const phoneNumber = metadata.phone_number;
            const amount = result.data.amount / 100; // Convert from kobo to naira

            // TODO: Process actual service (integrate with VTPass, etc.)
            const serviceResult = await processService(serviceType, network, phoneNumber, amount);

            if (serviceResult.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and service processed',
                    data: {
                        transaction_id: result.data.reference,
                        amount: amount,
                        service: serviceResult.data
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Payment verified but service processing failed',
                    data: result.data
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

// Process actual services (integrate with VTPass, etc.)
async function processService(type, network, phoneNumber, amount) {
    try {
        if (type === 'airtime') {
            // TODO: Integrate with VTPass airtime API
            // For now, simulate success
            return {
                success: true,
                data: {
                    type: 'airtime',
                    network: network,
                    phone: phoneNumber,
                    amount: amount,
                    status: 'successful',
                    transaction_id: `AIR_${Date.now()}`
                }
            };
        } else if (type === 'data') {
            // TODO: Integrate with VTPass data API
            // For now, simulate success
            return {
                success: true,
                data: {
                    type: 'data',
                    network: network,
                    phone: phoneNumber,
                    plan: amount, // This would be actual plan details
                    status: 'successful',
                    transaction_id: `DATA_${Date.now()}`
                }
            };
        }
        
        return { success: false, message: 'Unknown service type' };
    } catch (error) {
        console.error('Service processing error:', error);
        return { success: false, message: error.message };
    }
}