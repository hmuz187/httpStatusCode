const express = require('express')
const app = express()
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const path = require('node:path')
require('dotenv').config()


//init middleware
app.use(express.json())
app.use(express.urlencoded({
    extended:false,
    limit: '30mb'
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));


//init database
require('./database/mongodb.init')


//init routes
app.use('', require('./routes/index'))

//handling error
app.use((req, res, next)=>{
    const error = new Error('NOT FOUND')
    error.status = 404
    next(error)
})

app.use((error, req, res, next)=>{
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'ERROR',
        code: statusCode,
        message: error.message || 'Internal Server Error!'
    })
})

module.exports = app