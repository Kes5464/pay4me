# Deployment Guide for Pay4Me

## Deploy to GitHub Pages (Frontend) + Backend Hosting

### Step 1: Deploy Frontend to GitHub Pages

1. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit: Pay4Me utility payment platform"
```

2. **Create GitHub Repository**
- Go to https://github.com/new
- Repository name: `pay4me`
- Make it Public
- Don't initialize with README (we already have one)

3. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR-USERNAME/pay4me.git
git branch -M main
git push -u origin main
```

4. **Enable GitHub Pages**
- Go to your repository settings
- Navigate to "Pages" section
- Source: Deploy from a branch
- Branch: `main` / `root`
- Click Save

### Step 2: Deploy Backend to Hosting Service

**Recommended Options:**

#### Option A: Render (Free Tier)
1. Go to https://render.com
2. Sign up and connect your GitHub account
3. Click "New +" → "Web Service"
4. Connect your `pay4me` repository
5. Configure:
   - Name: `pay4me-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Free tier
6. Add environment variable:
   - Key: `PORT`
   - Value: `3000`
7. Click "Create Web Service"

#### Option B: Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `pay4me` repository
5. Railway will auto-detect Node.js
6. Click "Deploy"

#### Option C: Heroku
1. Install Heroku CLI
2. Run commands:
```bash
heroku login
heroku create pay4me-backend
git push heroku main
```

### Step 3: Update API URL

After deploying backend, update `common.js`:
```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://your-backend-url.com/api';
```

### Step 4: Connect Custom Domain (pay4me.com)

#### For GitHub Pages:
1. In repository Settings → Pages → Custom domain
2. Enter: `pay4me.com`
3. Click Save

#### Add DNS Records in SmartConnect:
Add these records in your SmartConnect DNS settings:

**For Apex Domain (pay4me.com):**
```
Type: A
Name: @
Value: 185.199.108.153
```
```
Type: A
Name: @
Value: 185.199.109.153
```
```
Type: A
Name: @
Value: 185.199.110.153
```
```
Type: A
Name: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: YOUR-USERNAME.github.io
```

#### For Backend Domain (api.pay4me.com):
If using Render/Railway/Heroku:
```
Type: CNAME
Name: api
Value: your-backend-url.onrender.com (or respective service)
```

Then update `common.js`:
```javascript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://api.pay4me.com/api';
```

### Step 5: Update CORS in server.js

Add your domain to allowed origins:
```javascript
app.use(cors({
    origin: ['https://pay4me.com', 'https://www.pay4me.com'],
    credentials: true
}));
```

### Step 6: Enable HTTPS

GitHub Pages automatically provides HTTPS. For backend:
- Render/Railway provide automatic HTTPS
- Add SSL certificate in your hosting dashboard

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test user registration
- [ ] Test login functionality
- [ ] Test all services (Airtime, Data, Betting, TV)
- [ ] Test support form
- [ ] Verify data persistence
- [ ] Check mobile responsiveness
- [ ] Test on different browsers

## Monitoring

- Check backend logs in your hosting dashboard
- Monitor API responses
- Set up uptime monitoring (e.g., UptimeRobot)

## Need Help?

- GitHub Pages: https://docs.github.com/pages
- Render: https://render.com/docs
- Railway: https://docs.railway.app
