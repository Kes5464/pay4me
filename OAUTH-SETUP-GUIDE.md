# 🔐 OAuth Setup Guide - Google & Facebook Authentication

## 📋 Overview
Your UtilityHub app now supports Google and Facebook login! Users can register and login using their existing social media accounts.

## 🔧 Setup Required

### **Step 1: Google OAuth Setup**

1. **Go to Google Cloud Console**
   - Visit: https://console.developers.google.com
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" → "New Project"
   - Name: "UtilityHub OAuth"
   - Click "Create"

3. **Enable Google Sign-In API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sign-In API"
   - Click and enable it

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Application type: "Web application"
   - Name: "UtilityHub Web Client"
   - Authorized JavaScript origins: 
     - https://pay4me.com.ng
     - https://kes5464.github.io
   - Authorized redirect URIs:
     - https://pay4me.com.ng/auth/callback
     - https://kes5464.github.io/pay4me/auth/callback

5. **Copy Client ID**
   - Copy the Client ID (ends with .googleusercontent.com)
   - Update CONFIG.oauth.google.clientId in js/config.js

### **Step 2: Facebook OAuth Setup**

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com
   - Sign in with your Facebook account

2. **Create App**
   - Click "Create App"
   - App type: "Consumer"
   - App name: "UtilityHub"
   - Contact email: Your email
   - Click "Create App"

3. **Add Facebook Login Product**
   - In dashboard, click "Add Product"
   - Find "Facebook Login" → "Set Up"
   - Platform: "Web"
   - Site URL: https://pay4me.com.ng

4. **Configure OAuth Redirect URIs**
   - Go to "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     - https://pay4me.com.ng/
     - https://kes5464.github.io/pay4me/

5. **Copy App ID**
   - Go to "Settings" → "Basic"
   - Copy the App ID
   - Update CONFIG.oauth.facebook.appId in js/config.js

### **Step 3: Update Configuration**

Edit `js/config.js` file:

```javascript
oauth: {
    google: {
        clientId: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID.googleusercontent.com',
        scope: 'email profile'
    },
    facebook: {
        appId: 'YOUR_ACTUAL_FACEBOOK_APP_ID',
        scope: 'email,public_profile'
    }
}
```

### **Step 4: Test OAuth Integration**

1. **Test Google Login**
   - Go to login page
   - Click "Continue with Google"
   - Should open Google sign-in popup
   - After authentication, user should be logged in

2. **Test Facebook Login**
   - Go to login page
   - Click "Continue with Facebook"
   - Should open Facebook login popup
   - After authentication, user should be logged in

## 🎯 **Features Implemented**

### **✅ Frontend Features:**
- Google OAuth login button
- Facebook OAuth login button  
- Automatic user registration
- User profile display
- Session management
- Error handling

### **✅ Backend Features:**
- OAuth authentication endpoint
- User data processing
- Token generation
- Database simulation (ready for real DB)

### **✅ Security Features:**
- Token-based authentication
- User data validation
- CORS configuration
- Error handling

## 🔍 **How It Works**

1. **User clicks OAuth button**
2. **Popup opens** with Google/Facebook login
3. **User authenticates** with their account
4. **OAuth provider returns** user data
5. **Your app processes** the authentication
6. **User is logged in** and redirected

## 📱 **User Experience**

### **Login Process:**
1. User visits login page
2. Sees options: Email login OR Google/Facebook
3. Clicks social login button
4. Authenticates with provider
5. Automatically logged into UtilityHub
6. Can use all features (payments, recharge, etc.)

### **Registration Process:**
- New users are automatically registered
- No need to fill forms
- Profile data pulled from social accounts
- Immediate access to all features

## 🚀 **Production Checklist**

### **Before Going Live:**
- ✅ Get real Google Client ID
- ✅ Get real Facebook App ID  
- ✅ Update config with real credentials
- ✅ Test both login methods
- ✅ Verify redirect URLs work
- ✅ Test on mobile devices

### **Security Best Practices:**
- Never expose OAuth secrets in frontend
- Use HTTPS only (already implemented)
- Validate all user data
- Implement proper session management
- Add rate limiting for auth endpoints

## 🎉 **Benefits for Users**

- **Fast Registration**: No forms to fill
- **Easy Login**: One-click authentication  
- **Secure**: Uses established OAuth providers
- **Convenient**: No passwords to remember
- **Mobile Friendly**: Works great on phones

## 🔧 **Troubleshooting**

### **Common Issues:**

**"OAuth not working"**
- Check if client IDs are correct
- Verify redirect URLs match exactly
- Ensure domains are added to OAuth settings

**"Popup blocked"**
- Browser might block popups
- User needs to allow popups for your site
- Provide instructions to users

**"Invalid client error"**
- Client ID is wrong or not set
- Check CONFIG object in browser console
- Verify OAuth app is published/live

## 📞 **Support**

If you need help setting up OAuth:
1. Check browser console for errors
2. Verify all URLs match exactly
3. Test in incognito mode
4. Contact OAuth provider support

Your OAuth integration is ready - just need the API credentials! 🔐