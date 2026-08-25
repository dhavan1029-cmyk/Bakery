import express from 'express'

import { getAccount, logoutUser } from '../controllers/userController.js'
import { getCartItems, addToCart, changeQty, deleteItem } from '../controllers/cartController.js'
import { getOrders, getOrder, cancelOrder } from '../controllers/orderController.js'
import { unauthoziedAction } from '../controllers/pageController.js'


const router = express.Router()

router.get('/account', getAccount)

router.get('/cart', getCartItems)

router.post('/cart', addToCart)

router.delete('/cart', deleteItem)

router.patch('/cart', changeQty)

router.get('/orders', getOrders)

router.get('/orders/:order', getOrder)

router.post('/orders/:order/cancel', cancelOrder)

router.post('/logout', logoutUser)

router.get('/unauthorizedAction', unauthoziedAction)

export default router