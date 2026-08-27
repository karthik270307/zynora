const { generateMarketingImage } = require("./services/imageService");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function runTest() {
    try {
        console.log("Testing generateMarketingImage with full marketing payload...");
        const result = await generateMarketingImage({
            brandName: "Aura Audio",
            productName: "Pro ANC Headphones",
            description: "Over-ear noise cancelling wireless headphones with 50 hour battery life and premium leather headband",
            platform: "Instagram",
            imageStyle: "Modern Commercial"
        });

        console.log("Result success!");
        console.log("File Name:", result.fileName);
        console.log("Image URL:", result.imageUrl);
        console.log("Mime Type:", result.mimeType);
        console.log("Base64 length:", result.image?.length);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

runTest();
