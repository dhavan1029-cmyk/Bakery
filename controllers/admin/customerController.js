import ordersModel from "../../models/ordersModel.js"
import userModel from "../../models/userModel.js"

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