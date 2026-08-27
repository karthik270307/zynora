require('dotenv').config({ path: __dirname + '/.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function setupDB() {
    try {
        console.log('Starting Database Setup...');

        // 1. Create Brands Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS brands (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                brand_name VARCHAR(255) NOT NULL,
                description TEXT,
                logo_url VARCHAR(255),
                industry VARCHAR(255),
                website VARCHAR(255),
                primary_color VARCHAR(50),
                secondary_color VARCHAR(50),
                brand_tone VARCHAR(100),
                target_audience VARCHAR(255),
                preferred_language VARCHAR(100),
                social_platforms JSONB,
                guidelines TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Brands table created or verified.');

        // 2. Create Projects Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
                project_name VARCHAR(255) NOT NULL,
                description TEXT,
                campaign_goal VARCHAR(255),
                target_audience VARCHAR(255),
                platform VARCHAR(255),
                start_date DATE,
                end_date DATE,
                status VARCHAR(50) DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Projects table created or verified.');

        // 3. Create Campaigns Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS campaigns (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                campaign_name VARCHAR(255) NOT NULL,
                objective VARCHAR(255),
                target_audience VARCHAR(255),
                platform VARCHAR(255),
                description TEXT,
                start_date DATE,
                end_date DATE,
                status VARCHAR(50) DEFAULT 'Draft',
                budget NUMERIC(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Campaigns table created or verified.');

        // 3.5 Create Brand Members Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS brand_members (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(100) NOT NULL CHECK (role IN ('BRAND_OWNER', 'CREATIVE_EDITOR', 'MARKETING_ANALYST', 'VIEWER')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT brand_member_unique UNIQUE (brand_id, user_id)
            );
        `);
        console.log('Brand Members table created or verified.');

        // 4. Alter Creatives Table to link to new hierarchy
        const alterQueries = [
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS media_url TEXT;`
        ];

        for (let query of alterQueries) {
            try {
                await pool.query(query);
            } catch (err) {
                console.log('Notice during alter creatives:', err.message);
            }
        }
        console.log('Creatives table altered to include brand_id, project_id, campaign_id.');

        console.log('Database Setup Completed Successfully.');
    } catch (error) {
        console.error('Database Setup Failed:', error);
    } finally {
        pool.end();
    }
}

setupDB();
