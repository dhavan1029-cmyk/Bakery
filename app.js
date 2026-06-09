import './config/mongoose.js'
import express from 'express'
import path from 'path'
import homeRoute from './routes/homeRoute.js'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(process.cwd(), 'public')))

app.use(homeRoute)
app.get('/contact', (req, res) => {
    res.render('contact')
})

app.listen(3000)