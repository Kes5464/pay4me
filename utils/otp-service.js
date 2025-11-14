// OTP Service for Pay4me Authentication
// Generates and sends OTP codes via email and SMS

// Generate a 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email or SMS
export async function sendOTP(destination, otp, type = 'email') {
    console.log(`[OTP Service] Sending ${type} OTP to ${destination}: ${otp}`);
    
    if (type === 'email') {
        return await sendEmailOTP(destination, otp);
    } else if (type === 'phone') {
        return await sendSMSOTP(destination, otp);
    } else {
        throw new Error('Invalid OTP type. Use "email" or "phone"');
    }
}

// Send OTP via email (simulated for now)
async function sendEmailOTP(email, otp) {
    try {
        // In production, you would use a real email service like:
        // - SendGrid
        // - Mailgun  
        // - Amazon SES
        // - Nodemailer with SMTP
        
        console.log(`[Email OTP] Sending to: ${email}`);
        console.log(`[Email OTP] Code: ${otp}`);
        console.log(`[Email OTP] Subject: Your Pay4me Verification Code`);
        console.log(`[Email OTP] Body: Your verification code is: ${otp}. This code will expire in 10 minutes.`);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For development, we'll just log the OTP
        // In production, replace this with actual email service
        return {
            success: true,
            message: 'Email sent successfully',
            messageId: `email_${Date.now()}`
        };
        
    } catch (error) {
        console.error('[Email OTP] Error:', error);
        throw new Error('Failed to send email OTP');
    }
}

// Send OTP via SMS (simulated for now)
async function sendSMSOTP(phone, otp) {
    try {
        // In production, you would use a real SMS service like:
        // - Twilio
        // - Africa's Talking
        // - Termii (Popular in Nigeria)
        // - BulkSMS Nigeria
        
        console.log(`[SMS OTP] Sending to: ${phone}`);
        console.log(`[SMS OTP] Code: ${otp}`);
        console.log(`[SMS OTP] Message: Your Pay4me verification code is: ${otp}. This code expires in 10 minutes.`);
        
        // Simulate SMS sending delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // For development, we'll just log the OTP
        // In production, replace this with actual SMS service
        return {
            success: true,
            message: 'SMS sent successfully',
            messageId: `sms_${Date.now()}`
        };
        
    } catch (error) {
        console.error('[SMS OTP] Error:', error);
        throw new Error('Failed to send SMS OTP');
    }
}

// Example implementation with Termii (Nigerian SMS service)
async function sendTermiiSMS(phone, otp) {
    try {
        const termiiConfig = {
            api_key: process.env.TERMII_API_KEY,
            message_type: "NUMERIC",
            to: phone,
            from: "Pay4me",
            channel: "generic",
            pin_attempts: 3,
            pin_time_to_live: 10, // 10 minutes
            pin_length: 6,
            pin_placeholder: "< 1234 >",
            message_text: `Your Pay4me verification code is < 1234 >. This code expires in 10 minutes.`,
            pin_type: "NUMERIC"
        };

        const response = await fetch('https://api.ng.termii.com/api/sms/otp/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(termiiConfig)
        });

        const result = await response.json();
        
        if (response.ok && result.pinId) {
            return {
                success: true,
                message: 'SMS sent successfully',
                messageId: result.pinId
            };
        } else {
            throw new Error(result.message || 'SMS sending failed');
        }
        
    } catch (error) {
        console.error('[Termii SMS] Error:', error);
        throw new Error('Failed to send SMS via Termii');
    }
}

// Example implementation with Twilio
async function sendTwilioSMS(phone, otp) {
    try {
        // You would need to install twilio: npm install twilio
        // const twilio = require('twilio');
        // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const message = `Your Pay4me verification code is: ${otp}. This code expires in 10 minutes.`;
        
        // const result = await client.messages.create({
        //     body: message,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phone
        // });
        
        console.log(`[Twilio SMS] Would send to: ${phone}, Message: ${message}`);
        
        return {
            success: true,
            message: 'SMS sent successfully',
            messageId: `twilio_${Date.now()}`
        };
        
    } catch (error) {
        console.error('[Twilio SMS] Error:', error);
        throw new Error('Failed to send SMS via Twilio');
    }
}