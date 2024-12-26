import express from 'express'
import { AdminDashboard, AdminLogin, AdminLogout, createAccount, getLoginPage } from '../controllers/adminControllers/authController.js'
import { addProduct, deleteProduct, getAddProductPage, getAllProductPage, getUpdateProductPage, updateProduct } from '../controllers/adminControllers/productController.js'
import upload from '../middileware/multer.js'
import { blockAndUnblock, getUserListPage } from '../controllers/adminControllers/userController.js'
import { isAdminAuthenticated } from '../middileware/auth.js'

const adminRouter=express() 

// ------------------------Admin Authentication------------------------------------------------

adminRouter.get('/',getLoginPage)
adminRouter.post('/adminlogin',AdminLogin)
adminRouter.post('/signup',createAccount)
adminRouter.post('/adminlogout',AdminLogout)



// ------------------------ Product Section ------------------------------------------------------

adminRouter.get('/dashboard',isAdminAuthenticated,AdminDashboard)
adminRouter.get('/addproduct',isAdminAuthenticated,getAddProductPage)
adminRouter.get('/products',isAdminAuthenticated,getAllProductPage)
adminRouter.post('/addproduct',upload.array('images[]',4),addProduct)
adminRouter.get('/updateproduct/:id',isAdminAuthenticated,getUpdateProductPage)
adminRouter.post('/updateproduct/:id', upload.array('images[]', 4), updateProduct);

// -----------Soft delete section for user and product--------------------------


adminRouter.post('/toggleproduct/:id',deleteProduct)
adminRouter.get('/userlist',isAdminAuthenticated,getUserListPage)
adminRouter.post('/toggleusers/:id',blockAndUnblock)


 

export default adminRouter   