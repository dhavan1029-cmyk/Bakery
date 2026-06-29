import express from "express";
import userModel from "../models/userModel.js";
import { home, about, contact, checkout } from "../controllers/pageController.js";

const router = express.Router();

router.get('/', home);

router.get('/about', about);

router.get('/contact', contact);

router.get('/checkout', checkout);

export default router;