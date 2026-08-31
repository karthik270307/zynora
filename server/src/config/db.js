const { Pool } = require("pg");

let dbConfig = {};

if (process.env.DATABASE_URL) {
    dbConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    dbConfig = {
        user: process.env.DB_USER || "postgres",
        host: process.env.DB_HOST || "localhost",
        database: process.env.DB_NAME || "zynora",
        password: process.env.DB_PASSWORD || "data@123",
        port: process.env.DB_PORT || 5432,
    };

    // Enable SSL only if specified or in production on a remote host
    if (process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) {
        dbConfig.ssl = {
            rejectUnauthorized: false
        };
    }
}

const pool = new Pool(dbConfig);

pool.on("connect", () => {
    console.log("PostgreSQL Connected successfully");
});

pool.on("error", (error) => {
    console.error("PostgreSQL Pool Error:", error.message);
});

module.exports = pool;
