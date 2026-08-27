const axios = require("axios");
require("dotenv").config();

async function test() {
    const prompt = "A clean professional advertisement of wireless earbuds on a sleek modern surface, studio lighting, commercial photography";
    const models = [
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
    ];

    const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "";
    console.log("HF Token present:", !!hfToken);

    for (const url of models) {
        console.log(`Testing HF URL: ${url}...`);
        try {
            const headers = {
                "Content-Type": "application/json"
            };
            if (hfToken) {
                headers["Authorization"] = `Bearer ${hfToken}`;
            }

            const response = await axios.post(
                url,
                { inputs: prompt },
                {
                    headers,
                    responseType: "arraybuffer",
                    timeout: 45000
                }
            );

            console.log("Status:", response.status);
            console.log("Content-Type:", response.headers["content-type"]);
            console.log("Bytes received:", response.data.length);
            const b64 = Buffer.from(response.data).toString("base64");
            console.log("Base64 length:", b64.length);
            console.log("SUCCESS with:", url);
            break;
        } catch (err) {
            console.error(`Failed on ${url}:`, err.response?.status, err.response?.data?.toString() || err.message);
        }
    }
}

test();
