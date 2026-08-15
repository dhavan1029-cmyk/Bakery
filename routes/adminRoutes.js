import express from 'express'
import { getLoginPage, getOrder, getOrders, getProducts, loginAdmin, renderAddProduct, renderCustomers, renderDashboard, renderEditProduct } from '../controllers/adminController.js'
import { checkAdminAuth } from '../middlewares/adminMiddleware.js'

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

export default router