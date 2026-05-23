import express from 'express'
import path from 'path'

const app = express()

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(process.cwd(), 'public')))

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(3000)