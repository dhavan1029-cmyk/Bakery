import userModel from '../../models/userModel.js'
import ordersModel from '../../models/ordersModel.js'
import productModel from '../../models/productModel.js'
import { setValue, getValue } from '../../config/cache.js'

export async function renderDashboard(req, res){

    const orders = await ordersModel.find({})
    const products = getValue('products') || await productModel.find({})
    if(!getValue('products')) setValue('products', products)

    const users = await userModel.find( {role: { $ne: 'admin' }} )

    const totalRevenue = orders
        .filter(order => 
            order.status === 'Delivered' &&
            order.paymentStatus === 'Paid'
        )
        .reduce((total, order) => total + order.total, 0)
    
        
    res.render('admin/dashboard', {
            totalOrders: orders.length,
            totalRevenue,
            totalProducts: products.length,
            totalCustomers: users.length,
            recentOrders: []
    })
        
}