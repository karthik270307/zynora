const { HfInference } = require("@huggingface/inference");
const fs = require("fs");
const path = require("path");

const getHfClient = () => {
    const token = (process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || "").trim();
    if (!token) {
        throw new Error("HUGGINGFACE_API_KEY is not configured in server/.env");
    }
    return new HfInference(token);
};

// Supported Hugging Face models using modern inference provider routing
const HF_IMAGE_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "black-forest-labs/FLUX.1-dev",
    "stabilityai/stable-diffusion-3.5-large"
];

/**
 * Generate marketing visual using official Hugging Face Inference SDK
 */
const generateMarketingImage = async (promptOrData) => {
    try {
        console.log("Generating Hugging Face marketing visual...");

        let prompt = "";
        if (typeof promptOrData === "string") {
            prompt = promptOrData;
        } else if (typeof promptOrData === "object" && promptOrData !== null) {
            const data = promptOrData;
            prompt = `Professional high-resolution commercial marketing product advertisement photography.
Brand: ${data.brandName || "Premium Brand"}.
Product: ${data.productName || "Product"}.
Product Description: ${data.description || ""}.
Campaign Goal: ${data.campaignGoal || "Product Launch"}.
Target Audience: ${data.targetAudience || "General"}.
Platform: ${data.platform || "Instagram"}.
Style: ${data.imageStyle || "Modern Commercial"}.
Background & Lighting: ${data.background || "Clean studio lighting, elegant background"}.
Composition: Visually striking product focus, commercial grade aesthetics, sharp details.`;
        }

        console.log("HF prompt preview:", prompt.slice(0, 150) + "...");

        const hf = getHfClient();

        let imageBuffer = null;
        let mimeType = "image/jpeg";
        let lastError = null;

        for (const model of HF_IMAGE_MODELS) {
            try {
                console.log(`Requesting textToImage with HF model: ${model}...`);
                const blob = await hf.textToImage({
                    model: model,
                    inputs: prompt
                });

                if (blob && blob.size > 0) {
                    const arrayBuffer = await blob.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                    mimeType = blob.type || "image/jpeg";
                    console.log(`Successfully generated image using HF model: ${model} (${imageBuffer.length} bytes)`);
                    break;
                }
            } catch (err) {
                console.warn(`HF model ${model} generation attempt failed:`, err.message || err);
                lastError = err;
            }
        }

        if (!imageBuffer) {
            throw new Error(
                lastError?.message ||
                "Hugging Face image generation failed. Please verify your HUGGINGFACE_API_KEY in server/.env."
            );
        }

        // Save generated image to local storage
        const outputDirectory = path.join(
            __dirname,
            "../../generated-images"
        );

        if (!fs.existsSync(outputDirectory)) {
            fs.mkdirSync(outputDirectory, { recursive: true });
        }

        const extension = mimeType.includes("png") ? "png" : "jpg";
        const fileName = `hf-${Date.now()}.${extension}`;
        const outputPath = path.join(outputDirectory, fileName);
        fs.writeFileSync(outputPath, imageBuffer);

        const imageBase64 = imageBuffer.toString("base64");
        console.log("Hugging Face image saved to:", outputPath);

        return {
            fileName,
            filePath: outputPath,
            imageUrl: `/generated-images/${fileName}`,
            image: imageBase64,
            mimeType: mimeType
        };
    } catch (error) {
        console.error("Hugging Face image generation error:", error.message || error);
        throw error;
    }
};

module.exports = {
    generateMarketingImage
};