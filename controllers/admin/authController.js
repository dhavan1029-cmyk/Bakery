import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import userModel from '../../models/userModel.js'

export async function getLoginPage(req, res) {
    const message = req.query.message || ''
    res.render('admin/login', {error: null, formData: {}, message})
}

export async function loginAdmin(req, res) {

    try{
        const { email, password } = req.body
        const admin = await userModel.findOne({email, role: 'admin'})

        if(!admin){
            res.render('admin/login', {error: 'Account doesn\'t exist', formData: req.body, message: ''})
            return
        }

        if(bcrypt.compareSync(password, admin.password)) {

            const token = jwt.sign({email}, process.env.JWT_CODE)

            res.cookie('admin', token)
            res.redirect('/admin/dashboard')

        }else{

            res.render('admin/login', {error: 'Incorrect password', formData: req.body, message: ''})

        }

    } catch (err) {
        (err)
        res.redirect('/serverError')
    }

}