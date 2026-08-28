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

app.use(cors());
app.use(express.json());

app.use(
    "/generated-images",
    express.static(
        path.join(
            __dirname,
            "../generated-images"
        )
    )
);


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Zynora backend is running successfully",
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

app.listen(5000, () => {console.log("Server Running...");});
app.get("/test", (req,res)=>{
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

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});
