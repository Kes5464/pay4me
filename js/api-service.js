// API Configuration and Service Layer
// This file handles all external API integrations for UtilityHub

// API Configuration
const API_CONFIG = {
    // Exchange rates for currency conversion (Free API)
    exchangeRate: {
        baseUrl: 'https://api.exchangerate-api.com/v4/latest',
        baseCurrency: 'USD'
    },
    
    // IP Geolocation for user location (Free tier: 1000 requests/day)
    ipGeolocation: {
        baseUrl: 'https://ipapi.co',
        format: 'json'
    },
    
    // Phone number validation and carrier detection
    phoneValidation: {
        baseUrl: 'https://phonevalidation.abstractapi.com/v1',
        // Get your free API key from abstractapi.com
        apiKey: 'YOUR_API_KEY_HERE' // Replace with actual API key
    },
    
    // Utility bills API simulation (using JSONPlaceholder for demo)
    utilityDemo: {
        baseUrl: 'https://jsonplaceholder.typicode.com'
    },
    
    // Free SMS service for notifications (demo endpoints)
    smsService: {
        baseUrl: 'https://api.twilio.com/2010-04-01', // Requires Twilio account
        // Note: Twilio requires paid account, but we'll simulate for demo
    },
    
    // Free Weather API for location-based services
    weather: {
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        // Free tier: 1000 calls/day, no API key needed for basic usage
        fallbackUrl: 'https://wttr.in' // Alternative free weather service
    },
    
    // Free Cryptocurrency prices (for digital payments future feature)
    crypto: {
        baseUrl: 'https://api.coingecko.com/api/v3',
        // Free tier: No API key needed, good rate limits
    },
    
    // Free QR Code generation for payment receipts
    qrCode: {
        baseUrl: 'https://api.qrserver.com/v1/create-qr-code',
        // Completely free, no limits
    },
    
    // Free JSON validation and utility services
    jsonUtils: {
        baseUrl: 'https://httpbin.org', // For testing and utilities
    },
    
    // Free Nigerian bank code API
    bankCodes: {
        baseUrl: 'https://api.paystack.co/bank', // Free bank list API
    },
    
    // Free time/date API
    timeApi: {
        baseUrl: 'https://worldtimeapi.org/api',
        // Completely free, no rate limits
    }
};

// API Service Class
class UtilityAPIService {
    constructor() {
        this.requestTimeout = 10000; // 10 seconds timeout
        this.retryAttempts = 3;
    }

    // Generic API request handler
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            timeout: this.requestTimeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'UtilityHub/1.0'
            }
        };

        const requestOptions = { ...defaultOptions, ...options };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);

            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw this.handleAPIError(error);
        }
    }

    // Handle API errors gracefully
    handleAPIError(error) {
        if (error.name === 'AbortError') {
            return new Error('Request timed out. Please try again.');
        }
        
        if (!navigator.onLine) {
            return new Error('No internet connection. Please check your network.');
        }

        return new Error(error.message || 'Service temporarily unavailable. Please try again later.');
    }

    // Get real-time exchange rates
    async getExchangeRates(baseCurrency = 'USD') {
        try {
            const url = `${API_CONFIG.exchangeRate.baseUrl}/${baseCurrency}`;
            const data = await this.makeRequest(url);
            
            // Convert to Nigerian Naira if not already
            const ngnRate = data.rates.NGN || 1600; // Fallback rate
            
            return {
                success: true,
                rates: data.rates,
                ngnRate: ngnRate,
                lastUpdated: data.date
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                ngnRate: 1600 // Fallback rate
            };
        }
    }

    // Get user's location for localized services
    async getUserLocation() {
        try {
            const data = await this.makeRequest(`${API_CONFIG.ipGeolocation.baseUrl}/${API_CONFIG.ipGeolocation.format}`);
            
            return {
                success: true,
                country: data.country_name,
                countryCode: data.country_code,
                city: data.city,
                region: data.region,
                timezone: data.timezone,
                currency: data.currency
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                // Default to Nigeria
                country: 'Nigeria',
                countryCode: 'NG',
                city: 'Lagos',
                currency: 'NGN'
            };
        }
    }

    // Validate phone number and detect carrier
    async validatePhoneNumber(phoneNumber) {
        try {
            // Clean the phone number
            const cleanNumber = phoneNumber.replace(/\D/g, '');
            
            // Use local validation for Nigerian numbers (free)
            const nigerianValidation = this.validateNigerianNumber(cleanNumber);
            
            if (nigerianValidation.isValid) {
                return {
                    success: true,
                    isValid: true,
                    carrier: nigerianValidation.carrier,
                    number: nigerianValidation.formatted,
                    country: 'Nigeria'
                };
            }

            // If API key is available, use external validation
            if (API_CONFIG.phoneValidation.apiKey !== 'YOUR_API_KEY_HERE') {
                const url = `${API_CONFIG.phoneValidation.baseUrl}/?api_key=${API_CONFIG.phoneValidation.apiKey}&phone=${phoneNumber}`;
                const data = await this.makeRequest(url);
                
                return {
                    success: true,
                    isValid: data.valid,
                    carrier: data.carrier,
                    number: data.format.international,
                    country: data.country.name
                };
            }

            return nigerianValidation;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                isValid: false
            };
        }
    }

    // Local Nigerian number validation (free)
    validateNigerianNumber(cleanNumber) {
        const carriers = {
            mtn: {
                name: 'MTN Nigeria',
                prefixes: ['0803', '0806', '0703', '0706', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
                color: '#ffcc00'
            },
            airtel: {
                name: 'Airtel Nigeria',
                prefixes: ['0802', '0808', '0708', '0812', '0701', '0901', '0902', '0904', '0907', '0912'],
                color: '#ff0000'
            },
            glo: {
                name: 'Globacom Nigeria',
                prefixes: ['0805', '0807', '0811', '0815', '0705', '0905', '0915'],
                color: '#00cc44'
            },
            '9mobile': {
                name: '9mobile Nigeria',
                prefixes: ['0809', '0818', '0817', '0909', '0908'],
                color: '#00aa00'
            }
        };

        // Check if number is 11 digits starting with 0
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith('0')) {
            return {
                success: true,
                isValid: false,
                error: 'Nigerian numbers should be 11 digits starting with 0'
            };
        }

        const prefix = cleanNumber.substring(0, 4);
        
        for (const [carrierKey, carrier] of Object.entries(carriers)) {
            if (carrier.prefixes.includes(prefix)) {
                return {
                    success: true,
                    isValid: true,
                    carrier: carrier.name,
                    carrierCode: carrierKey,
                    formatted: `+234${cleanNumber.substring(1)}`,
                    local: cleanNumber,
                    color: carrier.color
                };
            }
        }

        return {
            success: true,
            isValid: false,
            error: 'Unknown Nigerian network prefix'
        };
    }

    // Get network coverage and status
    async getNetworkStatus() {
        try {
            // Simulate network status check using a demo API
            const data = await this.makeRequest(`${API_CONFIG.utilityDemo.baseUrl}/posts/1`);
            
            // Generate realistic network status
            const networks = [
                { name: 'MTN', status: 'excellent', uptime: 99.2, speed: '4G+' },
                { name: 'Airtel', status: 'good', uptime: 98.7, speed: '4G' },
                { name: 'Glo', status: 'fair', uptime: 97.1, speed: '4G' },
                { name: '9mobile', status: 'good', uptime: 98.3, speed: '4G' }
            ];

            return {
                success: true,
                networks: networks,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Process airtime purchase (simulation with API integration)
    async processAirtimePurchase(phoneNumber, amount, network) {
        try {
            // Validate phone number first
            const validation = await this.validatePhoneNumber(phoneNumber);
            
            if (!validation.isValid) {
                throw new Error('Invalid phone number');
            }

            // Simulate API call to airtime service
            const transactionData = {
                phoneNumber: phoneNumber,
                amount: amount,
                network: network,
                timestamp: new Date().toISOString(),
                transactionId: this.generateTransactionId(),
                status: 'pending'
            };

            // Simulate processing delay
            await this.delay(2000);

            // Simulate success/failure (95% success rate)
            if (Math.random() > 0.05) {
                return {
                    success: true,
                    transaction: {
                        ...transactionData,
                        status: 'completed',
                        confirmationCode: this.generateConfirmationCode()
                    },
                    message: `Airtime recharge of ₦${amount} successful`
                };
            } else {
                throw new Error('Transaction failed. Please try again.');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                transaction: null
            };
        }
    }

    // Process data purchase
    async processDataPurchase(phoneNumber, dataSize, network, amount) {
        try {
            const validation = await this.validatePhoneNumber(phoneNumber);
            
            if (!validation.isValid) {
                throw new Error('Invalid phone number');
            }

            const transactionData = {
                phoneNumber: phoneNumber,
                dataSize: dataSize,
                amount: amount,
                network: network,
                timestamp: new Date().toISOString(),
                transactionId: this.generateTransactionId(),
                status: 'pending'
            };

            await this.delay(2500);

            if (Math.random() > 0.03) { // 97% success rate for data
                return {
                    success: true,
                    transaction: {
                        ...transactionData,
                        status: 'completed',
                        confirmationCode: this.generateConfirmationCode()
                    },
                    message: `${dataSize} data bundle purchase successful`
                };
            } else {
                throw new Error('Data purchase failed. Please try again.');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                transaction: null
            };
        }
    }

    // Get current data plans from API
    async getDataPlans(network) {
        try {
            // In a real implementation, this would fetch from telecom APIs
            const plans = {
                mtn: [
                    { size: '350MB', price: 100, validity: '1 day', type: 'night' },
                    { size: '1GB', price: 500, validity: '30 days', type: 'regular' },
                    { size: '2GB', price: 1000, validity: '30 days', type: 'regular' },
                    { size: '5GB', price: 2000, validity: '30 days', type: 'regular' },
                    { size: '10GB', price: 3500, validity: '30 days', type: 'premium' }
                ],
                airtel: [
                    { size: '300MB', price: 100, validity: '3 days', type: 'starter' },
                    { size: '1GB', price: 450, validity: '30 days', type: 'regular' },
                    { size: '2GB', price: 900, validity: '30 days', type: 'regular' },
                    { size: '5GB', price: 1800, validity: '30 days', type: 'regular' },
                    { size: '10GB', price: 3200, validity: '30 days', type: 'premium' }
                ],
                glo: [
                    { size: '200MB', price: 50, validity: '1 day', type: 'campus' },
                    { size: '1GB', price: 400, validity: '14 days', type: 'regular' },
                    { size: '2.5GB', price: 800, validity: '30 days', type: 'regular' },
                    { size: '5GB', price: 1600, validity: '30 days', type: 'regular' },
                    { size: '10GB', price: 3000, validity: '30 days', type: 'premium' }
                ]
            };

            await this.delay(500); // Simulate API call

            return {
                success: true,
                plans: plans[network] || [],
                network: network,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                plans: []
            };
        }
    }

    // Utility functions
    generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    generateConfirmationCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get weather information for user location
    async getWeatherInfo(city = 'Lagos') {
        try {
            // Using a simple weather API that doesn't require API key
            const response = await fetch(`https://wttr.in/${city}?format=j1`);
            const data = await response.json();
            
            if (data.current_condition && data.current_condition[0]) {
                const current = data.current_condition[0];
                return {
                    success: true,
                    temperature: `${current.temp_C}°C`,
                    condition: current.weatherDesc[0].value,
                    humidity: `${current.humidity}%`,
                    windSpeed: `${current.windspeedKmph} km/h`,
                    city: city
                };
            }
            
            // Fallback weather data
            return this.getFallbackWeather(city);
        } catch (error) {
            return this.getFallbackWeather(city);
        }
    }

    // Fallback weather data
    getFallbackWeather(city) {
        const fallbackData = {
            'Lagos': { temp: '28°C', condition: 'Partly Cloudy', humidity: '75%' },
            'Abuja': { temp: '25°C', condition: 'Clear', humidity: '65%' },
            'Kano': { temp: '30°C', condition: 'Sunny', humidity: '45%' }
        };
        
        const weather = fallbackData[city] || fallbackData['Lagos'];
        return {
            success: true,
            temperature: weather.temp,
            condition: weather.condition,
            humidity: weather.humidity,
            windSpeed: '5 km/h',
            city: city
        };
    }

    // Get cryptocurrency prices (useful for future digital payment features)
    async getCryptoPrices() {
        try {
            const url = `${API_CONFIG.crypto.baseUrl}/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=ngn,usd`;
            const data = await this.makeRequest(url);
            
            return {
                success: true,
                prices: {
                    bitcoin: {
                        ngn: data.bitcoin.ngn,
                        usd: data.bitcoin.usd
                    },
                    ethereum: {
                        ngn: data.ethereum.ngn,
                        usd: data.ethereum.usd
                    },
                    bnb: {
                        ngn: data.binancecoin.ngn,
                        usd: data.binancecoin.usd
                    }
                },
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate QR code for payment receipts
    generateQRCode(text, size = 200) {
        const encodedText = encodeURIComponent(text);
        return `${API_CONFIG.qrCode.baseUrl}/?size=${size}x${size}&data=${encodedText}`;
    }

    // Get Nigerian bank codes and names
    async getNigerianBanks() {
        try {
            const data = await this.makeRequest(API_CONFIG.bankCodes.baseUrl);
            
            if (data.status && data.data) {
                return {
                    success: true,
                    banks: data.data.map(bank => ({
                        name: bank.name,
                        code: bank.code,
                        slug: bank.slug
                    }))
                };
            }
            
            // Fallback bank data
            return this.getFallbackBanks();
        } catch (error) {
            return this.getFallbackBanks();
        }
    }

    // Fallback Nigerian banks
    getFallbackBanks() {
        const banks = [
            { name: 'Access Bank', code: '044', slug: 'access-bank' },
            { name: 'Guaranty Trust Bank', code: '058', slug: 'guaranty-trust-bank' },
            { name: 'United Bank For Africa', code: '033', slug: 'united-bank-for-africa' },
            { name: 'Zenith Bank', code: '057', slug: 'zenith-bank' },
            { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank-of-nigeria' },
            { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
            { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank-of-nigeria' },
            { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' }
        ];
        
        return {
            success: true,
            banks: banks
        };
    }

    // Get current time for different timezones
    async getCurrentTime(timezone = 'Africa/Lagos') {
        try {
            const url = `${API_CONFIG.timeApi.baseUrl}/timezone/${timezone}`;
            const data = await this.makeRequest(url);
            
            return {
                success: true,
                datetime: data.datetime,
                timezone: data.timezone,
                utc_offset: data.utc_offset,
                formatted: new Date(data.datetime).toLocaleString('en-NG')
            };
        } catch (error) {
            return {
                success: true,
                datetime: new Date().toISOString(),
                timezone: timezone,
                formatted: new Date().toLocaleString('en-NG')
            };
        }
    }

    // Advanced transaction verification
    async verifyTransaction(transactionId, phoneNumber) {
        try {
            // Simulate transaction verification with external API
            await this.delay(1500);
            
            // 98% success rate for verification
            if (Math.random() > 0.02) {
                return {
                    success: true,
                    verified: true,
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                    message: 'Transaction verified successfully'
                };
            } else {
                return {
                    success: true,
                    verified: false,
                    status: 'pending',
                    message: 'Transaction is still being processed'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check service availability
    async checkServiceStatus() {
        const services = [
            { name: 'Airtime Service', url: API_CONFIG.utilityDemo.baseUrl },
            { name: 'Data Service', url: API_CONFIG.utilityDemo.baseUrl },
            { name: 'Exchange Rate Service', url: API_CONFIG.exchangeRate.baseUrl },
            { name: 'Location Service', url: API_CONFIG.ipGeolocation.baseUrl }
        ];

        const statusChecks = services.map(async (service) => {
            try {
                const response = await fetch(service.url, { 
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000)
                });
                return {
                    name: service.name,
                    status: response.ok ? 'operational' : 'degraded',
                    responseTime: Date.now()
                };
            } catch (error) {
                return {
                    name: service.name,
                    status: 'down',
                    responseTime: null
                };
            }
        });

        try {
            const results = await Promise.all(statusChecks);
            return {
                success: true,
                services: results,
                overall: results.every(s => s.status === 'operational') ? 'operational' : 'partial'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Enhanced transaction receipt
    generateTransactionReceipt(transaction) {
        const receipt = {
            transactionId: transaction.transactionId,
            timestamp: new Date().toLocaleString('en-NG'),
            type: transaction.type || 'airtime',
            amount: transaction.amount,
            phoneNumber: transaction.phoneNumber,
            network: transaction.network,
            status: 'completed',
            qrCode: this.generateQRCode(`TXN:${transaction.transactionId}:${transaction.amount}`)
        };
        
        return receipt;
    }

    // Format currency
    formatCurrency(amount, currency = 'NGN') {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Initialize API service
const apiService = new UtilityAPIService();

// Export for use in other files
if (typeof window !== 'undefined') {
    window.apiService = apiService;
}