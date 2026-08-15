
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
