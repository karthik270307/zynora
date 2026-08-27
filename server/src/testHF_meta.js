const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function checkModelProviders() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();

    try {
        const res = await axios.get("https://huggingface.co/api/models/black-forest-labs/FLUX.1-schnell", {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Pipeline tag:", res.data.pipeline_tag);
        console.log("Inference providers:", JSON.stringify(res.data.inferenceProviderMapping || res.data.providers || res.data.widgets || {}));
    } catch (err) {
        console.error("Error getting model metadata:", err.message);
    }
}

checkModelProviders();
