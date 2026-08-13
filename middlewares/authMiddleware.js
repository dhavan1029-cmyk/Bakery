import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

export async function checkAuth (req, res, next) {

    try {

        const token = req.cookies.userToken

        if(!token){
            res.locals.user = null
            return next()
        }

        const decodedToken = jwt.verify(token, process.env.JWT_CODE)
        const user = await userModel.findOne({email: decodedToken.email}).select('-password')
        res.locals.user = user
        req.user = user

        if(!user){
            res.clearCookie('userToken')
            return next()
        }

        next()

    } catch (err) {
        res.locals.user = null
        req.user = null

        res.clearCookie('userToken')

        res.redirect('/serverError')

        next()
    }

}