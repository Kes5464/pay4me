// Configuration file for Pay4me
// Add your actual API keys here

const CONFIG = {
    // PAYSTACK CONFIGURATION
    paystack: {
        // Replace with your actual Paystack public key
        // Get this from: https://dashboard.paystack.com/settings/developer
        publicKey: 'pk_test_fc5d880b0aac33002cd4d2550c247e6e165ec312',
        
        // Currency (NGN for Nigeria)
        currency: 'NGN',
        
        // Payment channels to accept
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    },

    // OAUTH AUTHENTICATION SETTINGS
    oauth: {
        google: {
            // Get from: https://console.developers.google.com
            // Create OAuth 2.0 Client ID for Web Application
            clientId: 'YOUR_GOOGLE_CLIENT_ID.googleusercontent.com',
            scope: 'email profile'
        },
        facebook: {
            // Get from: https://developers.facebook.com
            // Create Facebook App and get App ID
            appId: 'YOUR_FACEBOOK_APP_ID',
            scope: 'email,public_profile'
        }
    },

    // APPLICATION SETTINGS
    app: {
        name: 'Pay4me',
        version: '1.0.0',
        environment: 'production', // 'test' or 'production'
        
        // Minimum and maximum transaction amounts
        limits: {
            airtime: {
                min: 50,
                max: 10000
            },
            data: {
                min: 100,
                max: 50000
            }
        }
    },

    // BUSINESS SETTINGS
    business: {
        // Commission rates (percentage)
        commission: {
            airtime: 2.0, // 2% commission
            data: 5.0     // 5% commission
        },
        
        // Transaction fees (in Naira)
        transactionFee: 50,
        
        // Business information
        info: {
            name: 'Pay4me',
            email: 'support@pay4me.com.ng',
            phone: '+234XXXXXXXXXX',
            address: 'Your Business Address'
        }
    },

    // API ENDPOINTS (for production)
    api: {
        baseUrl: 'https://api.pay4me.com.ng',
        endpoints: {
            health: '/health',
            verify: '/verify-payment',
            webhook: '/webhook/paystack',
            airtime: '/recharge/airtime',
            data: '/recharge/data'
        }
    },

    // FEATURE FLAGS
    features: {
        enablePayments: true,
        enableAPIIntegration: true, // Backend URL configured
        enableSMS: false,
        enableEmail: false,
        enablePushNotifications: false,
        enableExternalAPIs: false, // Disable external APIs to prevent CORS issues
        enableRealTimeFeatures: false, // Disable real-time widgets temporarily
        enableUtilityWidget: false // Disable utility widget temporarily
    }
};

// Validation function
function validateConfig() {
    const errors = [];
    
    // Check Paystack key
    if (CONFIG.paystack.publicKey === 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE') {
        errors.push('Please update your Paystack public key in js/config.js');
    }
    
    // Check if key format is correct
    if (!CONFIG.paystack.publicKey.startsWith('pk_')) {
        errors.push('Invalid Paystack public key format');
    }
    
    return errors;
}

// Auto-validate on load
document.addEventListener('DOMContentLoaded', function() {
    const errors = validateConfig();
    if (errors.length > 0) {
        console.warn('Configuration issues found:');
        errors.forEach(error => console.warn(`- ${error}`));
        
        // Show warning to user if payments are enabled
        if (CONFIG.features.enablePayments) {
            const notice = document.createElement('div');
            notice.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f39c12;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 9999;
                font-weight: bold;
            `;
            notice.textContent = 'Configuration incomplete - Please update your API keys';
            document.body.appendChild(notice);
        }
    }
});

// Export config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}