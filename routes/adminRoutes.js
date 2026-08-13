import express from 'express'
import { getLoginPage } from '../controllers/adminController.js'

const router = express.Router()

router.get('/admin/login', getLoginPage)

export default router