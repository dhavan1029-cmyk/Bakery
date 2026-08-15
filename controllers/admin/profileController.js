

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