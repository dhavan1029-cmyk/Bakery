import './config/env.js'
import './config/mongoose.js'
import express from 'express'
import path from 'path'
import pageRoutes from './routes/pageRoutes.js'
import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import { checkAuth } from './middlewares/authMiddleware.js'
import ordersModel from './models/ordersModel.js'


const app = express()

app.use(cookieParser())

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(process.cwd(), 'public')))

app.use(checkAuth)
app.use(userRoutes)
app.use(pageRoutes)
app.use(productRoutes)
app.use(authRoutes)

app.listen(process.env.PORT)
// console.log(process.env)