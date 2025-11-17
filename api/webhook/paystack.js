// Paystack Webhook Handler
// This endpoint receives notifications from Paystack about payment events

import crypto from 'crypto';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-paystack-signature');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify webhook signature
        const signature = req.headers['x-paystack-signature'];
        const secret = process.env.PAYSTACK_SECRET_KEY;
        
        if (!signature || !secret) {
            return res.status(400).json({ error: 'Missing signature or secret' });
        }

        const hash = crypto.createHmac('sha512', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        // Process webhook event
        const event = req.body;
        
        console.log('Webhook received:', event.event, event.data?.reference);

        switch (event.event) {
            case 'charge.success':
                await handleSuccessfulPayment(event.data);
                break;
            case 'charge.failed':
                await handleFailedPayment(event.data);
                break;
            case 'transfer.success':
                await handleSuccessfulTransfer(event.data);
                break;
            case 'transfer.failed':
                await handleFailedTransfer(event.data);
                break;
            default:
                console.log('Unhandled webhook event:', event.event);
        }

        res.status(200).json({ message: 'Webhook processed successfully' });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

async function handleSuccessfulPayment(data) {
    try {
        console.log('Processing successful payment:', data.reference);
        
        // TODO: Update database with payment status
        // TODO: Send confirmation SMS/email
        // TODO: Process actual service delivery
        
        const { metadata } = data;
        if (metadata) {
            console.log('Service details:', {
                type: metadata.type,
                network: metadata.network,
                phone: metadata.phone_number
            });
        }
        
    } catch (error) {
        console.error('Error processing successful payment:', error);
    }
}

async function handleFailedPayment(data) {
    try {
        console.log('Processing failed payment:', data.reference);
        
        // TODO: Update database with failed status
        // TODO: Send failure notification
        
    } catch (error) {
        console.error('Error processing failed payment:', error);
    }
}

async function handleSuccessfulTransfer(data) {
    console.log('Transfer successful:', data.reference);
    // TODO: Handle successful transfers (settlements)
}

async function handleFailedTransfer(data) {
    console.log('Transfer failed:', data.reference);
    // TODO: Handle failed transfers
}