import express from 'express'
import { AdminDashboard, AdminLogin, createAccount, getLoginPage } from '../controllers/adminControllers/authController.js'


const adminRouter=express() 

adminRouter.get('/',getLoginPage)
adminRouter.post('/adminlogin',AdminLogin)
adminRouter.post('/signup',createAccount)



adminRouter.get('/dashboard',AdminDashboard)




export default adminRouter 