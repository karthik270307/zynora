const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function check() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();

    // Check several popular current text-to-image models on HF Inference Providers
    const models = [
        "stabilityai/stable-diffusion-3.5-large",
        "stabilityai/stable-diffusion-3.5-medium",
        "black-forest-labs/FLUX.1-dev",
        "ByteDance/SDXL-Lightning",
        "CompVis/stable-diffusion-v1-4",
        "segmind/SSD-1B",
        "strangerzonehf/Flux-Midjourney-Mix2-LoRA"
    ];

    for (const model of models) {
        console.log(`\nChecking model: ${model}...`);
        const url = `https://router.huggingface.co/hf-inference/models/${model}`;
        try {
            const res = await axios.post(
                url,
                { inputs: "Commercial photography of athletic sneakers" },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    responseType: "arraybuffer",
                    timeout: 45000
                }
            );

            console.log(`SUCCESS with ${model}!`);
            console.log("Status:", res.status);
            console.log("Length:", res.data?.length);
            console.log("Content-Type:", res.headers["content-type"]);
            break;
        } catch (err) {
            const msg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
            console.error(`Failed ${model} (${err.response?.status}):`, msg);
        }
    }
}

check();
