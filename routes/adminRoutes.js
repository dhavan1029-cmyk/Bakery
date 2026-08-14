import express from 'express'
import { getLoginPage, getOrders, loginAdmin, renderDashboard } from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin/login', getLoginPage)

router.get('/admin/dashboard', renderDashboard)

router.post('/admin/login', loginAdmin)

router.get('/admin/orders', getOrders)

export default router