const geminiImageService = require("./geminiImageService");

/**
 * Generate marketing visual using Gemini-powered commercial image generation engine
 */
const generateMarketingImage = async (promptOrData) => {
    return await geminiImageService.generateMarketingImage(promptOrData);
};

module.exports = {
    generateMarketingImage
};