const express = require('express')
const app = express()
const db = require('./config/db')
const consign = require('consign')

//Consign is used to insert turn all modules able to be called by the "app" in this case.
consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.db = db

app.get('/', (req, res) => {
    res.status(200).send('My Backend!')
})

app.listen(3000, () => {
    console.log('Backend runing')
})