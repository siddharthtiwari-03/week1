// @ts-check
const { UnSQL } = require('unsql');
const { poolReady } = require('../services/db.service');

/**
 * User class factory - creates User class with initialized pool
 * @returns {Promise<*>}
 */
async function createUserClass() {
    // Wait for pool to be ready
    const pool = await poolReady;

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
            pool: pool, // initialized pool
            safeMode: true,
            devMode: false,
            dialect: 'mysql' // (default) or 'postgresql' or 'sqlite'
        }
    }

    return User;
}

// Cache the User class once created
let UserClass = null;

/**
 * Get the User class with initialized pool
 * @returns {Promise<*>}
 */
async function getUser() {
    if (!UserClass) {
        UserClass = await createUserClass();
    }
    return UserClass;
}

module.exports = { getUser };