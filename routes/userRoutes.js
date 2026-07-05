import express from 'express'

import { deleteItem, getAccount, getCartItems, getOrders } from '../controllers/userController.js'

const router = express.Router()

router.get('/account', getAccount)

router.get('/cart', getCartItems)

router.delete('/cart', deleteItem)

router.get('/orders', getOrders)

export default router