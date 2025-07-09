// import express
const express = require('express')

const { engine } = require('express-handlebars')

// import dotenv
const dotenv = require('dotenv')
dotenv.config()

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

app.get('/', (req, res) => {
    console.log('root url invoked!')

    const data = [
        { firstName: 'Gangadhar', lastName: 'Palla' },
        { firstName: 'Shanmadhi', lastName: '' },
    ]

    res.render('home', { data })
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