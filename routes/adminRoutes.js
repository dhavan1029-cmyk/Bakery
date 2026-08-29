import express from 'express'
import { checkAdminAuth } from '../middlewares/adminMiddleware.js'
import { getLoginPage, loginAdmin } from '../controllers/admin/authController.js'
import { renderDashboard } from '../controllers/admin/dashboardController.js'
import { changeOrderStatus, getOrder, getOrders } from '../controllers/admin/orderController.js'
import { createNewProduct, deleteProduct, editProduct, getProducts, renderAddProduct, renderEditProduct } from '../controllers/admin/productController.js'
import { renderCustomer, renderCustomers } from '../controllers/admin/customerController.js'
import { renderAdminSettings, updateSettings } from '../controllers/admin/settingsController.js'
import { changePassword, logoutAdmin, renderAdminAccount, renderChangePassword } from '../controllers/admin/profileController.js'
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

router.post('/admin/products/:id/edit', checkAdminAuth, upload.single('image'), editProduct)

router.post('/admin/products/:id/delete', checkAdminAuth, deleteProduct)

//customer routes

router.get('/admin/customers', checkAdminAuth, renderCustomers)

router.get('/admin/customers/:id', checkAdminAuth, renderCustomer)

// account routes

router.get('/admin/account', checkAdminAuth, renderAdminAccount)

router.get('/admin/account/change-password', checkAdminAuth, renderChangePassword)

router.post('/admin/account/change-password', checkAdminAuth, changePassword)

router.post('/admin/logout', checkAdminAuth, logoutAdmin)

// settings routes

router.get('/admin/settings', checkAdminAuth, renderAdminSettings)

router.post('/admin/settings', checkAdminAuth, updateSettings)

export default router