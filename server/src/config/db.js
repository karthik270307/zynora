const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

// Prioritize standard production environment variables (Render / Neon / Supabase)
const connectionString = 
    process.env.DATABASE_URL || 
    process.env.INTERNAL_DATABASE_URL || 
    process.env.POSTGRES_URL;

let dbConfig = {};

if (connectionString) {
    // Render internal connections (dpg-... without .render.com) or explicit sslmode=disable do not use SSL
    const isInternalRender = connectionString.includes("dpg-") && !connectionString.includes(".render.com");
    const isSslDisabled = connectionString.includes("sslmode=disable");

    dbConfig = {
        connectionString,
        ssl: (isInternalRender || isSslDisabled) ? false : { rejectUnauthorized: false }
    };
    console.log(`[db.js] Connecting via connection string (SSL: ${dbConfig.ssl ? "Enabled" : "Disabled"})`);
} else {
    const host = process.env.DB_HOST || (isProduction ? null : "localhost");
    const database = process.env.DB_NAME || "zynora";
    const user = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD || "data@123";
    const port = parseInt(process.env.DB_PORT, 10) || 5432;

    if (isProduction && (!host || host === "localhost" || host === "127.0.0.1")) {
        console.warn(
            "[db.js] WARNING: Running in production on Render without a valid DATABASE_URL or remote DB_HOST. " +
            "Please configure DATABASE_URL in your Render Dashboard to connect to PostgreSQL."
        );
    }

    dbConfig = {
        user,
        host: host || "localhost",
        database,
        password,
        port
    };

    // Enable SSL if explicitly requested or on remote production hosts
    if (process.env.DB_SSL === "true" || (isProduction && host && host !== "localhost" && host !== "127.0.0.1")) {
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
