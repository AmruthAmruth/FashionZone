import express from 'express'
import { CreateAccount, forgotOtpPage, getEnterPasswordOTP, getForgotPasswordPage, getHomePage, getLoginPage, getNewPasswordPage, getOtpPage, LoginAccount, Logout, resentOTP, resetPassword, sendPasswordResetOTP, VerifyOTP, verifyResentOTP } from '../controllers/userControllers/authControllers.js'
import passport from 'passport'
import { addToCart, cartPriceList, getCartPage, getFeaturedProducts, getMenProducts, getNewArrivals, getProduct, getProductbyId, getShopPage, getUserCart, getWomenProducts, priceHighToLow, priceLowToHigh, removeFromCart, sortByAToZ, sortByZToA, updateCart } from '../controllers/userControllers/productControllers.js'
import { isUserAuthenticated } from '../middileware/auth.js'
import { createAddress, deleteAddress, editAddress, getAddress, getProfilePage, updateName } from '../controllers/userControllers/profileControllers.js'
import mongoose from 'mongoose'
import { checkoutAddAddress, checkoutEditAddress, checkoutPage } from '../controllers/userControllers/chekoutControllers.js'
import { cancelOrder, createOrder, createRazorpayOrder, getOrders, orderSummery, verifyRazorpayPayment } from '../controllers/userControllers/orderControllers.js'
import { addToWishlist, getWishList, removeProductFromWishlist } from '../controllers/userControllers/wishlistControllers.js'

const userRouter=express.Router()






// ----------------------------------Authentication Section-------------------------------------------

userRouter.get('/login',isUserAuthenticated,getLoginPage)
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
    
    req.session.userId=new mongoose.Types.ObjectId(req.user._id)
    console.log(req.user);
    
    req.session.user=req.user
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
userRouter.get('/product/:id',getProductbyId)


// --------------Product Sorted Area---------------------------------------

userRouter.get('/shop/sort/low-to-high',priceLowToHigh)
userRouter.get('/shop/sort/high-to-low',priceHighToLow)
userRouter.get('/shop/sort/newarrivals',getNewArrivals)
userRouter.get('/shop/sort/z-to-a',sortByZToA)
userRouter.get('/shop/sort/a-to-z',sortByAToZ)
userRouter.get('/shop/sort/men',getMenProducts)
userRouter.get('/shop/sort/women',getWomenProducts)
userRouter.get('/shop/sort/featured',getFeaturedProducts)

//--------------Cart Section ---------------------------------

userRouter.get('/cart',getUserCart,cartPriceList,getCartPage)
userRouter.post('/cart/add/:productId',addToCart)
userRouter.post('/cart/update/:productId',updateCart)
userRouter.post('/cart/remove/:productId',removeFromCart)




//-------------------User Profile Section----------------------------------------

userRouter.get('/profile', getAddress, getOrders, getProfilePage);
userRouter.post('/address',createAddress)
userRouter.post('/profile/delete/:addressId',deleteAddress)
userRouter.post('/profile/edit',editAddress)
userRouter.post('/updatename',updateName)



// ---------------Checkout Section------------------------

userRouter.get('/checkout',checkoutPage)
userRouter.post('/checkoutaddaddress',checkoutAddAddress)
userRouter.post('/checkouteditaddress',checkoutEditAddress)



// ---------------------------Order Section----------------------------------------------------------------
 
userRouter.post('/codcontroller',createOrder)
userRouter.get('/ordersummery/:orderId',orderSummery)
userRouter.post('/orders/cancel', cancelOrder)
userRouter.post('/razorpaycontroller', createRazorpayOrder)
userRouter.post('/verifypayment', verifyRazorpayPayment)



// ----------------------Wish list -----------------------------------------------------

userRouter.get('/wishlist',getWishList)
userRouter.post('/wishlist',addToWishlist)
userRouter.post('/removewishlist',removeProductFromWishlist)


export default userRouter 