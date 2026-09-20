const pool = require("../config/db");

const initDb = async () => {
    try {
        console.log("Checking and initializing database schema...");

        // 1. Ensure users table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Ensure brands table exists
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

        // 3. Ensure projects table exists
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

        // 4. Ensure campaigns table exists
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

        // 5. Ensure brand_members table exists
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

        // 6. Ensure creatives table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS creatives (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                brand_name VARCHAR(255),
                product_name VARCHAR(255),
                description TEXT,
                headline TEXT,
                caption TEXT,
                cta TEXT,
                platform VARCHAR(255),
                target_audience VARCHAR(255),
                brand_tone VARCHAR(255),
                creative_type VARCHAR(255),
                creative_score INTEGER,
                estimated_ctr NUMERIC,
                engagement_score INTEGER,
                conversion_probability INTEGER,
                virality_score INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
                project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
                campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
                media_url TEXT
            );
        `);

        // 7. Ensure columns exist on creatives if table was created previously
        const alterColumns = [
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS media_url TEXT;`,
            `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS analysis_data JSONB;`,
            `ALTER TABLE creatives ALTER COLUMN conversion_probability TYPE NUMERIC;`,
            `ALTER TABLE creatives ALTER COLUMN estimated_ctr TYPE NUMERIC;`
        ];

        for (const q of alterColumns) {
            try {
                await pool.query(q);
            } catch (err) {
                // Non-critical if column already exists or table structure matches
                console.log("Notice during alter creatives:", err.message);
            }
        }

        console.log("Database schema initialized successfully.");
    } catch (error) {
        console.error("Database schema initialization error:", error.message);
    }
};

module.exports = initDb;
