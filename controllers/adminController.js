export async function getLoginPage(req, res) {
    res.render('admin/login', {error: null, formData: {}})
}

export async function renderDashboard(req, res){
    res.render('admin/dashboard', {
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            totalCustomers: 0,
            recentOrders: []
        })
}