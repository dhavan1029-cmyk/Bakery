import express from 'express'

import { deleteItem, getAccount, getCartItems, getOrders, addToCart, changeQty } from '../controllers/userController.js'

const router = express.Router()

router.get('/account', getAccount)

router.get('/cart', getCartItems)

router.post('/cart', addToCart)

router.delete('/cart', deleteItem)

router.patch('/cart', changeQty)

router.get('/orders', getOrders)

export default router