# Pay4me.com.ng Domain Setup Guide

## Overview
This guide will help you configure your custom domain `pay4me.com.ng` for the Pay4me platform with the following structure:

- **Frontend**: `pay4me.com.ng` (GitHub Pages)
- **Backend API**: `api.pay4me.com.ng` (Vercel)

## Prerequisites
- Domain purchased and accessible via your domain registrar
- Access to DNS management (usually through your domain provider)
- Vercel account with Pay4me backend deployed
- GitHub Pages enabled for your repository

## DNS Configuration

### 1. GitHub Pages Setup (Frontend - pay4me.com.ng)

Configure these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153

Type: CNAME
Name: www
Value: kes5464.github.io
```

### 2. Vercel API Setup (Backend - api.pay4me.com.ng)

```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

## Step-by-Step Configuration

### Step 1: Configure GitHub Pages Custom Domain
1. Go to your GitHub repository: `https://github.com/Kes5464/pay4me`
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Custom domain**, enter: `pay4me.com.ng`
5. Click **Save**
6. Wait for DNS check to complete (may take up to 24 hours)

### Step 2: Configure Vercel Custom Domain
1. Go to Vercel Dashboard: `https://vercel.com/dashboard`
2. Select your **payme** project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `api.pay4me.com.ng`
6. Follow Vercel's DNS configuration instructions

### Step 3: Update DNS Records
At your domain registrar (where you bought pay4me.com.ng):

1. **Delete any existing A/CNAME records** for pay4me.com.ng
2. **Add the GitHub Pages A records** (4 A records listed above)
3. **Add the www CNAME** pointing to kes5464.github.io
4. **Add the api CNAME** pointing to cname.vercel-dns.com
5. **Save changes** and wait for propagation (15 minutes - 24 hours)

### Step 4: Enable HTTPS
1. **GitHub Pages**: Automatically enabled once domain is verified
2. **Vercel**: Automatically provides SSL certificate for custom domain

## Verification Commands

Test your domain configuration:

```bash
# Test main domain
nslookup pay4me.com.ng

# Test API subdomain  
nslookup api.pay4me.com.ng

# Test HTTPS
curl -I https://pay4me.com.ng
curl -I https://api.pay4me.com.ng/health
```

## Expected Results After Configuration

- ✅ `https://pay4me.com.ng` → Your Pay4me frontend
- ✅ `https://www.pay4me.com.ng` → Redirects to main domain
- ✅ `https://api.pay4me.com.ng` → Vercel backend API
- ✅ `https://api.pay4me.com.ng/health` → ClubKonnect API status

## Troubleshooting

### Common Issues:
1. **DNS not propagated**: Wait up to 24 hours, use different DNS servers for testing
2. **GitHub Pages not working**: Ensure repository is public and Pages is enabled
3. **Vercel domain error**: Check that deployment is successful before adding domain
4. **HTTPS errors**: Wait for SSL certificates to be issued (usually automatic)

### Quick Fixes:
```bash
# Clear DNS cache (Windows)
ipconfig /flushdns

# Test from different locations
curl -H "Host: pay4me.com.ng" https://185.199.108.153
```

## Current Deployment URLs (Temporary)
- Frontend: https://kes5464.github.io/pay4me
- Backend: https://payme-1d6sgb86j-kestine1s-projects.vercel.app

These will be replaced by your custom domain once DNS is configured.

## Support
If you encounter issues:
1. Check DNS propagation: https://www.whatsmydns.net/
2. Verify domain ownership in registrar settings
3. Contact domain provider for DNS support if needed