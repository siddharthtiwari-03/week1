const mysql2 = require('mysql2/promise')

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

// const pool = mysql2.createPool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME
// })

// module.exports = { pool }

const secretsClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || "ap-south-1"
});

// Function to get database credentials from Secrets Manager
async function getDbCredentials() {
    try {
        const secretName = process.env.DB_SECRET_NAME || 'rds-mysql-credentials';

        const command = new GetSecretValueCommand({
            SecretId: secretName
        });

        const response = await secretsClient.send(command);
        const secret = JSON.parse(response.SecretString);

        return {
            user: secret.username,
            password: secret.password,
            host: secret.host,
            database: process.env.DB_NAME || secret.dbInstanceIdentifier,
            port: secret.port || 3306
        };
    } catch (error) {
        console.error('Error retrieving database credentials:', error);
        throw error;
    }
}

// Create pool with credentials from Secrets Manager
async function createPoolWithSecrets() {
    const credentials = await getDbCredentials();

    console.log('credentials', credentials);

    return mysql2.createPool({
        user: credentials.user,
        password: credentials.password,
        host: credentials.host,
        database: credentials.database,
        port: credentials.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
}

// Pool instance and initialization promise
let pool = null;
let initializationPromise = null;

// Function to get the pool (ensures it's initialized)
async function getPool() {
    if (pool) {
        return pool;
    }

    // If initialization is already in progress, wait for it
    if (initializationPromise) {
        return initializationPromise;
    }

    // Start initialization
    initializationPromise = createPoolWithSecrets();

    try {
        pool = await initializationPromise;
        console.log('Database pool initialized with AWS Secrets Manager');
        return pool;
    } catch (error) {
        console.error('Failed to initialize database pool:', error);
        // Reset the promise so we can retry
        initializationPromise = null;
        throw error;
    }
}

// Export both the getPool function and a pool property for backward compatibility
module.exports = {
    getPool,
    // For backward compatibility, you can also export pool but it should be used with getPool
    get pool() {
        return pool;
    },
    // Export a promise that resolves when pool is ready
    poolReady: (async () => {
        await getPool();
        return pool;
    })()
};