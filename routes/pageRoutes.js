import express from "express";
import { home, about, contact } from "../controllers/pageController.js";

const router = express.Router();

router.get('/', home);

router.get('/about', about);

router.get('/contact', contact);

router.get('/order-success/:orderID', (req, res) => {
    res.render('order-success', {orderId: req.params.orderID})
})

router.get('/serverError', (req, res) => {
    res.render('server-error')
})

export default router;