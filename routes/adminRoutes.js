import express from 'express'
import { AdminDashboard, AdminLogin, AdminLogout, getLoginPage } from '../controllers/adminControllers/authController.js'
import { addProduct, deleteProduct, getAddProductPage, getAllProductPage, getCategory, getUpdateProductPage, updateProduct } from '../controllers/adminControllers/productController.js'
import upload from '../middileware/multer.js'
import { blockAndUnblock, getUserListPage } from '../controllers/adminControllers/userController.js'
import { adminAutherization, isAdminAuthenticated } from '../middileware/auth.js'
import { createCategory, editCategory, getCategoryPage, showAndHideCategory } from '../controllers/adminControllers/categoryController.js'
import { changeTheOrderStatus, getOrderDetails, getOrderList, getSalesChartReport, mostSoldProductsCatagorysAndBrands } from '../controllers/adminControllers/orderController.js'
import { addOfferForCategory, addOfferForProduct, deleteCategoryOffer, deleteProductOffer, editCategoryOffer, editOfferForProduct, getCategoryOffer, getOfferPage, updateCategoryOfferStatus, updateProductOfferStatus } from '../controllers/adminControllers/offerController.js'
import { addCoupon, couponSoftDelete, editCoupon, getCoupenspage } from '../controllers/adminControllers/coupenController.js'
import { getSalesReportPage } from '../controllers/adminControllers/salesReportController.js'

const adminRouter = express()

// Public admin routes (login only)
adminRouter.get('/', isAdminAuthenticated, getLoginPage)
adminRouter.post('/adminlogin', AdminLogin)

// All routes below require admin authentication
adminRouter.use(adminAutherization)

adminRouter.post('/adminlogout', AdminLogout)

// Dashboard
adminRouter.get('/dashboard', getSalesChartReport, mostSoldProductsCatagorysAndBrands, AdminDashboard)

// Products
adminRouter.get('/addproduct', getCategory, getAddProductPage)
adminRouter.get('/products', getAllProductPage)
adminRouter.post('/addproduct', upload.array('images[]', 4), addProduct)
adminRouter.get('/updateproduct/:id', getUpdateProductPage)
adminRouter.post('/updateproduct/:id', upload.array('images[]', 4), updateProduct)
adminRouter.post('/toggleproduct/:id', deleteProduct)

// Users
adminRouter.get('/userlist', getUserListPage)
adminRouter.post('/toggleusers/:id', blockAndUnblock)

// Categories
adminRouter.get('/categories', getCategoryPage)
adminRouter.post('/addcategory', createCategory)
adminRouter.post('/togglecategory/:id', showAndHideCategory)
adminRouter.post('/editcategory/:id', editCategory)

// Orders
adminRouter.get('/orderlist', getOrderList)
adminRouter.get('/orderdetails/:id', getOrderDetails)
adminRouter.post('/changestatus/:id', changeTheOrderStatus)

// Offers
adminRouter.get('/offers', getOfferPage)
adminRouter.post('/addofferforproduct', addOfferForProduct)
adminRouter.post('/editofferforproduct', upload.none(), editOfferForProduct)
adminRouter.post('/deleteproductoffer', deleteProductOffer)
adminRouter.post('/addofferforcategory', addOfferForCategory)
adminRouter.get('/categoryoffer', getCategoryOffer)
adminRouter.post('/editcategoryoffer', editCategoryOffer)
adminRouter.post('/deletecategoryoffer', deleteCategoryOffer)
adminRouter.post('/updateofferstatus/:id', updateProductOfferStatus)
adminRouter.post('/categoryofferstatus', updateCategoryOfferStatus)

// Coupons
adminRouter.get('/coupones', getCoupenspage)
adminRouter.post('/addcoupon', addCoupon)
adminRouter.post('/editcoupon', editCoupon)
adminRouter.post('/couponsoftdelete', couponSoftDelete)

// Sales report
adminRouter.get('/salesReport', getSalesReportPage)

export default adminRouter
