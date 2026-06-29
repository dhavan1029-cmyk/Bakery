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
        const user = await userModel.findOne({email: decodedToken.email})
        res.locals.user = user

        next()

    } catch (err) {
        res.locals.user = null
        next()
    }

}