# 🔐 ClubKonnect API Key Setup Guide

## 🎯 **QUICK SETUP (5 Minutes)**

### **Step 1: Login to Vercel**
```powershell
vercel login
```
Follow the browser login prompt.

### **Step 2: Initialize Your Project**
```powershell
vercel
```
- Choose: **Link to existing project? No**
- Project name: **pay4me-backend** 
- Directory: **./api** (or just press Enter)
- Settings: **Use default settings**

### **Step 3: Add Your ClubKonnect API Key**
```powershell
vercel env add CLUBKONNECT_API_KEY
```
When prompted, enter: **YOUR_ACTUAL_CLUBKONNECT_API_TOKEN**

### **Step 4: Add JWT Secret**
```powershell
vercel env add JWT_SECRET
```
When prompted, enter: **pay4me_super_secret_jwt_key_2024**

### **Step 5: Deploy to Production**
```powershell
vercel --prod
```

---

## 📋 **MANUAL VERCEL DASHBOARD METHOD**

If CLI doesn't work, use the dashboard:

### **1. Go to Vercel Dashboard:**
- Visit: https://vercel.com/dashboard
- Login with your account

### **2. Create New Project:**
- Click "Add New" → "Project"
- Import your GitHub repository: **Kes5464/pay4me**
- Set Framework Preset: **Other**
- Root Directory: **/** (leave as is)

### **3. Add Environment Variables:**
Before deploying, click "Environment Variables":

```
Name: CLUBKONNECT_API_KEY
Value: YOUR_ACTUAL_CLUBKONNECT_TOKEN
Environment: Production, Preview, Development

Name: JWT_SECRET  
Value: pay4me_super_secret_jwt_key_2024
Environment: Production, Preview, Development
```

### **4. Deploy:**
- Click "Deploy"
- Wait for deployment to complete
- Copy your backend URL (e.g., https://pay4me-abc123.vercel.app)

---

## 🔗 **UPDATE FRONTEND API URL**

After deployment, update your frontend to use the new backend:

### **File: `js/auth.js` (Line ~13)**
```javascript
// Change this:
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://kes5464.github.io/pay4me/api';

// To this:
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-vercel-url.vercel.app/api';
```

### **File: `js/main.js` (Line ~8)**
```javascript
// Change this:
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://kes5464.github.io/pay4me/api';

// To this:
const API_BASE = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-vercel-url.vercel.app/api';
```

---

## ✅ **TEST YOUR SETUP**

### **1. Test Health Endpoint:**
```
https://your-vercel-url.vercel.app/api/health
```
Should show:
```json
{
  "status": "healthy",
  "services": {
    "clubkonnect": {
      "configured": true,
      "enabled": true,
      "priority": 1
    }
  }
}
```

### **2. Test Authentication:**
- Go to: https://pay4me.com.ng/login.html
- Create a new account
- Verify with email/SMS
- Try a small recharge

---

## 🎯 **WHAT TO ENTER FOR CLUBKONNECT_API_KEY**

Your ClubKonnect API key should look like:
```
ck_live_1234567890abcdef1234567890abcdef
```
or
```
Token_1234567890abcdef1234567890abcdef
```

Enter **exactly** as provided by ClubKonnect (without quotes).

---

## 🆘 **NEED HELP?**

If you encounter issues:
1. **Check your ClubKonnect dashboard** for the correct API key format
2. **Verify the API key** has sufficient balance and permissions
3. **Test with a small amount** first (₦50 airtime)
4. **Check Vercel deployment logs** for any errors

Ready to set up? Run the commands above or use the Vercel dashboard method! 🚀