// Paystack Payment Integration Service
class PaystackPaymentService {
    constructor() {
        // Use configuration from config.js
        this.publicKey = CONFIG?.paystack?.publicKey || 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
        
        // Payment configuration
        this.config = {
            currency: CONFIG?.paystack?.currency || 'NGN',
            channels: CONFIG?.paystack?.channels || ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
            split_code: '', // Optional: for splitting payments
        };
        
        this.isTestMode = this.publicKey.startsWith('pk_test');
        this.isConfigured = this.publicKey !== 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY_HERE';
    }

    // Initialize payment with Paystack
    async initializePayment(paymentData) {
        // Check if Paystack is properly configured
        if (!this.isConfigured) {
            throw new Error('Paystack is not configured. Please add your API keys in js/config.js');
        }

        const {
            email,
            amount,
            phoneNumber,
            type, // 'airtime' or 'data'
            network,
            plan = null
        } = paymentData;

        // Validate required fields
        if (!email || !amount || !phoneNumber || !type || !network) {
            throw new Error('Missing required payment fields');
        }

        // Convert amount to kobo (Paystack uses kobo)
        const amountInKobo = Math.round(amount * 100);

        // Generate unique reference
        const reference = this.generateReference(type, network);

        // Payment metadata
        const metadata = {
            type: type,
            network: network,
            phone_number: phoneNumber,
            plan_id: plan?.id || null,
            plan_name: plan?.name || null,
            custom_fields: [
                {
                    display_name: "Service Type",
                    variable_name: "service_type",
                    value: type === 'airtime' ? 'Airtime Recharge' : 'Data Purchase'
                },
                {
                    display_name: "Network",
                    variable_name: "network",
                    value: network.toUpperCase()
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone_number",
                    value: phoneNumber
                }
            ]
        };

        // Paystack payment configuration
        const paystackConfig = {
            key: this.publicKey,
            email: email,
            amount: amountInKobo,
            currency: this.config.currency,
            ref: reference,
            channels: this.config.channels,
            metadata: metadata,
            label: `UtilityHub - ${type === 'airtime' ? 'Airtime' : 'Data'} Purchase`,
            
            // Success callback
            onSuccess: (transaction) => {
                this.handlePaymentSuccess(transaction, paymentData);
            },
            
            // Close callback
            onClose: () => {
                this.handlePaymentClose();
            }
        };

        // Open Paystack payment modal
        const handler = PaystackPop.setup(paystackConfig);
        handler.openIframe();

        return {
            reference: reference,
            amount: amount,
            amountInKobo: amountInKobo
        };
    }

    // Handle successful payment
    async handlePaymentSuccess(transaction, originalPaymentData) {
        console.log('Payment successful:', transaction);
        
        try {
            // Show loading state
            this.showPaymentStatus('processing', 'Processing your payment...');

            // Verify payment on backend (important for security)
            const verificationResult = await this.verifyPayment(transaction.reference);
            
            if (verificationResult.success) {
                // Process the actual service (airtime/data purchase)
                const serviceResult = await this.processService(transaction, originalPaymentData);
                
                if (serviceResult.success) {
                    this.showPaymentStatus('success', 'Payment successful! Your request is being processed.');
                    this.saveTransactionLocally(transaction, originalPaymentData, 'success');
                    
                    // Redirect to success page or show receipt
                    setTimeout(() => {
                        this.showTransactionReceipt(transaction, originalPaymentData, serviceResult);
                    }, 2000);
                } else {
                    this.showPaymentStatus('error', 'Payment received but service processing failed. Contact support.');
                    this.saveTransactionLocally(transaction, originalPaymentData, 'service_failed');
                }
            } else {
                this.showPaymentStatus('error', 'Payment verification failed. Please contact support.');
                this.saveTransactionLocally(transaction, originalPaymentData, 'verification_failed');
            }
            
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showPaymentStatus('error', 'An error occurred processing your payment. Please contact support.');
            this.saveTransactionLocally(transaction, originalPaymentData, 'processing_error');
        }
    }

    // Handle payment modal close
    handlePaymentClose() {
        console.log('Payment modal closed');
        this.showPaymentStatus('cancelled', 'Payment was cancelled.');
    }

    // Verify payment with backend
    async verifyPayment(reference) {
        try {
            // Check if API integration is enabled
            if (!CONFIG?.features?.enableAPIIntegration) {
                // Fallback to simulated verification for testing
                return {
                    success: true,
                    data: {
                        status: 'success',
                        reference: reference,
                        amount: 0,
                        gateway_response: 'Successful (Test Mode)'
                    }
                };
            }

            // Call backend API for verification
            const apiUrl = CONFIG?.api?.baseUrl || 'https://your-project.vercel.app/api';
            const response = await fetch(`${apiUrl}/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reference: reference })
            });

            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Payment verification error:', error);
            
            // Fallback for development/testing
            if (this.isTestMode) {
                return {
                    success: true,
                    data: {
                        status: 'success',
                        reference: reference,
                        gateway_response: 'Successful (Fallback Mode)'
                    }
                };
            }
            
            return { success: false, error: error.message };
        }
    }

    // Process the actual service (airtime/data)
    async processService(transaction, paymentData) {
        try {
            const { type, network, phoneNumber, plan } = paymentData;
            
            if (type === 'airtime') {
                return await this.processAirtimeRecharge(phoneNumber, transaction.amount / 100, network);
            } else if (type === 'data') {
                return await this.processDataPurchase(phoneNumber, plan, network);
            }
            
            return { success: false, message: 'Unknown service type' };
        } catch (error) {
            console.error('Service processing error:', error);
            return { success: false, message: error.message };
        }
    }

    // Process airtime recharge (would integrate with VTPass/etc)
    async processAirtimeRecharge(phoneNumber, amount, network) {
        // This would integrate with VTPass or similar service
        // For demo purposes, simulate success
        return {
            success: true,
            message: `₦${amount} airtime sent to ${phoneNumber}`,
            transaction_id: `AIR_${Date.now()}`,
            network: network,
            amount: amount,
            phone: phoneNumber
        };
    }

    // Process data purchase (would integrate with VTPass/etc)
    async processDataPurchase(phoneNumber, plan, network) {
        // This would integrate with VTPass or similar service
        // For demo purposes, simulate success
        return {
            success: true,
            message: `${plan.name} data plan activated on ${phoneNumber}`,
            transaction_id: `DATA_${Date.now()}`,
            network: network,
            plan: plan,
            phone: phoneNumber
        };
    }

    // Generate unique payment reference
    generateReference(type, network) {
        const prefix = type === 'airtime' ? 'AIR' : 'DATA';
        const networkCode = network.substring(0, 3).toUpperCase();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        
        return `${prefix}_${networkCode}_${timestamp}_${random}`;
    }

    // Show payment status messages
    showPaymentStatus(status, message) {
        // Remove any existing status message
        const existingStatus = document.querySelector('.payment-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create status message
        const statusDiv = document.createElement('div');
        statusDiv.className = 'payment-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;

        // Set status-specific styles
        switch (status) {
            case 'processing':
                statusDiv.style.background = '#f39c12';
                statusDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 20px; height: 20px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        ${message}
                    </div>
                `;
                break;
            case 'success':
                statusDiv.style.background = '#27ae60';
                statusDiv.innerHTML = `✅ ${message}`;
                break;
            case 'error':
                statusDiv.style.background = '#e74c3c';
                statusDiv.innerHTML = `❌ ${message}`;
                break;
            case 'cancelled':
                statusDiv.style.background = '#95a5a6';
                statusDiv.innerHTML = `⚠️ ${message}`;
                break;
        }

        // Add CSS animations
        if (!document.querySelector('#payment-status-styles')) {
            const style = document.createElement('style');
            style.id = 'payment-status-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(statusDiv);

        // Auto remove after 5 seconds (except for processing)
        if (status !== 'processing') {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 5000);
        }
    }

    // Save transaction locally
    saveTransactionLocally(transaction, paymentData, status) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        
        const transactionRecord = {
            id: transaction.reference,
            type: paymentData.type,
            network: paymentData.network,
            phone: paymentData.phoneNumber,
            amount: transaction.amount / 100,
            status: status,
            date: new Date().toISOString(),
            paystack_reference: transaction.reference
        };

        transactions.unshift(transactionRecord);
        
        // Keep only last 50 transactions
        if (transactions.length > 50) {
            transactions.splice(50);
        }
        
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    // Show transaction receipt
    showTransactionReceipt(transaction, paymentData, serviceResult) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; padding: 2rem; max-width: 400px; width: 90%; text-align: center;">
                <h3 style="color: #27ae60; margin-bottom: 1rem;">✅ Payment Successful!</h3>
                
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: left;">
                    <p style="margin: 0.3rem 0;"><strong>Reference:</strong> ${transaction.reference}</p>
                    <p style="margin: 0.3rem 0;"><strong>Service:</strong> ${paymentData.type === 'airtime' ? 'Airtime Recharge' : 'Data Purchase'}</p>
                    <p style="margin: 0.3rem 0;"><strong>Network:</strong> ${paymentData.network.toUpperCase()}</p>
                    <p style="margin: 0.3rem 0;"><strong>Phone:</strong> ${paymentData.phoneNumber}</p>
                    <p style="margin: 0.3rem 0;"><strong>Amount:</strong> ₦${(transaction.amount / 100).toLocaleString()}</p>
                    <p style="margin: 0.3rem 0;"><strong>Status:</strong> <span style="color: #27ae60;">Successful</span></p>
                    <p style="margin: 0.3rem 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button onclick="this.closest('div').parentElement.remove()" style="padding: 0.8rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                    <button onclick="window.print()" style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">Print</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Get user's email (for payment)
    getUserEmail() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return currentUser.email || prompt('Please enter your email address for payment:');
    }

    // Check if Paystack is loaded
    isPaystackLoaded() {
        return typeof PaystackPop !== 'undefined';
    }
}

// Initialize Paystack service
const paystackService = new PaystackPaymentService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaystackPaymentService;
}