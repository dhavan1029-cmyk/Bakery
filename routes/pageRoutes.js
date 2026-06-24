import express from "express";
import userModel from "../models/userModel.js";
import { home, about, contact, cart, checkout, orders } from "../controllers/pageController.js";

const router = express.Router();

router.get('/', function(req, res){
    home(req, res)
    console.log(req.cookies)
    // userModel.deleteMany({})
    // .then(data => {
    //     userModel.find({})
    //     .then(data => {
    //         console.log(data)
    //     })
    // })
});

router.get('/about', about);

router.get('/contact', contact);

router.get('/cart', cart);

router.get('/checkout', checkout);

router.get('/orders', orders);

export default router;