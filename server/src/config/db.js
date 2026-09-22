const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// Prioritize standard PostgreSQL connection string or individual credentials
const connectionString = 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_URL;

let dbConfig = {};

if (connectionString) {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    const isSslDisabled = connectionString.includes("sslmode=disable") || isLocal;

    dbConfig = {
        connectionString,
        ssl: isSslDisabled ? false : { rejectUnauthorized: false }
    };
    console.log(`[db.js] Connecting to PostgreSQL via connection string (SSL: ${dbConfig.ssl ? "Enabled" : "Disabled"})`);
} else {
    const host = process.env.DB_HOST || "localhost";
    const database = process.env.DB_NAME || "zynora";
    const user = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD || "data@123";
    const port = parseInt(process.env.DB_PORT, 10) || 5432;

    dbConfig = {
        user,
        host,
        database,
        password,
        port
    };

    // Enable SSL only if explicitly requested or on remote non-localhost hosts
    const isRemote = host !== "localhost" && host !== "127.0.0.1";
    if (process.env.DB_SSL === "true" || (process.env.DB_SSL !== "false" && isRemote && isProduction)) {
        dbConfig.ssl = {
            rejectUnauthorized: false
        };
    } else {
        dbConfig.ssl = false;
    }
    console.log(`[db.js] Connecting to PostgreSQL at ${host}:${port}/${database} (User: ${user}, SSL: ${dbConfig.ssl ? "Enabled" : "Disabled"})`);
}

const pool = new Pool(dbConfig);

pool.on("connect", () => {
    console.log("PostgreSQL Connected successfully");
});

pool.on("error", (error) => {
    console.error("PostgreSQL Pool Error:", error.message);
});

module.exports = pool;
