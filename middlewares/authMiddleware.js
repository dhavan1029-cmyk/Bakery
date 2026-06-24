import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

export async function checkAuth (req, res, next) {
    try {

        const token = req.cookies.userToken

        if(!token){
            res.locals.user = null
            return next()
        }

        const email = jwt.verify(token, process.env.JWT_CODE)
        const user = userModel.findOne({email})
        res.locals.user = user
        next()
        
    } catch (err) {
        res.locals.user = null
        next()
    }

}