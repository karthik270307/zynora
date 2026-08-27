const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function test() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();
    console.log("Token starts with:", token.slice(0, 7), "Length:", token.length);

    const endpoints = [
        {
            name: "router black-forest-labs/FLUX.1-schnell",
            url: "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
            data: { inputs: "A sleek modern sneaker commercial advertisement photography" }
        },
        {
            name: "router stabilityai/stable-diffusion-xl-base-1.0",
            url: "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
            data: { inputs: "A sleek modern sneaker commercial advertisement photography" }
        },
        {
            name: "router runwayml/stable-diffusion-v1-5",
            url: "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
            data: { inputs: "A sleek modern sneaker commercial advertisement photography" }
        }
    ];

    for (const ep of endpoints) {
        console.log(`\nTesting ${ep.name}...`);
        try {
            const res = await axios.post(ep.url, ep.data, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                responseType: "arraybuffer",
                timeout: 45000
            });

            console.log("Status:", res.status);
            console.log("Content-Type:", res.headers["content-type"]);
            console.log("Data length:", res.data?.length);
            if (res.data?.length > 1000) {
                console.log("SUCCESS! Got image from", ep.name);
                break;
            }
        } catch (err) {
            const msg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
            console.error(`Failed ${ep.name}:`, err.response?.status, msg);
        }
    }
}

test();
