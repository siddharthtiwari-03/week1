// @ts-check
const { UnSQL } = require('unsql')

// get connection pool from your db provider service
const { pool } = require('../services/db.service')

/**
 * @class
 * @extends UnSQL
 */
class User extends UnSQL {

    /**
     * UnSQL config
     * @type {UnSQL.config}
     */
    static config = {
        table: process.env.DB_TABLE_USERS || '', // (mandatory) replace this with your table name
        pool, // provide 'db' instance here in 'sqlite' mode
        safeMode: true,
        devMode: false,
        dialect: 'mysql' // (default) or 'postgresql' or 'sqlite'
    }

}
module.exports = { User }