# API Integration Setup Guide

This guide explains how to connect your UtilityHub site with real APIs for enhanced functionality.

## 🔧 Current API Integrations

### 1. **Exchange Rate API** (FREE)
- **Service**: ExchangeRate-API
- **URL**: https://exchangerate-api.com
- **Usage**: Real-time currency conversion
- **Limits**: 1,500 requests/month (free tier)
- **Setup**: No API key required for basic usage

### 2. **IP Geolocation** (FREE)
- **Service**: ipapi.co
- **URL**: https://ipapi.co
- **Usage**: User location detection
- **Limits**: 1,000 requests/day (free tier)
- **Setup**: No API key required for basic usage

### 3. **Phone Validation** (FREE TIER)
- **Service**: AbstractAPI Phone Validation
- **URL**: https://www.abstractapi.com/phone-validation-api
- **Usage**: Phone number validation and carrier detection
- **Limits**: 100 requests/month (free tier)
- **Setup**: Requires free API key

## 🚀 Setup Instructions

### Step 1: Get API Keys

#### Phone Validation API (Optional but recommended)
1. Visit https://www.abstractapi.com/phone-validation-api
2. Sign up for a free account
3. Get your API key from the dashboard
4. Update the API key in `js/api-service.js`:

```javascript
phoneValidation: {
    baseUrl: 'https://phonevalidation.abstractapi.com/v1',
    apiKey: 'YOUR_ACTUAL_API_KEY_HERE' // Replace this
}
```

### Step 2: Configure Telecom APIs (For Production)

For real airtime and data purchases, you'll need to integrate with telecom APIs:

#### Nigerian Telecom APIs
1. **VTPass API** (Recommended)
   - Website: https://vtpass.com
   - Services: Airtime, Data, Bills
   - Setup: Business registration required

2. **Flutterwave Bills API**
   - Website: https://flutterwave.com
   - Services: Comprehensive bill payments
   - Setup: Business account required

3. **Paystack Bills API**
   - Website: https://paystack.com
   - Services: Utility bill payments
   - Setup: Business verification required

### Step 3: Update API Configuration

Edit `js/api-service.js` and add your production API endpoints:

```javascript
// Add to API_CONFIG object
vtpass: {
    baseUrl: 'https://vtpass.com/api',
    apiKey: 'YOUR_VTPASS_API_KEY',
    secretKey: 'YOUR_VTPASS_SECRET_KEY'
},

flutterwave: {
    baseUrl: 'https://api.flutterwave.com/v3',
    publicKey: 'YOUR_FLUTTERWAVE_PUBLIC_KEY',
    secretKey: 'YOUR_FLUTTERWAVE_SECRET_KEY'
}
```

## 📊 API Response Examples

### Phone Validation Response
```json
{
    "phone": "+2348012345678",
    "valid": true,
    "country": {
        "code": "NG",
        "name": "Nigeria"
    },
    "carrier": "MTN Nigeria",
    "line_type": "mobile"
}
```

### Exchange Rate Response
```json
{
    "base": "USD",
    "date": "2024-01-01",
    "rates": {
        "NGN": 1620.50,
        "EUR": 0.85,
        "GBP": 0.79
    }
}
```

### Location Response
```json
{
    "ip": "102.89.23.45",
    "city": "Lagos",
    "region": "Lagos",
    "country": "Nigeria",
    "country_code": "NG",
    "currency": "NGN",
    "timezone": "Africa/Lagos"
}
```

## 🔒 Security Best Practices

### 1. Environment Variables
Never commit API keys to version control. Use environment variables:

```javascript
// Use environment variables (Node.js example)
const API_KEYS = {
    abstractapi: process.env.ABSTRACTAPI_KEY,
    vtpass: process.env.VTPASS_API_KEY,
    flutterwave: process.env.FLUTTERWAVE_SECRET_KEY
};
```

### 2. API Key Rotation
- Regularly rotate your API keys
- Monitor API usage and set up alerts
- Use different keys for development and production

### 3. Rate Limiting
- Implement client-side rate limiting
- Cache API responses when appropriate
- Handle rate limit errors gracefully

## 🛡️ Error Handling

The API service includes comprehensive error handling:

```javascript
// Example error handling
try {
    const result = await apiService.processAirtimePurchase(phone, amount, network);
    if (result.success) {
        // Handle success
    } else {
        // Handle API error
        showMessage(result.error, 'error');
    }
} catch (error) {
    // Handle network/system error
    showMessage('Service temporarily unavailable', 'error');
}
```

## 📈 Production Deployment

### 1. Backend Requirements
For production deployment, you'll need:
- Node.js/Python backend server
- Database for transaction logging
- Payment gateway integration
- SSL certificate
- API rate limiting middleware

### 2. Recommended Architecture
```
Frontend (Current) → Backend API → Telecom APIs
                  ↓
              Database → Payment Gateway
```

### 3. Scaling Considerations
- Use Redis for caching frequent API calls
- Implement queue system for high-volume transactions
- Set up monitoring and alerting
- Use CDN for static assets

## 🔄 API Testing

### Test Endpoints
Use these test numbers for development:
- MTN Test: 08012345678
- Airtel Test: 08023456789
- Glo Test: 08034567890

### Development vs Production
The current implementation uses simulation mode. Switch to production by:
1. Adding real API endpoints
2. Updating authentication methods
3. Implementing proper error logging
4. Adding transaction verification

## 📝 API Documentation Links

- **ExchangeRate-API**: https://exchangerate-api.com/docs
- **ipapi.co**: https://ipapi.co/api/
- **AbstractAPI**: https://docs.abstractapi.com/phone-validation
- **VTPass**: https://vtpass.com/documentation
- **Flutterwave**: https://developer.flutterwave.com/docs
- **Paystack**: https://paystack.com/docs/api/

## 🆘 Support

For API integration support:
1. Check API documentation first
2. Test with provided test credentials
3. Monitor browser console for errors
4. Check network tab for failed requests
5. Verify API key permissions and limits

## 🔧 Troubleshooting

### Common Issues
1. **CORS Errors**: Configure backend proxy for API calls
2. **Rate Limits**: Implement caching and request throttling
3. **Authentication**: Verify API keys and permissions
4. **Network Issues**: Add retry logic and fallbacks

### Debug Mode
Enable debug mode by setting:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

This will log all API requests and responses to the console.