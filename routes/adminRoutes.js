import express from 'express'
import { getLoginPage, loginAdmin, renderDashboard } from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin/login', getLoginPage)

router.get('/admin/dashboard', renderDashboard)

router.post('/admin/login', loginAdmin)

export default router