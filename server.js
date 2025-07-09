// import express
const express = require('express')

// import dotenv
const dotenv = require('dotenv')
dotenv.config()

const { engine } = require('express-handlebars')

const { User } = require('./models/user.class')
// create an app using express
const app = express()

// configure express app to use json format
app.use(express.json())
// configure express app to use encoded url
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

// routes start here

app.get('/', async (req, res) => {
    console.log('root url invoked!')

    const response = await User.find()

    if (!response.success) {
        console.error('error while loading users', response)
        return res.status(400).json({ success: false, error: response?.error?.sqlMessage || response?.error?.message || response?.error })
    }

    console.log('users found', response)

    res.render('home', { data: response?.result })
})

app.get('/about', (req, res) => {
    console.log('about url invoked!')

    res.render('about')
})

app.get('/contact', (req, res) => {
    console.log('contact url invoked!')

    res.render('contact')
})

// routes end here

// define port number to listen on this server
app.listen(5600, () => console.log(`Server started listening at: 5600`))