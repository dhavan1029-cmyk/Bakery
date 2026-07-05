import userModel from '../models/userModel.js'


export function getAccount (req, res) {
    res.render('account')
}


export async function getCartItems (req, res) {

    if(!req.user) {
        res.render('cart', {cartItems: []})
        return 
    }

    const user = await userModel.findById(req.user._id).populate('cart.product')

    if(!user.cart.length) {
        res.render('cart', {cartItems: []})
        return
    }

    const cartItems = user.cart.map(item => ({...item.product.toObject(), quantity: item.quantity}))
    const subtotal = cartItems
        .map(item => item.price * item.quantity)
        .reduce((currPrice, nextPrice) => currPrice + nextPrice);
    
    const deliveryFee = 50
    const total = subtotal + deliveryFee


    res.render('cart', {cartItems, subtotal, deliveryFee, total})
}


export async function getOrders (req, res) {

    const user = await userModel.findOne({email: req.user.email})
        .populate({
            path: 'orders',
            populate: {
                path: 'products.product'
            }
        })

        res.render('orders', {orders: user.orders})

}

export async function deleteItem(req, res) {
    const user = await userModel.findOne({email: req.user.email})
    const { itemId } = req.body
    for (let i = 0; i < user.cart.length; i++) {
        const item = user.cart[i]
        if(item.product._id.toString() === itemId) {
            user.cart.splice(i, 1)
            break
        }
    }   
    await userModel.updateOne({email: req.user.email}, user)
    res.json({success: true})
}
