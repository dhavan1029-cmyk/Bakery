import './config/mongoose.js'
import express from 'express'
import path from 'path'
import pageRoutes from './routes/pageRoutes.js'
import productModel from './models/productModel.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(process.cwd(), 'public')))

app.use(pageRoutes)

app.listen(3000)