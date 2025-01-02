import express from 'express'
import { AdminDashboard, AdminLogin, AdminLogout, createAccount, getLoginPage } from '../controllers/adminControllers/authController.js'
import { addProduct, deleteProduct, getAddProductPage, getAllProductPage, getUpdateProductPage, updateProduct } from '../controllers/adminControllers/productController.js'
import upload from '../middileware/multer.js'
import { blockAndUnblock, getUserListPage } from '../controllers/adminControllers/userController.js'
import { adminAutherization, isAdminAuthenticated } from '../middileware/auth.js'
import { addCategory, getCategoryPage } from '../controllers/adminControllers/categoryController.js'

const adminRouter=express() 






// ------------------------Admin Authentication------------------------------------------------

adminRouter.get('/',isAdminAuthenticated,getLoginPage)
adminRouter.post('/adminlogin',AdminLogin)
adminRouter.post('/signup',createAccount)
adminRouter.post('/adminlogout',AdminLogout)





// ------------------------ Product Section ------------------------------------------------------
 
adminRouter.get('/dashboard',adminAutherization,AdminDashboard)
adminRouter.get('/addproduct',adminAutherization,getAddProductPage)
adminRouter.get('/products',adminAutherization,getAllProductPage)
adminRouter.post('/addproduct',upload.array('images[]',4),addProduct)
adminRouter.get('/updateproduct/:id',adminAutherization,getUpdateProductPage)
adminRouter.post('/updateproduct/:id', upload.array('images[]', 4), updateProduct);





// -----------Soft delete section for user and product--------------------------

adminRouter.post('/toggleproduct/:id',deleteProduct)
adminRouter.get('/userlist',adminAutherization,getUserListPage)
adminRouter.post('/toggleusers/:id',blockAndUnblock)


//  ---------------------Category Management------------------------------------

adminRouter.get('/catogory',getCategoryPage)
adminRouter.post('/addcategory',addCategory)

export default adminRouter   