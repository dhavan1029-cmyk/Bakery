import './config/mongoose.js'
import express from 'express'
import path from 'path'
import homeRoute from './routes/homeRoute.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(process.cwd(), 'public')))

const cartItems = [
    {
        _id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        price: 799,
        quantity: 2,
        image: ""
    },
    {
        _id: "2",
        name: "Croissant",
        category: "Pastries",
        price: 149,
        quantity: 4,
        image: ""
    },{
        _id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        price: 799,
        quantity: 2,
        image: ""
    },
    {
        _id: "2",
        name: "Croissant",
        category: "Pastries",
        price: 149,
        quantity: 4,
        image: ""
    },{
        _id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        price: 799,
        quantity: 2,
        image: ""
    },
    {
        _id: "2",
        name: "Croissant",
        category: "Pastries",
        price: 149,
        quantity: 4,
        image: ""
    },{
        _id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        price: 799,
        quantity: 2,
        image: ""
    },
    {
        _id: "2",
        name: "Croissant",
        category: "Pastries",
        price: 149,
        quantity: 4,
        image: ""
    }
];

const products = [
    {
        _id: "1",
        name: "Chocolate Cake",
        category: "Cakes",
        description: "Rich chocolate sponge",
        price: 799,
        image: "/images/cake.jpg"
    },

    {
        _id: "2",
        name: "Croissant",
        category: "Pastries",
        description: "Buttery flaky pastry",
        price: 149,
        image: "/images/croissant.jpg"
    }
];
app.get('/', (req, res) => {
    res.render('checkout', {cartItems, subtotal: 0,
    deliveryFee: 0,
    total: 0,
    error: null});
})

// app.get('/', (req, res) => {
//     res.render("menu", {
//         products
//     });
// })


app.listen(3000)