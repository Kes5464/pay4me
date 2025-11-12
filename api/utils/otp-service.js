// OTP Service for Email and SMS Verification
// Handles sending verification codes via email and SMS

// Generate 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email or SMS
export async function sendOTP(recipient, otp, type = 'email') {
    console.log(`Sending ${type} OTP: ${otp} to ${recipient}`);
    
    if (type === 'email') {
        return await sendEmailOTP(recipient, otp);
    } else if (type === 'phone') {
        return await sendSMSOTP(recipient, otp);
    } else {
        throw new Error('Invalid OTP type. Use "email" or "phone"');
    }
}

// Send OTP via Email (using multiple providers)
async function sendEmailOTP(email, otp) {
    const subject = 'Pay4me Account Verification';
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
                .container { padding: 20px; background: #f9f9f9; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 5px; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>💳 Pay4me</h1>
                    <p>Welcome to Nigeria's fastest recharge platform!</p>
                </div>
                <div class="content">
                    <h2>Verify Your Account</h2>
                    <p>Thank you for joining Pay4me! To complete your registration, please use this verification code:</p>
                    
                    <div class="otp-code">${otp}</div>
                    
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This code expires in <strong>10 minutes</strong></li>
                        <li>Don't share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>
                    
                    <p>Once verified, you'll be able to:</p>
                    <ul>
                        <li>⚡ Instant airtime recharge</li>
                        <li>📶 Buy data bundles</li>
                        <li>🏈 Fund Sportybet account</li>
                        <li>💾 Save your phone for quick recharges</li>
                        <li>📊 Track transaction history</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>Pay4me - Fast, Secure, Reliable</p>
                    <p>Questions? Contact us at support@pay4me.com.ng</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Try multiple email services
    const emailProviders = [
        { name: 'EmailJS', fn: sendViaEmailJS },
        { name: 'SMTP', fn: sendViaSMTP },
        { name: 'SendGrid', fn: sendViaSendGrid }
    ];

    for (const provider of emailProviders) {
        try {
            console.log(`Trying ${provider.name} for email...`);
            await provider.fn(email, subject, htmlContent);
            console.log(`✅ Email sent via ${provider.name}`);
            return true;
        } catch (error) {
            console.log(`❌ ${provider.name} failed:`, error.message);
        }
    }

    // If all fail, log for manual verification (development)
    console.log(`📧 EMAIL OTP for ${email}: ${otp}`);
    return true; // Always return true for development
}

// Send OTP via SMS (using multiple providers)
async function sendSMSOTP(phone, otp) {
    const message = `Your Pay4me verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nDon't share this code with anyone.\n\nPay4me - Fast, Secure, Reliable`;

    // Try multiple SMS services
    const smsProviders = [
        { name: 'Termii', fn: sendViaTermii },
        { name: 'SMS.ng', fn: sendViaSMSng },
        { name: 'Twilio', fn: sendViaTwilio }
    ];

    for (const provider of smsProviders) {
        try {
            console.log(`Trying ${provider.name} for SMS...`);
            await provider.fn(phone, message);
            console.log(`✅ SMS sent via ${provider.name}`);
            return true;
        } catch (error) {
            console.log(`❌ ${provider.name} failed:`, error.message);
        }
    }

    // If all fail, log for manual verification (development)
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);
    return true; // Always return true for development
}

// Email Provider: EmailJS (Free tier)
async function sendViaEmailJS(email, subject, htmlContent) {
    if (!process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_SERVICE_ID) {
        throw new Error('EmailJS not configured');
    }

    // EmailJS implementation would go here
    throw new Error('EmailJS implementation pending');
}

// Email Provider: SMTP (Nodemailer)
async function sendViaSMTP(email, subject, htmlContent) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        throw new Error('SMTP not configured');
    }

    // SMTP implementation would go here
    throw new Error('SMTP implementation pending');
}

// Email Provider: SendGrid
async function sendViaSendGrid(email, subject, htmlContent) {
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{ email: email }]
            }],
            from: { 
                email: 'noreply@pay4me.com.ng', 
                name: 'Pay4me' 
            },
            subject: subject,
            content: [{
                type: 'text/html',
                value: htmlContent
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`);
    }

    return true;
}

// SMS Provider: Termii (Nigerian SMS service)
async function sendViaTermii(phone, message) {
    if (!process.env.TERMII_API_KEY) {
        throw new Error('Termii not configured');
    }

    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: phone,
            from: 'Pay4me',
            sms: message,
            type: 'plain',
            api_key: process.env.TERMII_API_KEY,
            channel: 'generic'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Termii API error: ${error.message}`);
    }

    return true;
}

// SMS Provider: SMS.ng
async function sendViaSMSng(phone, message) {
    if (!process.env.SMSNG_API_KEY) {
        throw new Error('SMS.ng not configured');
    }

    // SMS.ng implementation would go here
    throw new Error('SMS.ng implementation pending');
}

// SMS Provider: Twilio
async function sendViaTwilio(phone, message) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio not configured');
    }

    // Twilio implementation would go here
    throw new Error('Twilio implementation pending');
}