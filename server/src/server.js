const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), override: true });
const aiRoutes = require("./routes/aiRoutes");
const imageRoutes = require("./routes/imageRoutes");
const app = express();
const analysisRoutes =require("./routes/analysisRoutes");
const predictionRoutes =require("./routes/predictionRoutes");
const recommendationRoutes =
    require("./routes/recommendationRoutes");
const comparisonRoutes =
require("./routes/comparisonRoutes");
const creativeRoutes =
    require("./routes/creativeRoutes");
const authRoutes =
    require("./routes/authRoutes");
const geminiImageRoutes =
    require("./routes/geminiImageRoutes");
const videoRoutes =
    require("./routes/videoRoutes");
const sceneRoutes =
    require("./routes/sceneRoutes");
const posterRoutes =
    require("./routes/posterRoutes");
const analyticsRoutes =
require("./routes/analyticsRoutes");
const brandRoutes = require("./routes/brandRoutes");
const projectRoutes = require("./routes/projectRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const memberRoutes = require("./routes/memberRoutes");

// Security headers compatible with Google Identity Services & OAuth Popups
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
});

// Configure CORS for local development and deployed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5000"
];

if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(",").forEach(url => {
        const trimmed = url.trim();
        if (trimmed && !allowedOrigins.includes(trimmed)) {
            allowedOrigins.push(trimmed);
        }
    });
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            
            // Allow localhost/127.0.0.1, configured frontend URLs, and Vercel/Render preview domains
            if (
                allowedOrigins.includes(origin) ||
                origin.endsWith(".vercel.app") ||
                origin.endsWith(".onrender.com") ||
                origin.includes("localhost") ||
                origin.includes("127.0.0.1")
            ) {
                return callback(null, true);
            }
            return callback(null, true); // Permissive fallback to prevent breaking deployments
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
    "/generated-images",
    express.static(
        path.join(
            __dirname,
            "../generated-images"
        )
    )
);


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});
app.use(
    "/generated-scenes",
    express.static(
        path.join(
            __dirname,
            "../generated-scenes"
        )
    )
);
app.use(
    "/generated-videos",
    express.static(
        path.join(
            __dirname,
            "../generated-videos"
        )
    )
);

app.use("/api/ai", aiRoutes);
app.use("/api/ai/image", imageRoutes);
app.use("/api/ai/analysis",analysisRoutes);
app.use(
    "/api/ai/poster",
    posterRoutes
);
app.use("/api/ai/prediction", predictionRoutes);
app.use("/api/ai/recommendation",recommendationRoutes);
app.use("/api/ai/comparison",comparisonRoutes);
app.use(
    "/api/ai/analytics",
    analyticsRoutes
);
app.use(
    "/api/ai/scenes",
    sceneRoutes
);
app.use("/api/ai/gemini-image",geminiImageRoutes);
app.use("/api/ai/video",videoRoutes);
app.use("/api/creatives",creativeRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/members", memberRoutes);
 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

const initDb = require("./database/initDb");

// Initialize database schema
initDb();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}...`);
});
app.get("/test", (req, res) => {
    res.send("Server works");
});

const pool = require("./config/db");
app.get("/db-test", async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT NOW()"
        );

        res.json({
            success: true,
            message: "Database connected",
            time: result.rows[0].now
        });

    } catch (error) {

        console.error("Database connection error in /db-test:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
            code: error.code || "UNKNOWN",
            diagnostics: {
                hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
                host: process.env.DATABASE_URL ? "Using DATABASE_URL" : (process.env.DB_HOST || "localhost (default fallback)"),
                database: process.env.DB_NAME || (process.env.DATABASE_URL ? "From DATABASE_URL" : "zynora"),
                sslEnabled: Boolean(process.env.DATABASE_URL || process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_HOST && process.env.DB_HOST !== 'localhost'))
            }
        });
    }
});
