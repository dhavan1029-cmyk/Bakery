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
    res.render('orders', {orders: [
    {
        _id: "ORD-1001",

        orderingDate: new Date("2026-06-01"),

        paymentMethod: "Cash On Delivery",

        status: "Preparing",

        totalPrice: 1450,

        products: [
            {
                quantity: 1,

                product: {
                    _id: "P1",
                    name: "Chocolate Truffle Cake",
                    price: 950,
                    image: null
                }
            },

            {
                quantity: 2,

                product: {
                    _id: "P2",
                    name: "Butter Croissant",
                    price: 250,
                    image: null
                }
            }
        ]
    },

    {
        _id: "ORD-1002",

        orderingDate: new Date("2026-05-25"),

        paymentMethod: "Online Payment",

        status: "Delivered",

        totalPrice: 2200,

        products: [
            {
                quantity: 1,

                product: {
                    _id: "P3",
                    name: "Red Velvet Cake",
                    price: 1200,
                    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"
                }
            },

            {
                quantity: 4,

                product: {
                    _id: "P4",
                    name: "Chocolate Chip Cookies",
                    price: 250,
                    image: null
                }
            }
        ]
    },

    {
        _id: "ORD-1003",

        orderingDate: new Date("2026-05-18"),

        paymentMethod: "Cash On Delivery",

        status: "Cancelled",

        totalPrice: 750,

        products: [
            {
                quantity: 3,

                product: {
                    _id: "P5",
                    name: "Cinnamon Roll",
                    price: 250,
                    image: null
                }
            }
        ]
    }
]});
})

// app.get('/', (req, res) => {
//     res.render("menu", {
//         products
//     });
// })


app.listen(3000)