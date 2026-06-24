import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import userModel from '../models/userModel.js'

export async function getLoginPage(req, res){
    res.render('login', {error: null})
}

export function getSignupPage(req, res){
    res.render('signup', {error: null})
}

export async function loginUser(req, res){

    const { email, password } = req.body
    const user = await userModel.findOne({email})

    if (!user) {
        res.render('login', {error: 'Account doesn\'t exist'})
        return
    }

    if (bcrypt.compareSync(password, user.password)) {

        const token = jwt.sign({email}, process.env.JWT_CODE)
        res.cookie('userToken', token)
        res.redirect('/menu')

    } else {

        res.render('/login', {error: 'Incorrect password'})

    }

}

export async function signupUser(req, res){

    const { username, email, password } = req.body

    const encryptedPassword = bcrypt.hashSync(password, 10)

    const newUser = await userModel.insertOne({username, email, password: encryptedPassword})

    loginUser(req, res)

}
