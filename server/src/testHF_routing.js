const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function checkProviders() {
    const token = (process.env.HUGGINGFACE_API_KEY || "").trim();

    // Check providers supported for black-forest-labs/FLUX.1-schnell or FLUX.1-dev or SD 3.5
    // Format: https://router.huggingface.co/{provider}/models/{model}
    // Or: https://router.huggingface.co/hf-inference/models/{model}
    // Common HF Inference Providers: fal-ai, together, replicate, fireworks-ai, sambanova, novita, hyperlogistic, nebuly, lepton
    const providers = [
        "together",
        "fal-ai",
        "replicate",
        "fireworks-ai",
        "novita",
        "nebius",
        "hyperbolic"
    ];

    const models = [
        "black-forest-labs/FLUX.1-schnell",
        "black-forest-labs/FLUX.1-dev",
        "stabilityai/stable-diffusion-3.5-large"
    ];

    for (const provider of providers) {
        for (const model of models) {
            const url = `https://router.huggingface.co/${provider}/models/${model}`;
            console.log(`Checking ${provider} -> ${model}...`);
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
                        timeout: 30000
                    }
                );

                console.log(`>>> SUCCESS WITH ${provider} -> ${model}! <<<`);
                console.log("Status:", res.status);
                console.log("Bytes:", res.data?.length);
                return;
            } catch (err) {
                const msg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
                console.log(`   ${provider}/${model} status:`, err.response?.status, msg.slice(0, 120));
            }
        }
    }
}

checkProviders();
