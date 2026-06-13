import express from "express";
import { home, about, contact, login, signup, cart, checkout, orders } from "../controllers/pageController.js";
import menu from "../controllers/menuController.js";
import product from "../controllers/productController.js";

const router = express.Router();

router.get('/', home);

router.get('/menu', menu);

router.get('/about', about);

router.get('/contact', contact);

router.get('/login', login);

router.get('/signup', signup);

router.get('/cart', cart);

router.get('/checkout', checkout);

router.get('/orders', orders);

router.get('/product/:id', product);

export default router;