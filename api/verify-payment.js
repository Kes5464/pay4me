// Payment Verification API for UtilityHub
// Vercel Serverless Function

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
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
            const serviceType = metadata?.type || 'unknown';
            const network = metadata?.network || 'unknown';
            const phoneNumber = metadata?.phone_number || 'unknown';
            const amount = result.data.amount / 100; // Convert from kobo to naira

            // Process actual service (integrate with VTPass, etc.)
            const serviceResult = await processService(serviceType, network, phoneNumber, amount, metadata);

            if (serviceResult.success) {
                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and service processed successfully',
                    data: {
                        transaction_id: result.data.reference,
                        amount: amount,
                        currency: result.data.currency,
                        customer_email: result.data.customer.email,
                        service: serviceResult.data,
                        status: 'completed',
                        timestamp: new Date().toISOString()
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Payment verified but service processing failed',
                    data: {
                        transaction_id: result.data.reference,
                        error: serviceResult.message
                    }
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                error: result.message || 'Invalid transaction reference'
            });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during payment verification',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
        });
    }
}

// Process actual services (integrate with VTPass, etc.)
async function processService(type, network, phoneNumber, amount, metadata) {
    try {
        console.log(`Processing ${type} service for ${network} - ${phoneNumber} - ₦${amount}`);
        
        if (type === 'airtime') {
            // TODO: Integrate with VTPass airtime API
            // For now, simulate successful airtime recharge
            const transactionId = `AIR_${network.toUpperCase()}_${Date.now()}`;
            
            return {
                success: true,
                data: {
                    type: 'airtime',
                    network: network.toUpperCase(),
                    phone: phoneNumber,
                    amount: amount,
                    status: 'successful',
                    transaction_id: transactionId,
                    message: `₦${amount} airtime sent to ${phoneNumber} on ${network.toUpperCase()} network`,
                    confirmation_code: generateConfirmationCode(),
                    processed_at: new Date().toISOString()
                }
            };
        } else if (type === 'data') {
            // TODO: Integrate with VTPass data API
            // For now, simulate successful data purchase
            const transactionId = `DATA_${network.toUpperCase()}_${Date.now()}`;
            const planName = metadata?.plan_name || `₦${amount} Data Plan`;
            
            return {
                success: true,
                data: {
                    type: 'data',
                    network: network.toUpperCase(),
                    phone: phoneNumber,
                    plan: planName,
                    status: 'successful',
                    transaction_id: transactionId,
                    message: `${planName} activated on ${phoneNumber} (${network.toUpperCase()})`,
                    confirmation_code: generateConfirmationCode(),
                    processed_at: new Date().toISOString()
                }
            };
        }
        
        return { 
            success: false, 
            message: `Unknown service type: ${type}` 
        };
    } catch (error) {
        console.error('Service processing error:', error);
        return { 
            success: false, 
            message: `Service processing failed: ${error.message}` 
        };
    }
}

// Generate confirmation code
function generateConfirmationCode() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}