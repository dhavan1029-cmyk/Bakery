import ordersModel from "../../models/ordersModel.js";

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

        const order = await ordersModel
            .findById(req.params.id)
            .populate('products.product')
            .populate('userID', 'username email');

        if (!order) {
            return res.redirect('/admin/orders');
        }

        res.render('admin/order', { order });

    } catch (err) {

        console.error(err);
        res.redirect('/serverError');

    }
}