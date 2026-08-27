const pool = require('./src/config/db');

async function getSchema() {
    try {
        const users = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log('users schema:', users.rows);
        const creatives = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'creatives'");
        console.log('creatives schema:', creatives.rows);
    } catch(err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
getSchema();
