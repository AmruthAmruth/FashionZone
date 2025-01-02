import nodemailer from 'nodemailer'
import crypto from 'crypto'
import OTP from '../models/userOtpVerification.js'
import dotenv from 'dotenv'

dotenv.config()


export const sendOTP = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); 
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

    await OTP.create({ email, otp });

    return otp;
};



 



