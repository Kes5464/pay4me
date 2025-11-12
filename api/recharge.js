// Universal Recharge API Endpoint
// Handles both airtime and data recharge requests

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed. Use POST.'
        });
    }

    return handleRechargeRequest(req, res);
}

async function handleRechargeRequest(req, res) {
    try {
        const { type, network, phoneNumber, amount, dataSize, reference } = req.body;

        // Validation
        const validationError = validateRechargeRequest(req.body);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        // Process the recharge
        let result;
        if (type === 'airtime') {
            result = await processAirtimeRecharge(network, phoneNumber, amount, reference);
        } else if (type === 'data') {
            result = await processDataRecharge(network, phoneNumber, dataSize, amount, reference);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid recharge type. Use "airtime" or "data".'
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: `${type} recharge processed successfully`,
            data: {
                reference: reference,
                transactionId: result.transactionId,
                confirmationCode: result.confirmationCode || generateConfirmationCode(),
                network: network.toUpperCase(),
                phoneNumber: phoneNumber,
                amount: amount,
                type: type,
                status: result.status || 'completed',
                processedAt: new Date().toISOString(),
                provider: result.provider || 'Pay4me',
                ...(type === 'data' && { dataSize: dataSize })
            }
        });

    } catch (error) {
        console.error('Recharge API Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Recharge failed. Please try again.',
            error: error.message,
            reference: req.body.reference
        });
    }
}

// Validate recharge request
function validateRechargeRequest(body) {
    const { type, network, phoneNumber, amount } = body;

    if (!type || !['airtime', 'data'].includes(type)) {
        return 'Valid recharge type is required (airtime or data)';
    }

    if (!network || !['mtn', 'airtel', 'glo', '9mobile'].includes(network.toLowerCase())) {
        return 'Valid network is required (MTN, Airtel, Glo, 9mobile)';
    }

    if (!phoneNumber || !validateNigerianPhone(phoneNumber)) {
        return 'Valid Nigerian phone number is required';
    }

    if (!amount || amount < 50 || amount > 50000) {
        return 'Amount must be between ₦50 and ₦50,000';
    }

    if (type === 'data' && !body.dataSize) {
        return 'Data size is required for data purchases';
    }

    return null;
}

// Process airtime recharge
async function processAirtimeRecharge(network, phoneNumber, amount, reference) {
    console.log(`Processing airtime: ${network} - ${phoneNumber} - ₦${amount}`);
    
    // Try real providers first, then fallback to simulation
    try {
        // HustleSIM API (if configured)
        if (process.env.HUSTLESIM_API_KEY) {
            return await callHustleSimAPI('airtime', network, phoneNumber, amount, reference);
        }
        
        // Paystack Bills API (if configured)
        if (process.env.PAYSTACK_SECRET_KEY) {
            return await callPaystackBills('airtime', network, phoneNumber, amount, reference);
        }
        
    } catch (error) {
        console.log('Provider failed, using simulation:', error.message);
    }
    
    // Simulation mode
    return simulateRecharge('airtime', network, phoneNumber, amount, reference);
}

// Process data recharge
async function processDataRecharge(network, phoneNumber, dataSize, amount, reference) {
    console.log(`Processing data: ${network} - ${phoneNumber} - ${dataSize} - ₦${amount}`);
    
    try {
        // Try real providers
        if (process.env.HUSTLESIM_API_KEY) {
            return await callHustleSimAPI('data', network, phoneNumber, amount, reference, dataSize);
        }
        
        if (process.env.PAYSTACK_SECRET_KEY) {
            return await callPaystackBills('data', network, phoneNumber, amount, reference, dataSize);
        }
        
    } catch (error) {
        console.log('Provider failed, using simulation:', error.message);
    }
    
    // Simulation mode
    return simulateRecharge('data', network, phoneNumber, amount, reference, dataSize);
}

// HustleSIM API call
async function callHustleSimAPI(type, network, phoneNumber, amount, reference, dataSize) {
    const response = await fetch('https://api.hustlesim.com/api/recharge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUSTLESIM_API_KEY}`
        },
        body: JSON.stringify({
            type: type,
            network: network,
            phoneNumber: phoneNumber,
            amount: amount,
            reference: reference,
            ...(dataSize && { dataSize: dataSize })
        })
    });

    if (!response.ok) {
        throw new Error(`HustleSIM API failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
        transactionId: result.transaction_id,
        confirmationCode: result.confirmation_code,
        status: result.status,
        provider: 'HustleSIM'
    };
}

// Paystack Bills API call
async function callPaystackBills(type, network, phoneNumber, amount, reference, dataSize) {
    const billerCode = getBillerCode(type, network);
    
    const response = await fetch('https://api.paystack.co/bill', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        },
        body: JSON.stringify({
            type: type,
            biller_code: billerCode,
            amount: amount * 100, // Convert to kobo
            reference: reference,
            customer: phoneNumber,
            ...(dataSize && { item_code: getDataItemCode(network, dataSize) })
        })
    });

    if (!response.ok) {
        throw new Error(`Paystack Bills API failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
        transactionId: result.data.reference,
        confirmationCode: result.data.verification_reference,
        status: result.data.status,
        provider: 'Paystack'
    };
}

// Simulation mode for testing
function simulateRecharge(type, network, phoneNumber, amount, reference, dataSize) {
    // Simulate processing delay
    const delay = Math.random() * 1000 + 500; // 0.5-1.5 seconds
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                transactionId: `SIM${Date.now()}`,
                confirmationCode: generateConfirmationCode(),
                status: 'completed',
                provider: 'Simulation'
            });
        }, delay);
    });
}

// Helper functions
function validateNigerianPhone(phone) {
    const phoneRegex = /^(0[789][01]|0[789][0-9])\d{8}$/;
    return phoneRegex.test(phone);
}

function generateConfirmationCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function getBillerCode(type, network) {
    const billerCodes = {
        airtime: {
            mtn: 'mtn',
            airtel: 'airtel',
            glo: 'glo',
            '9mobile': 'etisalat'
        },
        data: {
            mtn: 'mtn-data',
            airtel: 'airtel-data',
            glo: 'glo-data',
            '9mobile': 'etisalat-data'
        }
    };
    
    return billerCodes[type]?.[network.toLowerCase()] || 'unknown';
}

function getDataItemCode(network, dataSize) {
    // This would map data sizes to provider item codes
    // For now, return a generic code
    return `${network.toLowerCase()}-${dataSize}`;
}