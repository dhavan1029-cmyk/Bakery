import userModel from "../models/userModel.js"
import ordersModel from "../models/ordersModel.js";
import productModel from '../models/productModel.js'
import mongoose from "mongoose";
import { getIO } from '../socket.js'


function isMaxOrderLimitExceeded(items){

    for (const item of items) {
        if(item.quantity > item.product.maxQuantityPerOrder) return true
    }

    return false
}

async function comparePrices(prevPrices, userId){

    const currPrices = await userModel.findById(userId)
    await currPrices.populate('cart.product')
    const priceChanges = []

    currPrices.cart.forEach(item => {
        if(item.product.price !== prevPrices[item.product._id]) priceChanges.push([item.product._id, prevPrices[item.product._id]])
    })

    return priceChanges
}

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
        const changedPrices = JSON.parse(req.query.changedPrices || '[]') 
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

            if(!user.cart.length){
                return res.render('checkout', {checkoutError: 'Your Cart is empty', formData: null})
            }

            const productsAvailability = checkAvailability(...user.cart)
            

            if(!productsAvailability) {
                return res.redirect(`/cart`)
            }

            ({subtotal, total} = calculateTotal(user))
            cartItems = user.cart

        }else{

            const product = await productModel.findById(productID)
            
            if(!product) {
                return res.render('checkout', {checkoutError: 'Product not found', formData: null})
            }

            if(!product.availability) {
                return res.redirect(`/product/${productID}?unavailable=true`)
            }

            cartItems.push({product, quantity})
            subtotal = product.price * quantity
            total = subtotal + DELIVERY_FEE
            console.log('fdfdfdf')

        }
        res.render('checkout', {reorderId, checkoutError: '', orderError: '', cartItems, subtotal, total, deliveryFee: DELIVERY_FEE, productID, quantity, formData: {}, changedPrices})

    } catch (checkoutError) {
        console.log(checkoutError)
        res.render('checkout', {checkoutError, orderError: '', formData: null})
    }


        
}

export async function placeOrder(req, res){

    try{

        const io = getIO()

        let { fullName, phone, house, landmark, address, city, state, pincode, paymentMethod, notes, productID, quantity, reorderId, pricesAtCheckout } = req.body

        if(!(+phone) || !(+pincode)) res.redirect('/checkout')

        if(!validateFields([ fullName, phone, house, landmark, address, city, state, pincode, paymentMethod ])){
            res.redirect(`/checkout?productID=${productID}&quantity=${quantity}&reorderId=${reorderId}`)
        }

        const user = await userModel.findOne({email: req.user.email})

        await user.populate('cart.product')

        const comparedPrices = await comparePrices(JSON.parse(pricesAtCheckout), user._id);

        if(comparedPrices.length){
            return res.redirect(`/checkout?changedPrices=${JSON.stringify(comparedPrices)}`)
        }


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

            if(!user.cart.length) return res.redirect('/checkout')

            products = user.cart.map(item => ({product: item.product._id, orderPrice: item.product.price, quantity: item.quantity}))
            // await user.save()

            const productsAvailability = await checkAvailability(...user.cart)

            if(!productsAvailability || isMaxOrderLimitExceeded(user.cart)) {
                return res.redirect(`/cart`)
            }

            ({subtotal, total} = calculateTotal(user))

            user.cart = []
            await user.save()
            
        } else {

            const product = await productModel.findById(productID)
            
            if(!product) return res.redirect('/checkout')

            if(!product.availability || quantity > product.maxQuantityPerOrder){
                return res.redirect(`/product/${productID}?quantity=${quantity}`)
            }
            products.push({product: product._id, quantity, orderPrice: product.price})
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
        await user.save()

        io.emit('notify admin', {
            orderId: newOrder._id.toString(),
            message: `Order placed by ${user.username}`,
            status: newOrder.status,
            customerName: newOrder.deliveryAddress.fullName,
            phone: newOrder.deliveryAddress.phone,
            itemCount: newOrder.products.length,
            total: newOrder.total,
            paymentMethod: newOrder.paymentMethod,
            paymentStatus: newOrder.paymentStatus,
            createdAt: newOrder.createdAt
        })

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

