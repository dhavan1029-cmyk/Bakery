import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import ordersModel from '../models/ordersModel.js'
import productModel from '../models/productModel.js'

export async function getLoginPage(req, res) {
    res.render('admin/login', {error: null, formData: {}})
}

export async function loginAdmin(req, res) {

    try{
        const { email, password } = req.body
        const admin = await userModel.findOne({email, role: 'admin'})

        if(!admin){
            res.render('admin/login', {error: 'Account doesn\'t exist', formData: req.body})
            return
        }

        if(bcrypt.compareSync(password, admin.password)) {

            const token = jwt.sign({email}, process.env.JWT_CODE)

            res.cookie('admin', token)
            res.redirect('/admin/dashboard')

        }else{

            res.render('admin/login', {error: 'Incorrect password', formData: req.body})

        }

    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }

}
 
export async function renderDashboard(req, res){

    const orders = await ordersModel.find({})
    await ordersModel.deleteMany({})
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