// Backend API Service - Real Implementation
// This replaces the demo api-service.js with actual API calls

class ProductionAPIService {
    constructor() {
        // Production API endpoints
        this.config = {
            // Bills Payment API
            flutterwave: {
                publicKey: 'FLWPUBK_your_flutterwave_public_key',
                secretKey: 'FLWSECK_your_flutterwave_secret_key', // Keep on backend only
                baseUrl: 'https://api.flutterwave.com/v3'
            },
            
            // VTPass for utilities
            vtpass: {
                username: 'your_vtpass_username',
                password: 'your_vtpass_password',
                baseUrl: 'https://vtpass.com/api'
            }
        };
        
        // Your backend API URL
        this.backendUrl = 'https://your-backend-api.vercel.app/api';
    }

    // Process airtime recharge
    async rechargeAirtime(phoneNumber, amount, network) {
        try {
            const response = await fetch(`${this.backendUrl}/recharge/airtime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    amount: amount,
                    network: network.toLowerCase()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    transactionId: data.transaction_id,
                    message: 'Airtime recharge successful',
                    balance: data.balance
                };
            } else {
                throw new Error(data.message || 'Recharge failed');
            }
        } catch (error) {
            console.error('Airtime recharge error:', error);
            throw error;
        }
    }

    // Process data purchase
    async purchaseData(phoneNumber, planId, network) {
        try {
            const response = await fetch(`${this.backendUrl}/recharge/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                    plan_id: planId,
                    network: network.toLowerCase()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                return {
                    success: true,
                    transactionId: data.transaction_id,
                    message: 'Data purchase successful',
                    plan: data.plan_details
                };
            } else {
                throw new Error(data.message || 'Data purchase failed');
            }
        } catch (error) {
            console.error('Data purchase error:', error);
            throw error;
        }
    }

    // Get real data plans from API
    async getDataPlans(network) {
        try {
            const response = await fetch(`${this.backendUrl}/plans/data?network=${network}`);
            const data = await response.json();
            
            if (data.success) {
                return data.plans;
            } else {
                throw new Error('Failed to fetch data plans');
            }
        } catch (error) {
            console.error('Error fetching data plans:', error);
            // Return fallback plans
            return this.getFallbackDataPlans(network);
        }
    }

    // User authentication
    async loginUser(email, password) {
        try {
            const response = await fetch(`${this.backendUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data.user;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register new user
    async registerUser(userData) {
        try {
            const response = await fetch(`${this.backendUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data.user;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Get transaction history
    async getTransactionHistory() {
        try {
            const response = await fetch(`${this.backendUrl}/user/transactions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                return data.transactions;
            } else {
                throw new Error('Failed to fetch transactions');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    }

    // Verify payment status
    async verifyPayment(reference) {
        try {
            const response = await fetch(`${this.backendUrl}/payment/verify/${reference}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }

    // Fallback data plans (in case API fails)
    getFallbackDataPlans(network) {
        const plans = {
            mtn: [
                { id: 'mtn_1gb', name: '1GB Monthly', price: 1200, validity: '30 days', size: '1GB' },
                { id: 'mtn_2gb', name: '2GB Monthly', price: 2000, validity: '30 days', size: '2GB' },
                { id: 'mtn_5gb', name: '5GB Monthly', price: 4500, validity: '30 days', size: '5GB' }
            ],
            airtel: [
                { id: 'airtel_1gb', name: '1GB Monthly', price: 1100, validity: '30 days', size: '1GB' },
                { id: 'airtel_2gb', name: '2GB Monthly', price: 1900, validity: '30 days', size: '2GB' },
                { id: 'airtel_5gb', name: '5GB Monthly', price: 4200, validity: '30 days', size: '5GB' }
            ],
            glo: [
                { id: 'glo_1gb', name: '1GB Monthly', price: 1000, validity: '30 days', size: '1GB' },
                { id: 'glo_2gb', name: '2GB Monthly', price: 1800, validity: '30 days', size: '2GB' },
                { id: 'glo_5gb', name: '5GB Monthly', price: 4000, validity: '30 days', size: '5GB' }
            ]
        };
        
        return plans[network.toLowerCase()] || [];
    }
}

// Replace the demo API service with production version
const apiService = new ProductionAPIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionAPIService;
}