import './config/mongoose.js'
import express from 'express'
import path from 'path'
import pageRoutes from './routes/pageRoutes.js'
import productRoutes from './routes/productRoutes.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(express.static(path.join(process.cwd(), 'public')))

const user = {
    username: "James",
    email: "jamesjohny@example.com",
    orders: [
        "6858a7f9c5a123456789abcd",
        "6858a7f9c5a123456789abce",
        "6858a7f9c5a123456789abcf"
    ],
    cart: [
        {
            product: "6858a7f9c5a123456789abd1",
            quantity: 2
        },
        {
            product: "6858a7f9c5a123456789abd2",
            quantity: 1
        }
    ],
    createdAt: new Date("2026-01-15")
};

app.use(pageRoutes)
app.use(productRoutes)
app.get('/user', function(req, res){
    res.render('user', { user })
})

app.listen(3000)