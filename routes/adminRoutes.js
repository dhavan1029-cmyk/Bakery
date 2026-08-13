import express from 'express'
import { getLoginPage, renderDashboard } from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin/login', getLoginPage)

router.get('/admin/dashboard', renderDashboard)

export default router