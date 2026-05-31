import nodemailer from 'nodemailer'
import crypto from 'crypto'
import OTP from '../models/userOtpVerification.js'
import dotenv from 'dotenv'

dotenv.config()


export const sendOTP = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); 
    
    // Log the OTP in large, highly visible banners in the console
    console.log("\n==================================================");
    console.log(`[FASHIONZONE OTP] FOR EMAIL: ${email}`);
    console.log(`VERIFICATION CODE IS: ${otp}`);
    console.log("==================================================\n");

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.PASSWORD 
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP for Account Verification',
            text: `Your OTP for verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        console.log(`[FASHIONZONE OTP] Email sent successfully to ${email}`);
    } catch (mailError) {
        console.warn(`[FASHIONZONE OTP] Failed to send email to ${email} (check SMTP configuration in .env).`);
        console.warn(`[FASHIONZONE OTP] Fallback enabled: Use the code ${otp} in the browser.`);
    }

    await OTP.create({ email, otp });

    return otp;
};



 



