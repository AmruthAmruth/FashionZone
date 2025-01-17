import express from 'express'
import { AdminDashboard, AdminLogin, AdminLogout, createAccount, getLoginPage } from '../controllers/adminControllers/authController.js'
import { addProduct, deleteProduct, getAddProductPage, getAllProductPage, getCategory, getUpdateProductPage, updateProduct } from '../controllers/adminControllers/productController.js'
import upload from '../middileware/multer.js'
import { blockAndUnblock, getUserListPage } from '../controllers/adminControllers/userController.js'
import { adminAutherization, isAdminAuthenticated } from '../middileware/auth.js'
import { createCategory, editCategory, getCategoryPage, showAndHideCategory } from '../controllers/adminControllers/categoryController.js'
import { changeTheOrderStatus, getOrderDetails, getOrderList, getSalesChartReport, mostSoldProductsCatagorysAndBrands } from '../controllers/adminControllers/orderController.js'
import { addOfferForCategory, addOfferForProduct, deleteCategoryOffer, deleteProductOffer, editCategoryOffer, editOfferForProduct, getCategoryOffer, getOfferPage, updateCategoryOfferStatus, updateProductOfferStatus } from '../controllers/adminControllers/offerController.js'
import { addCoupon, couponSoftDelete, editCoupon, getCoupenspage } from '../controllers/adminControllers/coupenController.js'
import { getSalesReportPage } from '../controllers/adminControllers/salesReportController.js'

const adminRouter=express() 




// ------------------------Admin Authentication------------------------------------------------

adminRouter.get('/',isAdminAuthenticated,getLoginPage)
adminRouter.post('/adminlogin',AdminLogin)
adminRouter.post('/signup',createAccount)
adminRouter.post('/adminlogout',AdminLogout)





// ------------------------ Product Section ------------------------------------------------------
 
adminRouter.get('/dashboard',adminAutherization, getSalesChartReport,mostSoldProductsCatagorysAndBrands,AdminDashboard)
adminRouter.get('/addproduct',adminAutherization,getCategory,getAddProductPage)
adminRouter.get('/products',adminAutherization,getAllProductPage)
adminRouter.post('/addproduct',upload.array('images[]',4),addProduct)
adminRouter.get('/updateproduct/:id',adminAutherization,getUpdateProductPage)
adminRouter.post('/updateproduct/:id', upload.array('images[]', 4), updateProduct);





// -----------Soft delete section for user and product--------------------------

adminRouter.post('/toggleproduct/:id',deleteProduct)
adminRouter.get('/userlist',adminAutherization,getUserListPage)
adminRouter.post('/toggleusers/:id',blockAndUnblock)


//  ---------------------Category Management------------------------------------

adminRouter.get('/categories',getCategoryPage)
adminRouter.post('/addcategory',createCategory)
adminRouter.post('/togglecategory/:id', showAndHideCategory)
adminRouter.post('/editcategory/:id',editCategory)


// -----------Order Management------------------------------

adminRouter.get('/orderlist',getOrderList)
adminRouter.get('/orderdetails/:id',getOrderDetails)
adminRouter.post('/changestatus/:id',changeTheOrderStatus)



// --------------Offer section=------------------------


adminRouter.get('/offers',getOfferPage)
adminRouter.post('/addofferforproduct',addOfferForProduct)
adminRouter.post('/editofferforproduct',upload.none(),editOfferForProduct)
adminRouter.post('/deleteproductoffer',deleteProductOffer)
adminRouter.post('/addofferforcategory', addOfferForCategory)
adminRouter.get('/categoryoffer',getCategoryOffer)
adminRouter.post('/editcategoryoffer',editCategoryOffer)
adminRouter.post('/deletecategoryoffer',deleteCategoryOffer)
adminRouter.post('/updateofferstatus/:id', updateProductOfferStatus);
adminRouter.post('/categoryofferstatus',updateCategoryOfferStatus)



// -------------------Coupens management ----------------------------------
adminRouter.get('/coupones',getCoupenspage)
adminRouter.post('/addcoupon',addCoupon)
adminRouter.post('/editcoupon',editCoupon)
adminRouter.post('/couponsoftdelete',couponSoftDelete)




// -------------------Salse report management section-------------------------------------------------

adminRouter.get('/salesReport',getSalesReportPage)











export default adminRouter   