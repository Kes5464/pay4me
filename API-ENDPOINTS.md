# Pay4me API Endpoints Documentation

## 🌐 Live API Base URL
**Production**: `https://api.pay4me.com.ng`

---

## 📋 Complete API Reference

### 1. Health Check Endpoint
**Check API status and configuration**

```http
GET https://api.pay4me.com.ng/health
```

**Response:**
```json
{
  "status": "online",
  "message": "Pay4me API is running successfully",
  "timestamp": "2024-11-13T...",
  "providers": {
    "clubkonnect": "✅ Configured",
    "hustlesim": "✅ Available", 
    "paystack": "✅ Available",
    "vtpass": "✅ Available"
  },
  "version": "1.0.0"
}
```

---

### 2. Authentication Endpoints

#### 2.1 User Registration
**Register a new user account**

```http
POST https://api.pay4me.com.ng/auth?action=register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "phone": "08012345678",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully! Please verify your email/phone.",
  "data": {
    "userId": "user_123456",
    "email": "john@example.com",
    "phone": "08012345678",
    "verificationRequired": true
  }
}
```

#### 2.2 Account Verification
**Verify account with OTP code**

```http
POST https://api.pay4me.com.ng/auth?action=verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account verified successfully!",
  "data": {
    "userId": "user_123456",
    "verified": true
  }
}
```

#### 2.3 User Login
**Authenticate user and get JWT token**

```http
POST https://api.pay4me.com.ng/auth?action=login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_123456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08012345678"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2.4 Resend OTP
**Request new verification code**

```http
POST https://api.pay4me.com.ng/auth?action=resend-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New verification code sent successfully"
}
```

---

### 3. Recharge Endpoints

#### 3.1 Airtime Recharge
**Purchase airtime for any Nigerian network**

```http
POST https://api.pay4me.com.ng/recharge
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "airtime",
  "network": "mtn",
  "phoneNumber": "08012345678",
  "amount": 1000,
  "reference": "PAY4ME_AIRTIME_1699876543210"
}
```

**Supported Networks:**
- `mtn` - MTN Nigeria
- `airtel` - Airtel Nigeria  
- `glo` - Globacom
- `9mobile` - 9mobile

**Response:**
```json
{
  "success": true,
  "message": "Airtime recharge successful",
  "data": {
    "transactionId": "txn_123456789",
    "reference": "PAY4ME_AIRTIME_1699876543210",
    "network": "mtn",
    "phoneNumber": "08012345678",
    "amount": 1000,
    "confirmationCode": "MTN123456789",
    "status": "successful",
    "provider": "clubkonnect",
    "timestamp": "2024-11-13T..."
  }
}
```

#### 3.2 Data Bundle Purchase
**Buy data bundles for any Nigerian network**

```http
POST https://api.pay4me.com.ng/recharge
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "type": "data",
  "network": "mtn", 
  "phoneNumber": "08012345678",
  "amount": 2000,
  "dataPlan": "2GB_30DAYS",
  "reference": "PAY4ME_DATA_1699876543210"
}
```

**Popular Data Plans:**
```javascript
// MTN Data Plans
"500MB_30DAYS": 500,   // ₦500 - 500MB for 30 days
"1GB_30DAYS": 1000,    // ₦1,000 - 1GB for 30 days  
"2GB_30DAYS": 2000,    // ₦2,000 - 2GB for 30 days
"5GB_30DAYS": 5000,    // ₦5,000 - 5GB for 30 days
"10GB_30DAYS": 10000,  // ₦10,000 - 10GB for 30 days

// Airtel Data Plans
"1.5GB_30DAYS": 1000,  // ₦1,000 - 1.5GB for 30 days
"3GB_30DAYS": 2000,    // ₦2,000 - 3GB for 30 days
"6GB_30DAYS": 3000,    // ₦3,000 - 6GB for 30 days

// Glo Data Plans  
"1.35GB_14DAYS": 1000, // ₦1,000 - 1.35GB for 14 days
"2.9GB_30DAYS": 2000,  // ₦2,000 - 2.9GB for 30 days
"5.8GB_30DAYS": 4000,  // ₦4,000 - 5.8GB for 30 days
```

**Response:**
```json
{
  "success": true,
  "message": "Data purchase successful", 
  "data": {
    "transactionId": "txn_987654321",
    "reference": "PAY4ME_DATA_1699876543210",
    "network": "mtn",
    "phoneNumber": "08012345678", 
    "amount": 2000,
    "dataPlan": "2GB_30DAYS",
    "dataVolume": "2GB",
    "validity": "30 days",
    "confirmationCode": "MTN987654321",
    "status": "successful",
    "provider": "clubkonnect",
    "timestamp": "2024-11-13T..."
  }
}
```

---

## 🔐 Authentication Requirements

All recharge endpoints require JWT authentication:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

Get your JWT token from the login endpoint.

---

## ⚡ Provider Fallback System

Pay4me uses multiple providers for 99%+ success rate:

1. **ClubKonnect** (Primary) - Direct Nigerian API
2. **HustleSIM** (Secondary) - Alternative provider  
3. **Paystack Bills** (Tertiary) - Payment gateway
4. **VTPass** (Fallback) - Utility payment platform

If one provider fails, the system automatically tries the next one.

---

## 🌍 CORS Configuration

**Allowed Origins:** 
- `https://pay4me.com.ng`
- `https://www.pay4me.com.ng`

**Allowed Methods:**
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

**Allowed Headers:**
- `Content-Type`, `Authorization`

---

## 📊 Error Handling

**Standard Error Response:**
```json
{
  "success": false,
  "message": "Error description", 
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

**Common Error Codes:**
- `INVALID_TOKEN` - JWT token invalid or expired
- `INSUFFICIENT_BALANCE` - Not enough balance for transaction
- `NETWORK_ERROR` - Provider network issue
- `VALIDATION_ERROR` - Invalid request parameters
- `USER_NOT_FOUND` - User account doesn't exist
- `ALREADY_EXISTS` - Email/phone already registered

---

## 🧪 Testing

**Test the API endpoints:**

```bash
# Health check
curl https://api.pay4me.com.ng/health

# Register user (replace with real data)
curl -X POST https://api.pay4me.com.ng/auth?action=register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"08012345678","password":"test123"}'

# Login user  
curl -X POST https://api.pay4me.com.ng/auth?action=login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"test123"}'
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt encryption  
- ✅ **OTP Verification** - Email/SMS verification
- ✅ **CORS Protection** - Domain-restricted access
- ✅ **Input Validation** - Sanitized user inputs
- ✅ **Rate Limiting** - Protection against abuse

---

## 📈 API Status & Monitoring

**Monitor API health:**
- Health endpoint: `https://api.pay4me.com.ng/health`
- Response time: < 500ms average
- Uptime: 99.9% target
- Provider status included in health checks

**ClubKonnect Integration:**
- Network codes: MTN=01, Airtel=04, Glo=02, 9mobile=03
- Real-time balance deduction
- Instant confirmation codes
- 24/7 availability