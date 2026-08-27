const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function testProviders() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();

    // In Hugging Face's updated Inference Providers router:
    // router.huggingface.co/models/{model} automatically routes to third-party providers (together, fal-ai, replicate, fireworks-ai, etc.) or uses query parameter ?provider=...
    // Also test router.huggingface.co/v1/images/generations (OpenAI-compatible) and direct provider endpoints
    const tests = [
        {
            name: "router black-forest-labs/FLUX.1-schnell (auto provider)",
            url: "https://router.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            body: { inputs: "A sleek modern sneaker commercial advertisement photography" }
        },
        {
            name: "router stabilityai/stable-diffusion-3.5-large (auto provider)",
            url: "https://router.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
            body: { inputs: "A sleek modern sneaker commercial advertisement photography" }
        },
        {
            name: "router v1/images/generations (OpenAI compatible)",
            url: "https://router.huggingface.co/v1/images/generations",
            body: {
                model: "black-forest-labs/FLUX.1-schnell",
                prompt: "A sleek modern sneaker commercial advertisement photography",
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            }
        },
        {
            name: "router v1/images/generations with SD 3.5",
            url: "https://router.huggingface.co/v1/images/generations",
            body: {
                model: "stabilityai/stable-diffusion-3.5-large",
                prompt: "A sleek modern sneaker commercial advertisement photography",
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            }
        }
    ];

    for (const t of tests) {
        console.log(`\nTesting: ${t.name}...`);
        try {
            const res = await axios.post(t.url, t.body, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                responseType: t.url.includes("v1/images") ? "json" : "arraybuffer",
                timeout: 45000
            });

            console.log(`>>> SUCCESS WITH ${t.name}! <<<`);
            console.log("Status:", res.status);
            if (t.url.includes("v1/images")) {
                console.log("Keys:", Object.keys(res.data));
                console.log("b64 length:", res.data.data?.[0]?.b64_json?.length || res.data.data?.[0]?.url);
            } else {
                console.log("Bytes:", res.data?.length, "Content-Type:", res.headers["content-type"]);
            }
            return;
        } catch (err) {
            const msg = err.response?.data ? (typeof err.response.data === "object" ? JSON.stringify(err.response.data) : Buffer.from(err.response.data).toString()) : err.message;
            console.error(`Failed ${t.name} (${err.response?.status}):`, msg.slice(0, 200));
        }
    }
}

testProviders();
