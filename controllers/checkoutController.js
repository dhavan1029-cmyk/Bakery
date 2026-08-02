import userModel from "../models/userModel.js"
import ordersModel from "../models/ordersModel.js";
import productModel from '../models/productModel.js'



const DELIVERY_FEE = 50

async function checkAvailability(...products){

    for (const item of products) {
        const product = await productModel.findById(item.product._id)
        if(!product.availability) {
            return false
        }
    }

    return true
    
}

function validateFields(fields){
    for(const field of fields){
        if(!field) return false
    }
    return true
}

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
        if(!req.user){
            return res.redirect('/login?loginRequired=true')
        }

        let {productID, quantity} = req.query
        const {reorderId} = req.query
        let cartItems = []
        let subtotal, total;

        if(reorderId){
            const order = await ordersModel.findById(reorderId)
            await order.populate('products.product')
            cartItems = order.products;
            ({subtotal, total} = order)

        }else if(!productID) {

            const user = await userModel.findOne({email: req.user.email})

            await user.populate('cart.product')

            const productsAvailability = checkAvailability(...user.cart)
            

            if(!productsAvailability) {
                return res.redirect(`/cart`)
            }

            ({subtotal, total} = calculateTotal(user))
            cartItems = user.cart

        }else{

            const product = await productModel.findById(productID)
            
            if(!product.availability) {
                return res.redirect(`/product/${productID}?unavailable=true`)
            }

            cartItems.push({product, quantity})
            subtotal = product.price * quantity
            total = subtotal + DELIVERY_FEE

        }
        res.render('checkout', {reorderId, checkoutError: '', orderError: '', cartItems, subtotal, total, deliveryFee: DELIVERY_FEE, productID, quantity, formData: {}})

    } catch (checkoutError) {
        console.log(checkoutError)
        res.render('checkout', {checkoutError, orderError: '', formData: null})
    }


        
}

export async function placeOrder(req, res){

    try{

        const { fullName, phone, house, landmark, address, city, state, pincode, paymentMethod, notes, productID, quantity, reorderId } = req.body

        if(!validateFields([ fullName, phone, house, landmark, address, city, state, pincode, paymentMethod ])){
            res.redirect(`/checkout?productID=${productID}&quantity=${quantity}&reorderId=${reorderId}`)
        }

        const user = await userModel.findOne({email: req.user.email})

        await user.populate('cart.product')

        const userID = user._id

        const deliveryAddress = {
            fullName, phone, house, landmark, address, city, state, pincode
        }

        const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Paid'

        let products = [];
        let subtotal, total;
        
        if(reorderId){

            const order = await ordersModel.findById(reorderId);

            ({products, subtotal, total} = order)

        }else if(!productID){
            products = user.cart
            const product = await productModel.findById(user.cart[0].product._id)

            const productsAvailability = await checkAvailability(...user.cart)

            if(!productsAvailability) {
                return res.redirect(`/cart`)
            }
            // console.log(user instanceof mongoose.Model)
            // console.log(typeof user.populate)
            // await user.populate('cart.product')

            ({subtotal, total} = calculateTotal(user))

        } else {

            const product = await productModel.findById(productID)
            
            if(!product.availability){
                return res.redirect(`/product/${productID}`)
            }

            products.push({product: product._id, quantity})
            subtotal = product.price * quantity
            total = subtotal + DELIVERY_FEE
        }




        const newOrder = await ordersModel.insertOne({
            userID, 
            products, 
            subtotal, 
            total, 
            deliveryFee: DELIVERY_FEE, 
            orderNotes: notes, 
            deliveryAddress, 
            paymentMethod, 
            paymentStatus
        })

        user.orders.push(newOrder._id)
        user.cart = []
        await user.save()
        
        res.redirect(`/order-success/${newOrder._id}`)
    } catch (orderError) {
        console.log(orderError)
        const { productID, quantity, reorderId } = req.body

        const user = await userModel.findOne({email: req.user.email})
        await user.populate('cart.product')

        const cartItems = productID ? await productModel.findById(productID) : user.cart || []

        const formData = req.body
        const {subtotal, total} = calculateTotal(user)
        res.render('checkout', {orderError: 'Order not placed', checkoutError: '', formData, productID, quantity, cartItems, subtotal, total, reorderId, deliveryFee: DELIVERY_FEE})

    }
}