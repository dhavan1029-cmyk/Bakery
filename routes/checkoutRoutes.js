import express from 'express';
import { getCheckoutPage, placeOrder } from '../controllers/checkoutController.js';
import { loadSettings } from '../middlewares/userMiddlewares.js';

const router = express.Router()

router.get('/checkout', loadSettings, getCheckoutPage)

router.post('/checkout', loadSettings, placeOrder)

export default router