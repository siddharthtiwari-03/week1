const mysql2 = require('mysql2/promise')

const pool = mysql2.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
})

module.exports = { pool }