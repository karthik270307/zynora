const { Pool } = require("pg");

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

// Use SSL if specified in env, or default to true in production
if (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') {
  dbConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(dbConfig);
pool.on("connect", () => {
    console.log("PostgreSQL Connected");
});

pool.on("error", (error) => {
    console.error(
        "PostgreSQL Error:",
        error
    );
});

module.exports = pool;