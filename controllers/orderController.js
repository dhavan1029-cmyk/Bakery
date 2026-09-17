import { getIO } from "../socket.js";
import ordersModel from "../models/ordersModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { getValue, setValue } from '../config/cache.js'

async function getOrderProducts(products){
    return await Promise.all(
        products.map(async item => {

            // console.log(item)
            const product = getValue(item.product)?.product || await productModel.findById(item.product)
            if(!getValue(item.product)) setValue(item.product, {product})

            return {product, quantity: item.quantity, orderPrice: item.orderPrice}
        })
    )
}

export async function getOrders(req, res) {

    try {
        if (!req.user) {
            return res.redirect('/login?loginRequired=true');
        }

        const { noCancel, status, payment, sort } = req.query;

        const user = req.user;

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
            userID: user._id
        };

        if (statuses.includes(status)) {
            filter.status = status;
        }

        if (payments.includes(payment)) {
            filter.paymentStatus = payment;
        }

        const sortOptions = {
            new: { createdAt: -1 },
            old: { createdAt: 1 },
            'price-high': { total: -1 },
            'price-low': { total: 1 }
        };


        let orders = await ordersModel
            .find({ userID: user._id })

        orders = await Promise.all(
            orders.map(async order => {
            
                order.products = await getOrderProducts(order.products);
            
                return order;
            
            })
        );


        orders = orders
            .filter(order =>
                (!filter.status || order.status === filter.status) &&
                (!filter.paymentStatus || order.paymentStatus === filter.paymentStatus)
            )
            .sort((a, b) => {

                const sortParams = sortOptions[sort] || sortOptions.new;

                if (sortParams.createdAt) {
                    return sortParams.createdAt === -1
                        ? new Date(b.createdAt) - new Date(a.createdAt)
                        : new Date(a.createdAt) - new Date(b.createdAt);
                }

                if (sortParams.total) {
                    return sortParams.total === -1
                        ? b.total - a.total
                        : a.total - b.total;
                }

                return 0;
            });

        orders.forEach(order => {
            console.log(order.products)
        })

        res.render('orders', {
            user,
            orders,
            noCancel,
            filters: {
                status,
                payment,
                sort
            }
        });


    } catch (err) {

        console.log(err);

        return res.redirect('/serverError');

    }
}


export async function getOrder(req, res) {
    try{
        if(!req.user) return res.redirect('/login?loginRequired=true')

        const orderId = req.params.order
        
        if(!mongoose.isValidObjectId(orderId)){
            return res.status(400).render('badRequest', {statusCode: 400})
        }
        let order = await ordersModel.findOne({userID: req.user._id, _id: orderId})
        
        if(!order) return res.status(404).render('badRequest', {statusCode: 404})

        order.products = await getOrderProducts(order.products)

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

        const user = req.user

        if(order.status === 'Preparing' || order.status === 'Baking') order.status = 'Cancelled'
        else return res.redirect('/orders?noCancel=true')

        await ordersModel.updateOne({_id: orderId, userID: user._id}, {status: order.status})

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
