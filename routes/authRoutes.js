import express from 'express'
import { getLoginPage, getSignupPage, loginUser, signupUser } from "../controllers/authController.js";
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: 'Too many login attempts. Please try again later.',
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    message: 'Too many signup attempts. Please try again later.',
    standardHeaders: 'draft-8',
    legacyHeaders: false
})

const router = express.Router()

router.get('/login', getLoginPage);

router.get('/signup', getSignupPage);

router.post('/login', loginLimiter, loginUser)

router.post('/signup', signupLimiter, signupUser)

export default router