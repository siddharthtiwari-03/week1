// const mysql2 = require('mysql2/promise')

// const pool = mysql2.createPool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME
// })

// module.exports = { pool }

const mysql2 = require('mysql2/promise');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Initialize Secrets Manager client
const secretsClient = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'us-east-1'
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

// Initialize pool
let pool = null;

// Export pool (will be set after initialization)
module.exports = {
    pool: null,
    initializePool: async () => {
        if (!pool) {
            pool = await createPoolWithSecrets();
            module.exports.pool = pool;
        }
        return pool;
    }
};

// Auto-initialize pool when module loads
(async () => {
    try {
        pool = await createPoolWithSecrets();
        module.exports.pool = pool;
        console.log('Database pool initialized with AWS Secrets Manager');
    } catch (error) {
        console.error('Failed to initialize database pool:', error);
    }
})();