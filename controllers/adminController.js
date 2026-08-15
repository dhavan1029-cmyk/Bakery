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
        (err)
        res.redirect('/serverError')
    }

}
 
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

export async function getProducts(req, res) {
    try {

        const products = await productModel
            .find()
            .sort({ createdAt: -1 });

        res.render('admin/products', {
            products
        });

    } catch (err) {

        console.error(err);

        res.redirect('/serverError');

    }
}

export function renderAddProduct(req, res) {

    res.render('admin/products/new', {
        error: '',
        formData: {}
    })

}

export async function renderEditProduct(req, res) {

    try {

        const { id } = req.params;

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).render('admin/products/edit', {
                product: null,
                error: 'Product not found.',
                formData: null
            });
        }

        res.render('admin/products/edit', {
            product,
            error: '',
            formData: null
        });

    } catch (err) {

        console.error(err);

        return res.status(500).render('admin/products/edit', {
            product: null,
            error: 'Unable to load the product.',
            formData: null
        });

    }
}

export async function renderCustomers(req, res) {

    try {

        const customers = await userModel
            .find({role: 'customer'})
            .select('-password')
            .sort({ createdAt: -1 })


        res.render('admin/customers', {
            customers
        })

    } catch (err) {

        console.error(err)

        res.redirect('/serverError')

    }

}

export async function renderCustomer(req, res) {

    try {

        const { id } = req.params

        const customer = await userModel
            .findOne({
                _id: id,
                role: { $ne: 'admin' }
            })
            .select('-password')

        if (!customer) {
            return res.redirect('/admin/customers')
        }


        const orders = await ordersModel
            .find({
                userID: customer._id
            })
            .sort({ createdAt: -1 })


        const totalSpent = orders.reduce(
            (total, order) => {

                if (order.status === 'Cancelled') {
                    return total
                }

                return total + (order.total || 0)

            },
            0
        )


        res.render('admin/customer', {

            customer,
            orders,
            totalSpent

        })


    } catch (err) {

        console.log(err)

        res.redirect('/serverError')

    }

}

export async function renderAdminAccount(req, res) {

    try {

        const admin = req.admin

        res.render('admin/account', {
            admin
        })

    } catch (error) {

        console.log(error)

        res.redirect('/serverError')

    }

}

export async function renderChangePassword(req, res) {
    res.render('admin/changePassword', {
        admin: req.admin,
        error: '',
        success: ''
    })

}

export async function renderAdminSettings(req, res) {

    try {

        // For now, until you create a settings model
        const settings = {
            storeName: 'FLOURish Bakery',
            storeEmail: '',
            storePhone: '',
            storeAddress: '',
            deliveryFee: 50,
            minimumOrder: 0,
            deliveryTime: '30-45',
            defaultMaxOrder: 10,
            storeOpen: true,
            acceptOrders: true,
            maintenanceMode: false
        }

        res.render('admin/adminSettings', {
            admin: req.admin,
            settings,
            error: '',
            success: ''
        })

    } catch (error) {

        console.log(error)

        res.redirect('/serverError')

    }

}