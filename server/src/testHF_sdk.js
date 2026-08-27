const { HfInference } = require("@huggingface/inference");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function testSDK() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();
    const hf = new HfInference(token);

    console.log("Testing HfInference textToImage...");
    const modelsToTry = [
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0",
        "stabilityai/stable-diffusion-3.5-large",
        "stabilityai/sdxl-turbo",
        "prompthero/openjourney"
    ];

    for (const model of modelsToTry) {
        console.log(`\nTesting with HfInference model: ${model}...`);
        try {
            const blob = await hf.textToImage({
                model: model,
                inputs: "Commercial photography of athletic sneakers"
            });

            console.log("SUCCESS with SDK on model:", model);
            console.log("Blob size:", blob.size, "type:", blob.type);
            const buffer = Buffer.from(await blob.arrayBuffer());
            console.log("Buffer length:", buffer.length);
            return;
        } catch (err) {
            console.error(`Failed ${model}:`, err.message);
        }
    }
}

testSDK();
