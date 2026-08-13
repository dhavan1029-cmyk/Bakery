import express from 'express'
import userModel from '../models/userModel.js'
import bcrypt from 'bcrypt'

const router = express.Router()

router.get('/admin/login', async (req, res) => { 
    
    res.render('admin/login', {error: '', formData: {}})

})

export default router