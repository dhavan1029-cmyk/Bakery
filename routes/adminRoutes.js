import express from 'express'
import { checkAdminAuth } from '../middlewares/adminMiddleware.js'
import { getLoginPage, loginAdmin } from '../controllers/admin/authController.js'
import { renderDashboard } from '../controllers/admin/dashboardController.js'
import { changeOrderStatus, getOrder, getOrders } from '../controllers/admin/orderController.js'
import { createNewProduct, getProducts, renderAddProduct, renderEditProduct } from '../controllers/admin/productController.js'
import { renderCustomer, renderCustomers } from '../controllers/admin/customerController.js'
import { renderAdminSettings } from '../controllers/admin/settingsController.js'
import { renderAdminAccount, renderChangePassword } from '../controllers/admin/profileController.js'
import upload from '../middlewares/uploadMiddleware.js'

const router = express.Router()


//auth routes

router.get('/admin/login', getLoginPage)

router.post('/admin/login', loginAdmin)

//dashboard

router.get('/admin/dashboard', checkAdminAuth, renderDashboard)

//order routes

router.get('/admin/orders', checkAdminAuth, getOrders)

router.get('/admin/orders/:id', checkAdminAuth, getOrder)

router.post('/admin/orders/:id/status', changeOrderStatus)

// product routes

router.get('/admin/products', checkAdminAuth, getProducts)

router.get('/admin/products/new', checkAdminAuth, renderAddProduct)

router.get('/admin/products/:id/edit', checkAdminAuth, renderEditProduct)

router.post('/admin/products/new', checkAdminAuth, upload.single('image'), createNewProduct)

//customer routes

router.get('/admin/customers', checkAdminAuth, renderCustomers)

router.get('/admin/customers/:id', checkAdminAuth, renderCustomer)

// account routes

router.get('/admin/account', checkAdminAuth, renderAdminAccount)

router.get('/admin/account/change-password', checkAdminAuth, renderChangePassword)

// settings routes

router.get('/admin/settings', checkAdminAuth, renderAdminSettings)

export default router