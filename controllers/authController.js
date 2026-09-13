import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import validator from 'validator'

export async function getLoginPage(req, res){
    const loginRequired = req.query.loginRequired
    res.render('login', {error: null, loginRequired, formData: {}})
}

export function getSignupPage(req, res){
    res.render('signup', {error: null, formData: {}})
}

export async function loginUser(req, res){
    try{ 
        const email = req.body.email?.trim().toLowerCase()
        const password = req.body.password

        if(!email || !password) return res.render('login', {error: 'Fill all the fields'})
        
        if(!validator.isEmail(email)) return res.render('login', {error: 'Invalid email or password', formData: req.body})

        const user = await userModel.findOne({email}).select('password')

        if (!user) {
            res.render('login', {error: 'Invalid email or password', loginRequired: '', formData: {}})
            return
        }

        if (user.role === 'admin') {
            return res.render('login', {
                error: 'Please use the admin login page.',
                loginRequired: '',
                formData: {}
            })
        }

        if (bcrypt.compareSync(password, user.password)) {

            const token = jwt.sign({email}, process.env.JWT_CODE, {expiresIn: '7d'})
           
            res.cookie('userToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            res.redirect(`/menu`)
            

        } else {

            res.render('login', {error: 'Invalid email or password', loginRequired: '', formData: req.body})

        }
    } catch (err) {
        
        res.redirect('/serverError')
    }
}

export async function signupUser(req, res){

    try{

        const { password, confirmPassword } = req.body
        const username = req.body.username?.trim()
        const email = req.body.email?.trim().toLowerCase()

        if(!username || !email || !password || !confirmPassword){
            return res.render('signup', {error: 'Please fill all the fields'})
        }

        if(username.length < 3 || password.length < 6 || !validator.isEmail(email)) return res.render('signup', {error: 'Invalid fields'})

        if(!/^[a-zA-Z0-9_]{3,30}$/.test(username)) return res.render('signup', {error: 'Invalid username. Username can only contain alphabets, numbers and underscore(_) only. Spaces and other special characters are not allowed'})

        if(password !== confirmPassword) {
            return res.render('signup', {error: 'Passwords don\'t match', formData: {username, email}})
        }

        const user = await userModel.findOne({email})

        if(user) {
            return res.render('signup', {error: 'This account already exists'})
        }

        const encryptedPassword = bcrypt.hashSync(password, 10)
        const newUser = await userModel.insertOne({username, email, password: encryptedPassword, role: 'customer'})

        loginUser(req, res)

    } catch (err) {
        
        res.redirect('/serverError')
    }

}
