import userModel from "../models/userModel.js"
import ordersModel from "../models/ordersModel.js";
import productModel from '../models/productModel.js'

await ordersModel.deleteMany({})
const user = await userModel.findOne({email: 'david@john.com'})
user.orders = []

await user.save()


const DELIVERY_FEE = 50


function calculateTotal(user) {

    let subtotal;

    if (user.cart.length === 0) {

        subtotal = 0;

    } else if (user.cart.length === 1) {

        const cartItem = user.cart[0];
        subtotal = cartItem.product.price * cartItem.quantity;

    } else {

        const lineTotals = user.cart.map(cartItem =>
            cartItem.product.price * cartItem.quantity
        );

        subtotal = lineTotals.reduce(
            (previousTotal, currentTotal) => previousTotal + currentTotal
        );

    }

    return {
        subtotal,
        total: subtotal + DELIVERY_FEE
    };

}


export async function getCheckoutPage(req, res){
    try{
        const {productID, quantity} = req.query
        let cartItems = []
        let subtotal, total;
        if(!productID) {
            const user = await userModel.findOne({email: req.user.email})
            await user.populate('cart.product')
            cartItems = user.cart;
            ({subtotal, total} = calculateTotal(user))
        }else{
            const product = await productModel.findById(productID)
            cartItems.push({product, quantity})
            subtotal = product.price 
            total = product.price + DELIVERY_FEE
        }

        res.render('checkout', {error: null, cartItems, subtotal, total, deliveryFee: DELIVERY_FEE, productID, quantity})

    } catch (err) {
        res.status(404).send('something went wrong')

        console.log(err)
    }


        
}

export async function placeOrder(req, res){

    const { fullName, phone, house, landmark, address, city, state, pincode, paymentMethod, notes, productID, quantity } = req.body

    const user = await userModel.findOne({email: req.user.email})
    await user.populate('cart.product')

    
    const userID = user._id

    const deliveryAddress = {
        fullName, phone, house, landmark, address, city, state, pincode
    }

    const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Paid'

    let totalPrice;
    let products = [];
    let subtotal, total;
    if(!productID){
        ({subtotal, total} = calculateTotal(user))
        totalPrice = total

        products = user.cart.map(item => ({product: item.product._id, quantity: item.quantity}))
        console.log(products)
    } else {

        const product = await productModel.findById(productID)
        console.log(product)
        products.push({product, quantity})
        subtotal = product.price 
        totalPrice = product.price + DELIVERY_FEE
    }

    


    const order = await ordersModel.insertOne({
        userID, 
        products, 
        subtotal, 
        totalPrice, 
        deliveryFee: DELIVERY_FEE, 
        orderNotes: notes, 
        deliveryAddress, 
        paymentMethod, 
        paymentStatus
    })

    user.orders.push(order._id)
    user.cart = []
    await user.save()
    
    res.redirect(`/order-success/${order._id}`)

}