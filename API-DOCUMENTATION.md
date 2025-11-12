# 🚀 Pay4me API Documentation

## 📡 **BASE URL**
```
Production: https://pay4me-backend.vercel.app/api
Local: http://localhost:3000/api
```

---

## 🏥 **HEALTH CHECK**

### `GET /health`
Check if the API is running and view available services.

**Response:**
```json
{
  "status": "healthy",
  "message": "Pay4me Backend API is running",
  "timestamp": "2024-11-12T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "paystack": {
      "configured": true,
      "test_mode": true
    },
    "hustlesim": {
      "configured": false,
      "enabled": false
    }
  },
  "endpoints": [...],
  "features": {
    "airtime_recharge": true,
    "data_purchase": true,
    "my_phone_feature": true,
    "transaction_history": true
  }
}
```

---

## 📱 **MY PHONE MANAGEMENT**

### `GET /my-phone`
Get saved phone number for a user.

**Query Parameters:**
- `userId` (optional) - User identifier

**Response:**
```json
{
  "success": true,
  "message": "Phone number retrieved successfully",
  "data": {
    "userId": "user123",
    "phoneNumber": "08012345678",
    "network": "mtn",
    "savedAt": "2024-11-12T10:00:00.000Z",
    "lastUsed": "2024-11-12T10:30:00.000Z"
  }
}
```

### `POST /my-phone`
Save a phone number for quick recharges.

**Request Body:**
```json
{
  "phoneNumber": "08012345678",
  "network": "mtn",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone number saved successfully",
  "data": {
    "userId": "user123",
    "phoneNumber": "08012345678",
    "network": "mtn",
    "savedAt": "2024-11-12T10:30:00.000Z",
    "lastUsed": "2024-11-12T10:30:00.000Z"
  }
}
```

### `DELETE /my-phone`
Delete saved phone number.

**Query Parameters:**
- `userId` (optional) - User identifier

**Response:**
```json
{
  "success": true,
  "message": "Phone number deleted successfully",
  "data": {
    "userId": "user123",
    "deletedAt": "2024-11-12T10:30:00.000Z"
  }
}
```

---

## ⚡ **RECHARGE API**

### `POST /recharge`
Universal endpoint for both airtime and data recharges.

**Airtime Request:**
```json
{
  "type": "airtime",
  "network": "mtn",
  "phoneNumber": "08012345678",
  "amount": 500,
  "reference": "PAY4ME_1699789200"
}
```

**Data Request:**
```json
{
  "type": "data",
  "network": "mtn",
  "phoneNumber": "08012345678",
  "amount": 1000,
  "dataSize": "2GB",
  "reference": "PAY4ME_1699789200"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "airtime recharge processed successfully",
  "data": {
    "reference": "PAY4ME_1699789200",
    "transactionId": "TXN123456789",
    "confirmationCode": "ABC12345",
    "network": "MTN",
    "phoneNumber": "08012345678",
    "amount": 500,
    "type": "airtime",
    "status": "completed",
    "processedAt": "2024-11-12T10:30:00.000Z",
    "provider": "HustleSIM"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid Nigerian phone number format",
  "reference": "PAY4ME_1699789200"
}
```

**Supported Networks:**
- `mtn` - MTN Nigeria
- `airtel` - Airtel Nigeria  
- `glo` - Globacom
- `9mobile` - 9mobile

**Validation Rules:**
- Amount: ₦50 - ₦50,000
- Phone: Valid Nigerian format (11 digits starting with 070-090)
- Type: "airtime" or "data"
- Network: mtn, airtel, glo, 9mobile

---

## 📊 **TRANSACTION HISTORY**

### `GET /transactions`
Get user's transaction history with filtering and pagination.

**Query Parameters:**
- `userId` (optional) - User identifier
- `limit` (optional) - Number of records (max 100, default 10)
- `offset` (optional) - Skip records (default 0)
- `type` (optional) - Filter by "airtime" or "data"
- `network` (optional) - Filter by network
- `status` (optional) - Filter by status

**Example:**
```
GET /transactions?limit=20&type=airtime&network=mtn&status=completed
```

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": "TXN123456789",
        "reference": "PAY4ME_1699789200",
        "type": "airtime",
        "network": "MTN",
        "phoneNumber": "08012345678",
        "amount": 500,
        "status": "completed",
        "createdAt": "2024-11-12T10:30:00.000Z",
        "completedAt": "2024-11-12T10:30:15.000Z",
        "confirmationCode": "ABC12345",
        "provider": "HustleSIM"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    },
    "summary": {
      "totalTransactions": 45,
      "totalSpent": 25000,
      "completedTransactions": 42,
      "failedTransactions": 3
    }
  }
}
```

---

## 💳 **PAYMENT VERIFICATION**

### `POST /verify-payment`
Verify Paystack payment and process recharge.

**Request Body:**
```json
{
  "reference": "PAY4ME_1699789200",
  "transactionData": {
    "type": "airtime",
    "network": "mtn",
    "phoneNumber": "08012345678",
    "amount": 500
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and recharge processed",
  "data": {
    "reference": "PAY4ME_1699789200",
    "amount": 500,
    "status": "completed",
    "confirmationCode": "ABC12345"
  }
}
```

---

## 🔗 **WEBHOOKS**

### `POST /webhook/paystack`
Handle Paystack webhook events.

**Supported Events:**
- `charge.success` - Payment completed
- `charge.failed` - Payment failed

**Webhook Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "PAY4ME_1699789200",
    "amount": 50000,
    "status": "success",
    "metadata": {
      "type": "airtime",
      "network": "mtn",
      "phoneNumber": "08012345678"
    }
  }
}
```

---

## 🛠️ **ERROR CODES**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid request | Missing or invalid parameters |
| 401 | Unauthorized | Invalid API key or authentication |
| 404 | Not found | Endpoint doesn't exist |
| 405 | Method not allowed | Wrong HTTP method |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Internal server error | Server-side error |

---

## 📋 **USAGE EXAMPLES**

### **1. Save Your Phone Number**
```javascript
fetch('/api/my-phone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '08012345678',
    network: 'mtn',
    userId: 'user123'
  })
});
```

### **2. Quick Airtime Recharge**
```javascript
fetch('/api/recharge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'airtime',
    network: 'mtn',
    phoneNumber: '08012345678',
    amount: 500,
    reference: 'PAY4ME_' + Date.now()
  })
});
```

### **3. Get Transaction History**
```javascript
fetch('/api/transactions?limit=10&type=airtime')
  .then(response => response.json())
  .then(data => console.log(data.data.transactions));
```

---

## 🔒 **SECURITY**

- All endpoints support CORS
- Phone number validation for Nigerian numbers
- Reference uniqueness checking
- Rate limiting (implement with Vercel Pro)
- Input sanitization and validation

---

## 🌍 **DEPLOYMENT**

Your API is deployed to:
- **Production:** `https://pay4me-backend.vercel.app/api`
- **Test URL:** `https://pay4me-backend.vercel.app/api/health`

**Environment Variables Required:**
```env
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
HUSTLESIM_API_KEY=your_hustlesim_key (optional)
NODE_ENV=production
```

Ready to power your Pay4me recharge app! 🚀