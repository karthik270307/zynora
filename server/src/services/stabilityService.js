const axios = require("axios");
const FormData = require("form-data");

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

async function generateImage(prompt) {
  try {
    const form = new FormData();

    form.append("prompt", prompt);
    form.append("output_format", "png");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      form,
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          Accept: "image/*",
          ...form.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    return Buffer.from(response.data).toString("base64");
  } catch (error) {
    console.error(
      error.response?.data?.toString() || error.message
    );
    throw new Error("Image generation failed");
  }
}

module.exports = {
  generateImage,
};