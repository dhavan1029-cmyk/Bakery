import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

export async function checkAdminAuth (req, res, next) {

    try {

        const token = req.cookies.admin

        if(!token){
            res.locals.admin = null
            return res.redirect('/admin/login')
        }

        const decodedToken = jwt.verify(token, process.env.JWT_CODE)
        const admin = await userModel.findOne({email: decodedToken.email, role: 'admin'}).select('-password')
        res.locals.admin = admin
        req.admin = admin

        if(!admin){
            res.clearCookie('admin')
            return res.redirect('/admin/login')
        }

        next()

    } catch (err) {
        res.locals.admin = null
        req.admin = null

        res.clearCookie('admin')

        res.redirect('/serverError')
    }

}