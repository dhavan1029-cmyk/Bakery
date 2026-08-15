import userModel from '../../models/userModel.js'
import ordersModel from '../../models/ordersModel.js'
import productModel from '../../models/productModel.js'

export async function renderDashboard(req, res){

    const orders = await ordersModel.find({})
    const products = await productModel.find({})
    const users = await userModel.find( {role: { $ne: 'admin' }} )

    const totalRevenue = orders.length ? orders.map(order => order.total).reduce((prevTotal, currTotal) => prevTotal + currTotal) : 0

    res.render('admin/dashboard', {
            totalOrders: orders.length,
            totalRevenue,
            totalProducts: products.length,
            totalCustomers: users.length,
            recentOrders: []
    })
        
}