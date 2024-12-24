import express from 'express'
import { CreateAccount, forgotOtpPage, getEnterPasswordOTP, getForgotPasswordPage, getHomePage, getLoginPage, getNewPasswordPage, getOtpPage, LoginAccount, Logout, resentOTP, resetPassword, sendPasswordResetOTP, VerifyOTP, verifyResentOTP } from '../controllers/userControllers/authControllers.js'
import { isUserNotAuth } from '../middleware.js'
import passport from 'passport'
import { getProduct, getShopPage } from '../controllers/userControllers/productControllers.js'

const userRouter=express.Router()

// ----------------------------------Authentication Section-------------------------------------------

userRouter.get('/login',isUserNotAuth ,getLoginPage)
userRouter.get('/verifyotp',getOtpPage)

userRouter.post('/login',LoginAccount)
userRouter.post('/signup',CreateAccount)
userRouter.post('/verifyotp',VerifyOTP)
userRouter.post('/resendotp',resentOTP)
userRouter.post('/logout',Logout)


// Google login and signup section
userRouter.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
userRouter.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
    console.log("Google login Successfully completed");
    req.session.user=req.user.name
    res.redirect('/')
})

// -------------------Forgot Password Section------------------------------------------------------------

userRouter.get('/forgotpassword',getForgotPasswordPage)
userRouter.get('/newpassword',getNewPasswordPage)
userRouter.get('/forgotpasswordotp',forgotOtpPage)
userRouter.get('/enterpasswordotp',getEnterPasswordOTP)

userRouter.post('/passwordemail',sendPasswordResetOTP)
userRouter.post('/passwordotp',verifyResentOTP)
userRouter.post('/resetpassword',resetPassword)




// --------------------------------Rendering the user side pages--------------------------------------------------



userRouter.get('/',getHomePage)
userRouter.get('/shop',getShopPage)
userRouter.get('/product',getProduct)





export default userRouter 