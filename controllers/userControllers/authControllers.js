import bcrypt from 'bcryptjs'
import User from '../../models/userModel.js'
import {sendOTP}  from '../../config/userOTPverification.js'
import OTP from '../../models/userOtpVerification.js'
import mongoose from 'mongoose'
import Product from '../../models/productModel.js'
import Wallet from '../../models/walletModel.js'



//----------------------------------Account Creation , Login  and Logout Section---------------------------------------



export const getLoginPage=(req,res)=>{  
    res.render('user/login',{message:req.flash('message')})
}
 
export const getHomePage=async(req,res)=>{ 
  try {
    const user = req.session.user || null;
    console.log("USER:", user);

    
    const allProducts = await Product.find({isActive:true})
    const womenProducts= await Product.find({ isActive: true, gender: 'women' })
    const menProducts= await Product.find({ isActive: true, gender: 'men' })
    const newArrivals=await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(10); 
    
    res.render('user/home', { user, allProducts ,womenProducts,menProducts,newArrivals});
} catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send("Internal Server Error");
}
}


export const getOtpPage=(req,res)=>{

  const { tempUser } = req.session;
  if (!tempUser) {
      req.flash('message', 'Session expired. Please try again.');
      return res.redirect('/');
  }

  res.render('user/verifyOtp',{ otpExpiration: tempUser.otpExpiration,message: req.flash('message')})
}



export const CreateAccount = async (req, res) => {
  try {
      const { name, email, password, confirmPassword ,referenceCode } = req.body;

      if (!name || !email || !password || !confirmPassword) {
          console.log("Invalid Inputs");
          req.flash('message', 'Enter all the inputs');
          return res.redirect('/login');
      }

      if (password !== confirmPassword) {
          console.log("Password is not matching");
          req.flash('message', 'Password is not matching');
          return res.redirect('/login');
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          console.log("User already exists");
          req.flash('message', 'Email is already registered');
          return res.redirect('/login');
      }

      
      let refCodeOwner;
      if (referenceCode) {
          refCodeOwner = await User.findOne({ refCode: referenceCode });
          if (!refCodeOwner) {
              req.flash('message', 'Invalid Reference Code');
              return res.redirect('/login');
          }
      }




      
      await sendOTP(email);
      req.flash('message', 'OTP sent to your email. Verify to continue.');

      const otpExpiration = Date.now() + 5 * 60 * 1000;

      req.session.tempUser = { name, email, password,otpExpiration,refCodeOwner }; 

      return res.redirect('/verifyotp');
  } catch (err) {
      console.log("Error While Creating the Account:", err);
  }
};


export const VerifyOTP = async (req, res) => {
  try {
      const { otp } = req.body;
      const tempUser = req.session.tempUser;

      if (!tempUser) {
          req.flash('message', 'Session expired. Start again.');
          return res.redirect('/login');
      }

      const validOTP = await OTP.findOne({ email: tempUser.email, otp });

      if (!validOTP) {
          req.flash('message', 'Invalid or expired OTP.');
          return res.redirect('/verifyotp');
      }

      // Check if refCodeOwner exists
      if (tempUser.refCodeOwner && tempUser.refCodeOwner._id) {
          let OwnerWallet = await Wallet.findOne({ user: tempUser.refCodeOwner._id });
          if (!OwnerWallet) {
              OwnerWallet = new Wallet({ user: tempUser.refCodeOwner._id, balance: 0, transaction: [] });
          }
          OwnerWallet.balance += 100;
          OwnerWallet.transaction.push({
              amount: 100,
              transactionId: `TXN${Date.now()}`,
              productName: "Reward Earned Through Referral",
              type: 'credit',
          });
          await OwnerWallet.save();
      }

      const hashPassword = await bcrypt.hash(tempUser.password, 10);
      
      const refCode = `Ref${Date.now()}`;
      const newUser = new User({
          name: tempUser.name,
          email: tempUser.email,
          refCode,
          password: hashPassword
      });

      await newUser.save();

      if (tempUser.refCodeOwner && tempUser.refCodeOwner._id){

     
      let userWallet = await Wallet.findOne({ user: newUser._id });
      if (!userWallet) {
          userWallet = new Wallet({ user: newUser._id, balance: 0, transaction: [] });
      }

      userWallet.balance += 50;
      userWallet.transaction.push({
          amount: 50,
          transactionId: `TXN${Date.now()}`, 
          productName: "Referral Code Incentive", 
          type: 'credit',
      });
      await userWallet.save();

    }

      req.session.user = newUser;
      req.session.tempUser = null; 
      await OTP.deleteMany({ email: tempUser.email }); 
      return res.redirect('/');
  } catch (err) {
      console.log("Error Verifying OTP:", err);
  }
};




export const resentOTP=async(req,res)=>{
  try{
    const {tempUser}=req.session
    if(!tempUser){
      req.flash('message','Session expired.start again.')
      return res.redirect('/login')
    }

    await sendOTP(tempUser.email)

    const otpExpiration=Date.now() + 5 * 60 * 1000;
    req.session.tempUser.otpExpiration=otpExpiration

    req.flash('message',"New OTP sent to your email .please verify")
    return res.redirect('/verifyotp')

  }catch(err){
    console.log("Error while ResentOTP");
    
  }
}



export const LoginAccount=async(req,res)=>{
  try{
         const {loginEmail,loginPassword}=req.body

              if(!loginEmail || !loginPassword){
                req.flash('message', 'Enter All the Inputs');
                res.redirect('/login')
              }

              const existingUser= await User.findOne({email : loginEmail})
                   
              if(!existingUser){
                req.flash('message',"Account is not found this email")
                return res.redirect('/login')
              }
             
              const isMatch=await bcrypt.compare(loginPassword,existingUser.password)
              if(!isMatch){
                req.flash("message",'Incorrect Password')
                return res.redirect('/login')
              }

              if(existingUser.isActive===false){
                req.flash("message","You can not login,becouse you are blocked")
                console.log(existingUser);
                
                return res.redirect('/login')
              }

              req.session.user =existingUser



           req.session.userId= new mongoose.Types.ObjectId(existingUser._id)
            console.log("Session User ",req.session.user);
            
            return res.redirect('/')

                  
  }catch(err){
    console.log("Error while login the account : ",err);
    
  }
}



export const Logout=async(req,res)=>{
  try{
    console.log(req.session.user);
    
        req.session.destroy((err)=>{
          if(err){
            console.log("Error while session destroyed");
            return res.redirect('/')
            
          }
          console.log("Session destroyed successfully");
          return res.redirect('/')
          
        })
  }catch(err){
    console.log("Error during logout",err);
    
  }
}



// -----------------------------------------------Forgot Password Section-------------------------- 



export const getForgotPasswordPage=(req,res)=>{


  
    res.render('user/forgotpassword', {
        message: req.flash('message')
    });
}
 
export const getNewPasswordPage=(req,res)=>{
  res.render('user/newpassword',{message:req.flash('message')})
}


export const forgotOtpPage=(req,res)=>{
 // res.render('user/forgototp',{message:req.flash('message')})

 const { resetUser } = req.session;

 // Ensure resetUser and otpExpiration exist in the session
 if (!resetUser || !resetUser.otpExpiration) {
     req.flash('message', 'Session expired. Start again.');
     return res.redirect('/forgotpassword'); // Redirect appropriately
 }

 res.render('user/forgototp', {
     message: req.flash('message'),
     otpExpiration: resetUser.otpExpiration, // Pass otpExpiration to the template
 });
  
}

export const getEnterPasswordOTP=(req,res)=>{
  res.render('user/forgototp',{message:req.flash('message')})
}


export const sendPasswordResetOTP=async(req,res)=>{
  try{
    const {email}=req.body;
    if(!email){
      req.flash('message',"Enter Your Registered Email")
      res.redirect('/forgotpassword')
    }

  const user= await User.findOne({email})
  if(!user){
        req.flash('message',"Email is not Registered")
        res.redirect('/forgotpassword')
  }

  await sendOTP(email)

  const otpExpiration=Date.now() + 5 * 60 * 1000
  req.session.resetUser={email,otpExpiration}
 
  req.flash('message','OTP sent to your email. Verify to reset password')
    return res.redirect('/enterpasswordotp')
  }catch(err){
    console.log("Error while Sending password Reset otp :",err);
    
  }
}


export const verifyResentOTP= async(req,res)=>{
  try{
    const {otp}=req.body;
    const resetUser=req.session.resetUser;
    if(!resetUser){
      req.flash('message',"Session expired. Start Again")
      return res.redirect('/forgotpassword')
    } 

    if (Date.now() > resetUser.otpExpiration) {
      req.flash('message', 'OTP has expired. Please request a new OTP.');
      return res.redirect('/forgotpassword');
  }



    const validOTP= await OTP.findOne({email:resetUser.email,otp})
    if(!validOTP){
      req.flash('message','Invalid or expired OTP')
      return res.redirect('/enterpasswordotp')
    }

    req.flash('message', 'OTP verified. You can reset your password now.');
    return res.redirect('/newpassword');

  }catch(err){
    console.log("Error verifying Reset OTp",err);
    
  }
}


export const resetPassword=async(req,res)=>{
  try{

    const {newpassword,confirmnewPassword}=req.body
    const resetUser=req.session.resetUser

    if(!resetUser){
      req.flash('message', 'Session expired. Start again.');
      return res.redirect('/forgotpassword');  
    }



    if (!newpassword || !confirmnewPassword) {
      req.flash('message', 'Enter all the fields.');
      return res.redirect('/newpassword');
  }

  if (newpassword !== confirmnewPassword) {
    req.flash('message', 'Passwords do not match.');
    return res.redirect('/newpassword');
}

const hashPassword = await bcrypt.hash(newpassword, 10);
 
await User.updateOne(
  { email: resetUser.email },
  { $set: { password: hashPassword } }
);

req.session.resetUser = null;
req.flash('message', 'Password reset successful. Log in with your new password.');
return res.redirect('/login');

  }catch(err){
    console.log("Error while reseting password :",err);
    
  }
}






