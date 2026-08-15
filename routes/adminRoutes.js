import express from 'express'
import { checkAdminAuth } from '../middlewares/adminMiddleware.js'
import { getLoginPage, loginAdmin } from '../controllers/admin/authController.js'
import { renderDashboard } from '../controllers/admin/dashboardController.js'
import { getOrder, getOrders } from '../controllers/admin/orderController.js'
import { getProducts, renderAddProduct, renderEditProduct } from '../controllers/admin/productController.js'
import { renderCustomer, renderCustomers } from '../controllers/admin/customerController.js'
import { renderAdminSettings } from '../controllers/admin/settingsController.js'
import { renderAdminAccount, renderChangePassword } from '../controllers/admin/profileController.js'

const router = express.Router()

router.get('/admin/login', getLoginPage)

router.get('/admin/dashboard', checkAdminAuth, renderDashboard)

router.post('/admin/login', loginAdmin)

router.get('/admin/orders', checkAdminAuth, getOrders)

router.get('/admin/orders/:id', checkAdminAuth, getOrder)

router.get('/admin/products', checkAdminAuth, getProducts)

router.get('/admin/products/new', checkAdminAuth, renderAddProduct)

router.get('/admin/products/:id/edit', checkAdminAuth, renderEditProduct)

router.get('/admin/customers', checkAdminAuth, renderCustomers)

router.get('/admin/customers/:id', checkAdminAuth, renderCustomer)

router.get('/admin/account', checkAdminAuth, renderAdminAccount)

router.get('/admin/account/change-password', checkAdminAuth, renderChangePassword)

router.get('/admin/settings', checkAdminAuth, renderAdminSettings)

export default router