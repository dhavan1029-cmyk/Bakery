import express from 'express'
import userModel from '../models/userModel.js'

const router = express.Router()

router.get('/admin/login', async (req, res) => { 
    res.render('admin/login', {error: '', formData: {}})
})

export default router