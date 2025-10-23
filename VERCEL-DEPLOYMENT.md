# 🚀 Backend Deployment Guide - Get Live in 10 Minutes!

## 📋 Pre-Flight Check
✅ Paystack API keys ready
✅ Backend files created
✅ Vercel configuration complete
✅ GitHub repository updated

## 🎯 Step-by-Step Deployment

### **Step 1: Sign up for Vercel (2 minutes)**

1. **Go to**: [vercel.com](https://vercel.com)
2. **Click**: "Start Deploying" 
3. **Sign up with GitHub** (recommended)
4. **Authorize Vercel** to access your repositories

### **Step 2: Deploy Your Project (3 minutes)**

1. **Click**: "New Project"
2. **Import Git Repository**: 
   - Find: `Kes5464/pay4me`
   - Click: "Import"
3. **Configure Project**:
   - Project Name: `utilityhub-backend` (or keep default)
   - Framework Preset: `Other`
   - Root Directory: `./` (default)
4. **Click**: "Deploy"

### **Step 3: Add Environment Variables (2 minutes)**

1. **After deployment**, go to project dashboard
2. **Click**: "Settings" tab
3. **Click**: "Environment Variables"
4. **Add these variables**:

```
PAYSTACK_SECRET_KEY=sk_test_72e6e5d1334be8915b16c1f30a423c129d3b800d
PAYSTACK_PUBLIC_KEY=pk_test_fc5d880b0aac33002cd4d2550c247e6e165ec312
NODE_ENV=production
```

5. **Click**: "Save" for each variable

### **Step 4: Redeploy with Environment Variables (1 minute)**

1. **Go to**: "Deployments" tab
2. **Click**: "..." menu on latest deployment
3. **Click**: "Redeploy"
4. **Wait for deployment** to complete

### **Step 5: Get Your API URL (1 minute)**

Your backend will be available at:
```
https://your-project-name.vercel.app
```

**API Endpoints:**
- Health Check: `https://your-project-name.vercel.app/api/health`
- Payment Verification: `https://your-project-name.vercel.app/api/verify-payment`
- Webhook: `https://your-project-name.vercel.app/api/webhook/paystack`

### **Step 6: Update Frontend Configuration (1 minute)**

Copy your Vercel URL and update `js/config.js`:

```javascript
api: {
    baseUrl: 'https://your-actual-vercel-url.vercel.app/api',
    // ... rest of config
}
```

## 🧪 **Test Your Backend**

### **Test 1: Health Check**
```
GET https://your-project-name.vercel.app/api/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "message": "UtilityHub Backend API is running",
  "services": {
    "paystack": {
      "configured": true,
      "test_mode": true
    }
  }
}
```

### **Test 2: Payment Flow**
1. **Go to**: https://kes5464.github.io/pay4me/airtime.html
2. **Fill form** and click "Recharge Now"
3. **Complete payment** with test card
4. **Backend should verify** and process payment

## ⚠️ **Troubleshooting**

### **Common Issues:**

**1. "Module not found" error**
- **Solution**: Ensure `package.json` exists in root
- **Check**: All API files are in `/api/` folder

**2. "Environment variable not found"**
- **Solution**: Add variables in Vercel dashboard
- **Redeploy**: After adding environment variables

**3. "CORS errors"**
- **Solution**: Check `vercel.json` CORS headers
- **Verify**: Frontend URL is whitelisted

**4. "API not responding"**
- **Check**: Vercel function logs in dashboard
- **Verify**: Correct API endpoint URLs

## 🎉 **Success Indicators**

✅ **Vercel deployment**: Green checkmark
✅ **Health endpoint**: Returns status 200
✅ **Environment variables**: Configured and loaded
✅ **Payment verification**: Works end-to-end
✅ **No CORS errors**: Frontend can call backend

## 📊 **Monitoring & Logs**

### **View Logs:**
1. **Vercel Dashboard** → Your Project
2. **Functions** tab → View logs
3. **Monitor**: API calls and errors

### **Performance:**
- **Function Duration**: < 5 seconds
- **Memory Usage**: < 128MB
- **Execution Count**: Monitor monthly limits

## 💰 **Vercel Pricing**

### **Free Tier Includes:**
- ✅ **100GB bandwidth/month**
- ✅ **100GB-hours function execution**
- ✅ **1000 function invocations/hour**
- ✅ **Custom domains**

### **Upgrade When:**
- **High traffic**: > 100GB/month
- **Many transactions**: > 1000/hour
- **Need analytics**: Pro features

---

## 🚀 **Your Next Steps:**

1. **✅ Deploy to Vercel** (follow steps above)
2. **✅ Test health endpoint**
3. **✅ Update frontend config**
4. **✅ Test full payment flow**
5. **✅ Monitor transactions**

**🎯 After deployment, your UtilityHub will be fully functional with real payment processing!**

---

**📞 Need Help?**
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Deployment Issues**: Check function logs
- **Payment Issues**: Test with Paystack test cards