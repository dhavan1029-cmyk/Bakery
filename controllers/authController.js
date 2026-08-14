import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import userModel from '../models/userModel.js'

export async function getLoginPage(req, res){
    const loginRequired = req.query.loginRequired
    res.render('login', {error: null, loginRequired})
}

export function getSignupPage(req, res){
    res.render('signup', {error: null, formData: {}})
}

export async function loginUser(req, res){
    try{ 
        const { email, password } = req.body
        const user = await userModel.findOne({email})

        if (!user) {
            res.render('login', {error: 'Account doesn\'t exist', loginRequired: ''})
            return
        }

        if (user.role === 'admin') {
            return res.render('login', {
                error: 'Please use the admin login page.',
                loginRequired: ''
            })
        }

        if (bcrypt.compareSync(password, user.password)) {

            const token = jwt.sign({email}, process.env.JWT_CODE)
           
            res.cookie('userToken', token)
            res.redirect('/menu')
            

        } else {

            res.render('login', {error: 'Incorrect password', loginRequired: ''})

        }
    } catch (err) {
        
        res.redirect('/serverError')
    }
}

export async function signupUser(req, res){

    try{

        const { username, email, password, confirmPassword } = req.body

        const user = await userModel.findOne({email})

        if(user) {
            return res.render('signup', {error: 'This account already exists'})
        }

        if(password !== confirmPassword) {
            return res.render('signup', {error: 'Passwords don\'t match', formData: {username, email}})
        }

        const encryptedPassword = bcrypt.hashSync(password, 10)
        const newUser = await userModel.insertOne({username, email, password: encryptedPassword, role: 'customer'})

        loginUser(req, res)

    } catch (err) {
        
        res.redirect('/serverError')
    }

}
