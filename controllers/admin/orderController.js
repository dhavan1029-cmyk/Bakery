import ordersModel from "../../models/ordersModel.js";
import { getIO } from '../../socket.js'

export async function getOrders(req, res) {
    if(!req.admin){

        return res.redirect('/admin/login')

    }else{

        const orders = await ordersModel
            .find()
            .populate('userID', 'username email')
            .populate('products.product')
            .sort({ createdAt: -1 });

        res.render('admin/orders', {orders})

    }
}

export async function getOrder(req, res) {
    try {

        const {success, error} = req.query

        const order = await ordersModel
            .findById(req.params.id)
            .populate('products.product')
            .populate('userID', 'username email');

        if (!order) {
            return res.redirect('/admin/orders');
        }

        res.render('admin/order', { order , successStatus: success || '', error});

    } catch (err) {

        console.error(err);
        res.redirect('/serverError');

    }
}

export async function changeOrderStatus(req, res) {

    const io = getIO()

    const orderId = req.params.id
    const status = req.body.status

    const allowedTransitions = {
        Preparing: ['Baking', 'Cancelled'],
        Baking: ['Out for Delivery', 'Cancelled'],
        'Out for Delivery': ['Delivered'],
        Delivered: [],
        Cancelled: []
    }

    const order = await ordersModel.findById(orderId)

    if (!order) {
        return res.redirect('/admin/orders')
    }

    const allowedStatuses = allowedTransitions[order.status]

    if (!allowedStatuses.includes(status)) {
        return res.redirect(`/admin/orders/${orderId}?error=${true}`)
    }

    order.status = status
    if(status === 'Delivered') order.paymentStatus = 'Paid'

    const messages = {
        Preparing: 'Your order has been confirmed and is now being prepared.',
        Baking: 'Your order is currently being freshly baked.',
        'Out for Delivery': 'Your order is on its way and will be delivered shortly.',
        Delivered: 'Your order has been delivered. We hope you enjoy your treats!',
        Cancelled: 'Your order has been cancelled successfully.'
    }

    io.to(`user:${order.userID.toString()}`).emit('order status changed', {
        orderId: order._id.toString(),

        status: order.status,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,

        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,

        message: messages[order.status]
    });


    await order.save()

    res.redirect(`/admin/orders/${orderId}?success=${encodeURIComponent(status)}`)
}