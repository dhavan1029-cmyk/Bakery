import express from 'express'
import { getLoginPage, getSignupPage, loginUser, signupUser } from "../controllers/authController.js";

const router = express.Router()

router.get('/login', getLoginPage);

router.get('/signup', getSignupPage);

router.post('/login', loginUser)

router.post('/signup', signupUser)

export default router