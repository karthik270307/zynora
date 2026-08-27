const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
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