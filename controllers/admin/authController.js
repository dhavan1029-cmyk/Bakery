import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import userModel from '../../models/userModel.js'
import validator from 'validator'

export async function getLoginPage(req, res) {
    const message = req.query.message || ''
    res.render('admin/login', {error: null, formData: {}, message})
}

export async function loginAdmin(req, res) {

    try{
        const email = req.body.email?.trim().toLowerCase()
        const password = req.body.password

        if(!email || !password ||!validator.isEmail(email) || password.length < 8) return res.render('admin/login', {error: 'Invalid password or email', formData: {email}, message: ''})

        const admin = await userModel.findOne({email, role: 'admin'}).select('password')

        if(!admin){
            res.render('admin/login', {error: 'Invalid password or email', formData: {email}, message: ''})
            return
        }

        if(bcrypt.compareSync(password, admin.password)) {

            const token = jwt.sign({email}, process.env.JWT_CODE, {expiresIn: '7d'})

            res.cookie('admin', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: '/admin'
            })
            res.redirect('/admin/dashboard')

        }else{

            return res.render('admin/login', {error: 'Invalid password or email', formData: {email}, message: ''})

        }

    } catch (err) {
        console.log(err)
        res.redirect('/serverError')
    }

}