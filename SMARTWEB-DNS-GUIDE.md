# Smartweb DNS Configuration Guide for pay4me.com.ng

## Step-by-Step Instructions:

### 1. Login to Smartweb
- Go to: https://smartweb.ng
- Login with your account credentials
- Navigate to your domain management area

### 2. Find DNS Management
Look for one of these options:
- "DNS Management"
- "DNS Zone Editor" 
- "Domain Management"
- "Advanced DNS"

### 3. Select pay4me.com.ng
- Click on your domain: pay4me.com.ng
- Look for "Manage DNS" or "Edit DNS"

### 4. Delete Existing Records
IMPORTANT: Delete any existing A records that point to other IPs

### 5. Add These Exact Records:

**A Record 1:**
- Type: A
- Host/Name: @ (or leave blank for root domain)
- Value: 185.199.108.153
- TTL: 3600

**A Record 2:**
- Type: A  
- Host/Name: @ (or leave blank)
- Value: 185.199.109.153
- TTL: 3600

**A Record 3:**
- Type: A
- Host/Name: @ (or leave blank)
- Value: 185.199.110.153  
- TTL: 3600

**A Record 4:**
- Type: A
- Host/Name: @ (or leave blank)
- Value: 185.199.111.153
- TTL: 3600

**CNAME Record:**
- Type: CNAME
- Host/Name: www
- Value: kes5464.github.io
- TTL: 3600

### 6. Save Changes
- Click "Save" or "Update" 
- Wait for confirmation message

### 7. Wait for Propagation
- DNS changes take 2-24 hours
- Test using: powershell test-dns.ps1

## Common Smartweb Interface Terms:
- "Host" = "Name" = "Subdomain"
- "@" = root domain (pay4me.com.ng)
- "www" = www subdomain (www.pay4me.com.ng)
- "Points to" = "Value" = "Target"

## If You Need Help:
1. Contact Smartweb support
2. Ask them to add GitHub Pages A records
3. Give them this list: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153