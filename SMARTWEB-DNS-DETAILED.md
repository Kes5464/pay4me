🌐 SMARTWEB DNS CONFIGURATION - Step by Step Guide
================================================================

DOMAIN: pay4me.com.ng
GOAL: Point domain to GitHub Pages (kes5464.github.io)

📋 REQUIRED DNS RECORDS:
=======================

Record 1:
---------
Type: A
Name: @ (or blank/root)
Value: 185.199.108.153
TTL: 3600

Record 2:
---------
Type: A
Name: @ (or blank/root)
Value: 185.199.109.153
TTL: 3600

Record 3:
---------
Type: A
Name: @ (or blank/root)
Value: 185.199.110.153
TTL: 3600

Record 4:
---------
Type: A
Name: @ (or blank/root)
Value: 185.199.111.153
TTL: 3600

Record 5:
---------
Type: CNAME
Name: www
Value: kes5464.github.io
TTL: 3600

🔑 STEP-BY-STEP INSTRUCTIONS:
============================

Step 1: Login to Smartweb
-------------------------
- Go to: https://portal.smartweb.ng (or smartweb.ng)
- Login with your account credentials
- Look for "Client Area" or "Control Panel"

Step 2: Find Your Domain
-----------------------
- Look for "My Domains" or "Domain List"
- Find "pay4me.com.ng"
- Click "Manage" or the domain name

Step 3: Access DNS Management
---------------------------
Look for ANY of these options:
- "DNS Management"
- "DNS Zone Editor" 
- "DNS Settings"
- "Advanced DNS"
- "Name Servers"
- "Zone File Editor"

Step 4: Clear Existing Records
-----------------------------
IMPORTANT: Delete any existing A records that point to parking pages
- Look for A records pointing to IPs like 160.xxx.xxx.xxx
- Delete them (but keep MX records for email)

Step 5: Add New A Records
------------------------
Click "Add Record" or "+" button 4 times:

Record 1: Type=A, Name=@, Value=185.199.108.153
Record 2: Type=A, Name=@, Value=185.199.109.153  
Record 3: Type=A, Name=@, Value=185.199.110.153
Record 4: Type=A, Name=@, Value=185.199.111.153

Step 6: Add CNAME Record
-----------------------
Click "Add Record":
Type=CNAME, Name=www, Value=kes5464.github.io

Step 7: Save Changes
-------------------
- Click "Save" or "Update Zone"
- Look for success message
- Wait for confirmation

🕐 WHAT HAPPENS NEXT:
====================
- DNS propagation: 2-24 hours
- GitHub Pages will detect the domain
- Site becomes available at https://pay4me.com.ng

🔍 TROUBLESHOOTING:
==================

If you can't find DNS settings:
- Look for "cPanel" access
- Check "Advanced" or "Technical" sections
- Contact Smartweb support: support@smartweb.ng

If interface is confusing:
- Take screenshots and ask for help
- Call Smartweb support directly
- Ask them to "point pay4me.com.ng to GitHub Pages"

Common interface terms:
- "Host" = "Name" = "Subdomain"
- "@" = root domain
- "Points to" = "Value" = "Target"

📞 SMARTWEB SUPPORT INFO:
========================
If you need help, contact Smartweb:
- Email: support@smartweb.ng
- Phone: Check your account for support number
- Tell them: "I need to point my domain to GitHub Pages"
- Give them these IPs: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153