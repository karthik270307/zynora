const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function discover() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();

    // Query Hugging Face Hub API for text-to-image models with warm/available inference
    try {
        const res = await axios.get("https://huggingface.co/api/models?pipeline_tag=text-to-image&sort=downloads&direction=-1&limit=30", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("Found text-to-image models count:", res.data.length);
        for (const m of res.data) {
            console.log(`Model ID: ${m.id}`);
            // Check inference provider support
            const url = `https://router.huggingface.co/hf-inference/models/${m.id}`;
            try {
                const testRes = await axios.post(
                    url,
                    { inputs: "A red sports car, professional photography" },
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        },
                        responseType: "arraybuffer",
                        timeout: 15000
                    }
                );
                console.log(`>>> SUCCESS WITH: ${m.id} (Status: ${testRes.status}, Size: ${testRes.data?.length}) <<<`);
                return;
            } catch (err) {
                const msg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
                console.log(`   hf-inference test ${m.id}:`, err.response?.status, msg.slice(0, 100));
            }
        }
    } catch (e) {
        console.error("Discovery error:", e.message);
    }
}

discover();
