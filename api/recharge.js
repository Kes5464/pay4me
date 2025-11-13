// Universal Recharge API Endpoint
// Handles both airtime and data recharge requests with real authentication

import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://pay4me.com.ng');
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
        // Verify authentication
        const authResult = verifyAuthentication(req);
        if (!authResult.success) {
            return res.status(401).json(authResult);
        }

        const { type, network, phoneNumber, amount, dataSize, reference } = req.body;

        // Validation
        const validationError = validateRechargeRequest(req.body);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        // Process the recharge (REAL PROVIDERS ONLY)
        let result;
        if (type === 'airtime') {
            result = await processAirtimeRecharge(network, phoneNumber, amount, reference, authResult.user);
        } else if (type === 'data') {
            result = await processDataRecharge(network, phoneNumber, dataSize, amount, reference, authResult.user);
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
                provider: result.provider,
                userId: authResult.user.userId,
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

// Verify user authentication
function verifyAuthentication(req) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            success: false,
            message: 'Authentication required. Please log in to make recharges.'
        };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pay4me_secret_key');
        return {
            success: true,
            user: decoded
        };
    } catch (error) {
        return {
            success: false,
            message: 'Invalid or expired token. Please log in again.'
        };
    }
}

// Process airtime recharge (REAL PROVIDERS ONLY - NO SIMULATION)
async function processAirtimeRecharge(network, phoneNumber, amount, reference, user) {
    console.log(`Processing REAL airtime: ${network} - ${phoneNumber} - ₦${amount} for user ${user.userId}`);
    
    // Try ClubKonnect API first (Your API key)
    if (process.env.CLUBKONNECT_API_KEY) {
        try {
            return await callClubKonnectAPI('airtime', network, phoneNumber, amount, reference);
        } catch (error) {
            console.log('ClubKonnect failed:', error.message);
        }
    }
    
    // Try HustleSIM API second
    if (process.env.HUSTLESIM_API_KEY) {
        try {
            return await callHustleSimAPI('airtime', network, phoneNumber, amount, reference);
        } catch (error) {
            console.log('HustleSIM failed:', error.message);
        }
    }
    
    // Try Paystack Bills API third
    if (process.env.PAYSTACK_SECRET_KEY) {
        try {
            return await callPaystackBills('airtime', network, phoneNumber, amount, reference);
        } catch (error) {
            console.log('Paystack Bills failed:', error.message);
        }
    }
    
    // Try VTPass API last
    if (process.env.VTPASS_API_KEY) {
        try {
            return await callVTPassAPI('airtime', network, phoneNumber, amount, reference);
        } catch (error) {
            console.log('VTPass failed:', error.message);
        }
    }
    
    // If all real providers fail, return error
    throw new Error('All recharge providers are currently unavailable. Please try again later or contact support.');
}

// Process data recharge (REAL PROVIDERS ONLY - NO SIMULATION)
async function processDataRecharge(network, phoneNumber, dataSize, amount, reference, user) {
    console.log(`Processing REAL data: ${network} - ${phoneNumber} - ${dataSize} - ₦${amount} for user ${user.userId}`);
    
    // Try ClubKonnect API first (Your API key)
    if (process.env.CLUBKONNECT_API_KEY) {
        try {
            return await callClubKonnectAPI('data', network, phoneNumber, amount, reference, dataSize);
        } catch (error) {
            console.log('ClubKonnect failed:', error.message);
        }
    }
    
    // Try HustleSIM API second
    if (process.env.HUSTLESIM_API_KEY) {
        try {
            return await callHustleSimAPI('data', network, phoneNumber, amount, reference, dataSize);
        } catch (error) {
            console.log('HustleSIM failed:', error.message);
        }
    }
    
    // Try Paystack Bills API third
    if (process.env.PAYSTACK_SECRET_KEY) {
        try {
            return await callPaystackBills('data', network, phoneNumber, amount, reference, dataSize);
        } catch (error) {
            console.log('Paystack Bills failed:', error.message);
        }
    }
    
    // Try VTPass API last
    if (process.env.VTPASS_API_KEY) {
        try {
            return await callVTPassAPI('data', network, phoneNumber, amount, reference, dataSize);
        } catch (error) {
            console.log('VTPass failed:', error.message);
        }
    }
    
    // If all real providers fail, return error
    throw new Error('All data providers are currently unavailable. Please try again later or contact support.');
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

// ClubKonnect API call (YOUR API KEY - Primary provider)
async function callClubKonnectAPI(type, network, phoneNumber, amount, reference, dataSize) {
    const baseURL = 'https://www.clubkonnect.com/api';
    
    // ClubKonnect network mapping
    const networkCodes = {
        'mtn': '01',
        'airtel': '04', 
        'glo': '02',
        '9mobile': '03'
    };

    const networkCode = networkCodes[network.toLowerCase()];
    if (!networkCode) {
        throw new Error(`Network ${network} not supported by ClubKonnect`);
    }

    let endpoint, payload;

    if (type === 'airtime') {
        endpoint = '/airtime/';
        payload = {
            network: networkCode,
            phone: phoneNumber,
            amount: amount,
            reference: reference
        };
    } else if (type === 'data') {
        endpoint = '/data/';
        
        // Map data size to ClubKonnect plan codes
        const dataPlanCode = getClubKonnectDataPlan(network, dataSize);
        
        payload = {
            network: networkCode,
            phone: phoneNumber,
            plan: dataPlanCode,
            reference: reference
        };
    } else {
        throw new Error('Invalid transaction type');
    }

    const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${process.env.CLUBKONNECT_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`ClubKonnect API failed: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    
    // Check if transaction was successful
    if (result.status === 'success' || result.status === 'successful') {
        return {
            transactionId: result.id || result.transaction_id || reference,
            confirmationCode: result.confirmation_code || result.reference || generateConfirmationCode(),
            status: 'completed',
            provider: 'ClubKonnect'
        };
    } else {
        throw new Error(`ClubKonnect transaction failed: ${result.message || 'Unknown error'}`);
    }
}

// Get ClubKonnect data plan codes
function getClubKonnectDataPlan(network, dataSize) {
    // ClubKonnect data plan codes (these may need to be updated based on their current offerings)
    const dataPlanCodes = {
        mtn: {
            '1GB': '11',    // MTN 1GB 30 days
            '2GB': '12',    // MTN 2GB 30 days  
            '5GB': '13',    // MTN 5GB 30 days
            '10GB': '14',   // MTN 10GB 30 days
            '500MB': '10'   // MTN 500MB 30 days
        },
        airtel: {
            '1GB': '21',    // Airtel 1GB 30 days
            '2GB': '22',    // Airtel 2GB 30 days
            '5GB': '23',    // Airtel 5GB 30 days
            '10GB': '24',   // Airtel 10GB 30 days
            '500MB': '20'   // Airtel 500MB 30 days
        },
        glo: {
            '1GB': '31',    // Glo 1GB 30 days
            '2GB': '32',    // Glo 2GB 30 days
            '5GB': '33',    // Glo 5GB 30 days
            '10GB': '34',   // Glo 10GB 30 days
            '500MB': '30'   // Glo 500MB 30 days
        },
        '9mobile': {
            '1GB': '41',    // 9mobile 1GB 30 days
            '2GB': '42',    // 9mobile 2GB 30 days
            '5GB': '43',    // 9mobile 5GB 30 days
            '10GB': '44',   // 9mobile 10GB 30 days
            '500MB': '40'   // 9mobile 500MB 30 days
        }
    };
    
    const planCode = dataPlanCodes[network.toLowerCase()]?.[dataSize];
    if (!planCode) {
        throw new Error(`Data plan ${dataSize} not available for ${network} on ClubKonnect`);
    }
    
    return planCode;
}

// HustleSIM API call (Nigerian provider)
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
        const error = await response.json().catch(() => ({}));
        throw new Error(`HustleSIM API failed: ${error.message || response.statusText}`);
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
        const error = await response.json().catch(() => ({}));
        throw new Error(`Paystack Bills API failed: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return {
        transactionId: result.data.reference,
        confirmationCode: result.data.verification_reference,
        status: result.data.status,
        provider: 'Paystack'
    };
}

// VTPass API call (Nigerian provider)
async function callVTPassAPI(type, network, phoneNumber, amount, reference, dataSize) {
    const serviceCode = getVTPassServiceCode(type, network);
    
    const response = await fetch('https://vtpass.com/api/pay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.VTPASS_API_KEY}`,
            'api-key': process.env.VTPASS_API_KEY,
            'secret-key': process.env.VTPASS_SECRET_KEY
        },
        body: JSON.stringify({
            serviceID: serviceCode,
            billersCode: phoneNumber,
            variation_code: dataSize || 'airtime',
            amount: amount,
            phone: phoneNumber,
            request_id: reference
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`VTPass API failed: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return {
        transactionId: result.requestId,
        confirmationCode: result.transactionId,
        status: result.code === '000' ? 'completed' : 'failed',
        provider: 'VTPass'
    };
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
    // Map data sizes to provider item codes
    const dataCodes = {
        mtn: {
            '1GB': 'mtn-1gb-30days',
            '2GB': 'mtn-2gb-30days',
            '5GB': 'mtn-5gb-30days',
            '10GB': 'mtn-10gb-30days'
        },
        airtel: {
            '1GB': 'airtel-1gb-30days',
            '2GB': 'airtel-2gb-30days',
            '5GB': 'airtel-5gb-30days',
            '10GB': 'airtel-10gb-30days'
        },
        glo: {
            '1GB': 'glo-1gb-30days',
            '2GB': 'glo-2gb-30days',
            '5GB': 'glo-5gb-30days',
            '10GB': 'glo-10gb-30days'
        }
    };
    
    return dataCodes[network.toLowerCase()]?.[dataSize] || `${network.toLowerCase()}-${dataSize}`;
}

function getVTPassServiceCode(type, network) {
    const serviceCodes = {
        airtime: {
            mtn: 'mtn',
            airtel: 'airtel',
            glo: 'glo',
            '9mobile': '9mobile'
        },
        data: {
            mtn: 'mtn-data',
            airtel: 'airtel-data',
            glo: 'glo-data',
            '9mobile': '9mobile-data'
        }
    };
    
    return serviceCodes[type]?.[network.toLowerCase()] || 'unknown';
}