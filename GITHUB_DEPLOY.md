# Quick Start: Deploy Pay4Me to GitHub

## ✅ Your site is ready to deploy!

Git repository has been initialized and your first commit is complete.

## Next Steps:

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `pay4me`
3. Keep it **Public**
4. **DO NOT** check "Add a README file"
5. Click "Create repository"

### 2. Push Your Code to GitHub

Copy your GitHub username, then run these commands in PowerShell:

```powershell
# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/pay4me.git
git branch -M main
git push -u origin main
```

Example:
```powershell
git remote add origin https://github.com/john/pay4me.git
git branch -M main
git push -u origin main
```

### 3. Deploy Backend (Choose ONE option)

#### 🚀 OPTION A: Render.com (Recommended - Free & Easy)

1. Go to https://render.com and sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (`pay4me`)
4. Settings:
   - **Name**: `pay4me-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Add Environment Variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://YOUR-USERNAME.github.io`
6. Click "Create Web Service"
7. Copy your backend URL (e.g., `https://pay4me-backend.onrender.com`)

#### 🚂 OPTION B: Railway.app (Alternative)

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `pay4me` repository
4. Railway auto-detects Node.js and deploys
5. Go to Settings → Add Domain
6. Copy your backend URL

### 4. Update API URL in Your Code

Open `common.js` and update line 4:

```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://YOUR-BACKEND-URL/api';  // Replace with your actual backend URL
```

Example:
```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://pay4me-backend.onrender.com/api';
```

Commit and push the change:
```powershell
git add common.js
git commit -m "Update API URL for production"
git push
```

### 5. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 2-3 minutes
7. Your site will be live at: `https://YOUR-USERNAME.github.io/pay4me/`

### 6. Connect Your Custom Domain (pay4me.com)

#### In GitHub:
1. Repository Settings → Pages → Custom domain
2. Enter: `pay4me.com`
3. Click Save
4. Check "Enforce HTTPS" (wait for it to be available)

#### In SmartConnect DNS Settings:

Add these DNS records:

**A Records (for pay4me.com):**
```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**CNAME Record (for www.pay4me.com):**
```
Type: CNAME, Name: www, Value: YOUR-USERNAME.github.io
```

**CNAME Record (for backend - optional):**
```
Type: CNAME, Name: api, Value: your-backend-url.onrender.com
```

Wait 15-30 minutes for DNS propagation.

### 7. Test Your Live Site

Visit: `https://pay4me.com` (after DNS propagation)

Test:
- ✅ Registration
- ✅ Login
- ✅ Airtime purchase
- ✅ Data purchase
- ✅ Betting funding
- ✅ TV subscription
- ✅ Support form

## 🎉 You're Live!

Your Pay4Me site is now deployed with:
- ✅ Custom domain (pay4me.com)
- ✅ HTTPS/SSL encryption
- ✅ Node.js backend
- ✅ Persistent data storage
- ✅ 24/7 availability

## Need Help?

Refer to `DEPLOYMENT.md` for detailed instructions or troubleshooting.

## Commands Reference

```powershell
# Check git status
git status

# Add changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push

# View remote URL
git remote -v
```
