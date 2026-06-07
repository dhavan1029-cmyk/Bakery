import './config/mongoose.js'
import express from 'express'
import path from 'path'
import homeRoute from './routes/homeRoute.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(process.cwd(), 'public')))

const product = {
    _id: "123",

    name: "Chocolate Cake",

    category: "Cakes",

    price: 799,

    description: "Rich chocolate sponge layered with smooth chocolate ganache.",

    // image: "/images/chocolate-cake.jpg"
};

const relatedProducts = [

    {
        _id: "456",
        name: "Vanilla Cake",
        category: "Cakes",
        price: 699,
        // image: "/images/vanilla-cake.jpg"
    },

    {
        _id: "789",
        name: "Red Velvet Cake",
        category: "Cakes",
        price: 899,
        // image: "/images/red-velvet.jpg"
    }

];

app.get('/', (req, res) => {
    res.render('product', {product, relatedProducts})
})

app.listen(3000)