import express from 'express';
import { getCheckoutPage, placeOrder } from '../controllers/checkoutController.js';

const router = express.Router()

router.get('/checkout', getCheckoutPage)

router.post('/checkout', placeOrder)
export default router