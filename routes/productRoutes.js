import express from 'express';

import {getMenu, searchProducts, renderProduct} from "../controllers/productController.js";

const router = express.Router()

router.get('/menu', getMenu);

router.get('/product/:id', renderProduct);

router.get('/search', searchProducts)

export default router
