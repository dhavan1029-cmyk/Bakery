import { getIO } from "../socket.js";
import userModel from "../models/userModel.js";
import ordersModel from "../models/ordersModel.js";

const deliveredOrders = await ordersModel.find({status: 'Delivered'})
deliveredOrders.forEach(async (element) => {
    element.paymentStatus = 'Paid'
    await element.save()
});
// const user = await userModel.findOne({email: 'john@j.com'})
// user.orders = []
// await user.save()

const DELIVERY_FEE = 50;

// Calculate the cart subtotal and final total.

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

export async function getOrders(req, res) {

    try{

        if(!req.user){
            return res.redirect('/login?loginRequired=true')
        }

        const user = await userModel.findOne({
            email: req.user.email
        }).populate({
            path: "orders",
            populate: {
                path: "products.product"
            }
        });

        res.render("orders", {
            user,
            orders: user.orders
        });

    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }
}

export async function getOrder(req, res) {
    try{
        const order = await ordersModel.findById(req.params.order)

        if(order) await order.populate('products.product')

        res.render('order', {order})
    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }
}

export async function cancelOrder(req, res) {
    try{
        let io = getIO()

        const order = await ordersModel.findById(req.params.order)
        const user = await userModel.findById(order.userID)
        order.status = 'Cancelled'
        await order.save()

        io.emit('notify admin', {
            type: 'order_cancelled',
            orderId: order._id,
            status: order.status,
            username: user.username,
            message: `Order #${order._id} cancelled — ${user.username} cancelled their order.`
        })


        res.json({})
    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }
}

