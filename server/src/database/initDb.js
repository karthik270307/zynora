const pool = require("../config/db");

const initDb = async () => {
    console.log("[initDb] Checking and initializing database schema...");

    // 0. Ensure UUID extensions exist
    try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    } catch (e) {
        console.warn("[initDb] pgcrypto extension notice:", e.message);
    }
    try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch (e) {
        console.warn("[initDb] uuid-ossp extension notice:", e.message);
    }

    const tableQueries = [
        {
            name: "users",
            query: `
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },
        {
            name: "brands",
            query: `
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
            `
        },
        {
            name: "projects",
            query: `
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
            `
        },
        {
            name: "campaigns",
            query: `
                CREATE TABLE IF NOT EXISTS campaigns (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                    campaign_name VARCHAR(255) NOT NULL,
                    objective VARCHAR(255),
                    target_audience VARCHAR(255),
                    platform VARCHAR(255),
                    description TEXT,
                    start_date DATE,
                    end_date DATE,
                    status VARCHAR(50) DEFAULT 'Draft',
                    budget NUMERIC(10,2),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL
                );
            `
        },
        {
            name: "brand_members",
            query: `
                CREATE TABLE IF NOT EXISTS brand_members (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    role VARCHAR(100) NOT NULL CHECK (role IN ('BRAND_OWNER', 'CREATIVE_EDITOR', 'MARKETING_ANALYST', 'VIEWER')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT brand_member_unique UNIQUE (brand_id, user_id)
                );
            `
        },
        {
            name: "creatives",
            query: `
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
                    conversion_probability NUMERIC,
                    virality_score INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
                    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
                    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
                    media_url TEXT,
                    analysis_data JSONB
                );
            `
        }
    ];

    for (const t of tableQueries) {
        try {
            await pool.query(t.query);
            console.log(`[initDb] Table '${t.name}' verified/created successfully.`);
        } catch (tableErr) {
            console.error(`[initDb] Error creating table '${t.name}':`, tableErr.message);
        }
    }

    // Ensure alter columns exist
    const alterColumns = [
        `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;`,
        `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;`,
        `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;`,
        `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS media_url TEXT;`,
        `ALTER TABLE creatives ADD COLUMN IF NOT EXISTS analysis_data JSONB;`,
        `ALTER TABLE creatives ALTER COLUMN conversion_probability TYPE NUMERIC;`,
        `ALTER TABLE creatives ALTER COLUMN estimated_ctr TYPE NUMERIC;`,
        `ALTER TABLE campaigns ALTER COLUMN project_id DROP NOT NULL;`,
        `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`,
        `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;`
    ];

    for (const q of alterColumns) {
        try {
            await pool.query(q);
        } catch (_) {}
    }

    console.log("[initDb] Database schema initialized successfully.");
};

module.exports = initDb;
