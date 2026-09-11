import { getIO } from "../socket.js";
import userModel from "../models/userModel.js";
import ordersModel from "../models/ordersModel.js";
import mongoose, { isValidObjectId } from "mongoose";


export async function getOrders(req, res) {

    try {

        if (!req.user) return res.redirect('/login?loginRequired=true');

        const { noCancel, status, payment, sort } = req.query;

        const user = await userModel.findOne({
            email: req.user.email
        });

        if (!user) return res.redirect('/login');

        const statuses = [
            'Preparing',
            'Baking',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ];

        const payments = [
            'Paid',
            'Pending',
            'Refunded'
        ];

        const filter = {
            userID: req.user._id
        };

        if (statuses.includes(status))
            filter.status = status;

        if (payments.includes(payment))
            filter.paymentStatus = payment;

        const sortOptions = {
            new: { createdAt: -1 },
            old: { createdAt: 1 },
            'price-high': { total: -1 },
            'price-low': { total: 1 }
        };

        const orders = await ordersModel
            .find(filter)
            .sort(sortOptions[sort] || { createdAt: -1 })
            .populate('products.product');

        res.render('orders', {
            user,
            orders,
            noCancel,
            filters: { status, payment, sort }
        });

    } catch (err) {

        console.log(err);
        res.redirect('/serverError');

    }
}


export async function getOrder(req, res) {
    try{
        if(!req.user) return res.redirect('/login?loginRequired=true')

        const orderId = req.params.order
        
        if(!mongoose.isValidObjectId(orderId)){
            return res.status(400).render('badRequest', {statusCode: 400})
        }
        const order = await ordersModel.findOne({_id: orderId, userID: req.user._id})

        if(!order) return res.status(404).render('badRequest', {statusCode: 404})

        await order.populate('products.product')

        res.render('order', {order})
    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }
}

export async function cancelOrder(req, res) {
    try{

        if(!req.user) return res.redirect('/login?loginRequired=true')

        const orderId = req.params.order

        if(!mongoose.isValidObjectId(orderId)){
            return res.status(400).render('badRequest', {statusCode: 400})
        }

        const order = await ordersModel.findOne({_id: orderId, userID: req.user._id})

        if(!req.user._id.equals(order?.userID)) return res.redirect('/unauthorizedAction');

        if(!order) return res.status(404).render('badRequest', {statusCode: 404})

        const user = await userModel.findById(order.userID)

        if(order.status === 'Preparing' || order.status === 'Baking') order.status = 'Cancelled'
        else return res.redirect('/orders?noCancel=true')

        await order.save()

        let io = getIO()

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

