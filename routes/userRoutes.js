import express from 'express'

import { getAccount } from '../controllers/userController.js'

const router = express.Router()

router.get('/account', getAccount)

export default router