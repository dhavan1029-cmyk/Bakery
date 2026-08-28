import userModel from "../../models/userModel.js"
import bcrypt from 'bcrypt'


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
        success: '',
        formData: {}
    })

}

export async function logoutAdmin(req, res){
    res.clearCookie('admin')
    res.redirect('/admin/login')
}

export async function changePassword(req, res){
    
    const {currentPassword, newPassword, confirmPassword} = req.body

    const admin = await userModel.findOne({email: req.admin.email})

    if(currentPassword === newPassword){
        return res.render('admin/changePassword', {
            admin,
            error: 'Current password cannot be the new password',
            success: '',
            formData: req.body
        })
    }else if(!bcrypt.compareSync(currentPassword, admin.password)){
        return res.render('admin/changePassword', {
            admin,
            error: 'Incorrect password',
            success: '',
            formData: req.body
        })
    } else if (newPassword !== confirmPassword) {
        return res.render('admin/changePassword', {
            admin,
            error: 'Passwords don\'t match',
            success: '',
            formData: req.body
        })
    } else {

        admin.password = bcrypt.hashSync(newPassword, 10)
        await admin.save()

        res.redirect('/admin/login?message=Password changed successfully. Please login again')

    }

}