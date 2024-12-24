import nodemailer from 'nodemailer'
import crypto from 'crypto'
import OTP from '../models/userOtpVerification.js'
import dotenv from 'dotenv'

dotenv.config()


export const sendOTP = async (email) => {
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Your email
            pass: process.env.PASSWORD // Your email password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'OTP for Account Verification',
        text: `Your OTP for verification is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    // Save OTP to database
    await OTP.create({ email, otp });

    return otp;
};



 
// export const generateAndSendOTP =async(email)=>{
//     console.log("SentOTP Working");
    
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiry=Date.now() + 5 * 60 * 1000

//     await OTP.updateOne(
//         {email},
//         {otp,expiry},
//         {upsert:true}
//     )

//     console.log(`Generated OTP: ${otp}`);



//     const transpoetor=nodemailer.createTransport({
//         service:'gmail',
//         auth:{
//             user:process.env.EMAIL, 
//             pass: process.env.PASSWORD 
//         }
//     })
   
//     const mailOption={
//         from:process.env.EMAIL,
//         to:email,
//         subject:"OTP For Account Verification",
//         text:`Your OTP for verification is ${otp}. It is valid for 5 minutes.`
//     }

//     await transpoetor.sendMail(mailOption)
//     console.log(`OTP sent to ${email}`);

    
// console.log("I returned");

//     return otp

// }



