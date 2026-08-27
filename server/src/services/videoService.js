const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const generateVideoScript = async (data) => {

    const duration =
        Number(data.videoDuration) || 30;


    const prompt = `
You are an expert advertising creative director
specializing in Indian digital marketing.

Create a UNIQUE marketing video script based
on the actual product information provided.

Do NOT use a fixed template.

Every product must have a different:
- Hook
- Story
- Scene sequence
- Visual concept
- Voice-over
- On-screen text
- CTA


PRODUCT INFORMATION

Brand:
${data.brandName}

Product:
${data.productName}

Description:
${data.description}

Target Audience:
${data.targetAudience || "General Audience"}

Platform:
${data.platform}

Video Duration:
${duration} seconds

Video Style:
${data.videoStyle || "Modern"}

Language:
${data.language || "English"}


CREATIVE REQUIREMENTS

First understand what the product actually is.

Identify the product's:

- Category
- Main features
- Main benefits
- Target customer
- Customer problem
- Emotional appeal
- Main selling point


Then create a marketing story specifically
for this product.

Do NOT use generic advertising scenes.


SCENE REQUIREMENTS

Choose the number of scenes based on duration.

For 15 seconds:
3 to 4 scenes.

For 30 seconds:
5 to 7 scenes.

For 60 seconds:
7 to 10 scenes.


Every scene must have a specific purpose.

Possible purposes include:

- Hook
- Customer problem
- Product introduction
- Product demonstration
- Feature explanation
- Benefit demonstration
- Lifestyle use
- Emotional moment
- Social proof
- Offer
- Call to action


Do NOT force every product to use
the same scene sequence.


PRODUCT-SPECIFIC VISUALS

The visual description must show the actual
product being used appropriately.

If the product is food:
focus on preparation, texture, serving,
taste and eating experience.

If the product is clothing:
focus on fabric, fitting, styling,
comfort and lifestyle.

If the product is electronics:
focus on product operation, technology,
features and real-world usage.

If the product is education:
focus on students learning, projects,
skills and career benefits.

If the product is travel:
focus on destinations, activities,
people and experiences.

If the product is fitness:
focus on workouts, training,
equipment and lifestyle.

If the product belongs to another category,
create visuals appropriate to that category.


INDIAN MARKET CONTEXT

When appropriate, use realistic Indian
locations and situations.

Examples:

Indian college
Indian office
Indian home
Indian restaurant
Indian shopping area
Indian family
Indian travel environment

Only use these when relevant.


PLATFORM OPTIMIZATION

Instagram:
Fast hook, visually strong scenes,
short voice-over and engaging CTA.

YouTube:
More storytelling and product explanation.

Facebook:
Clear benefits and simple messaging.

LinkedIn:
Professional and value-focused messaging.


VOICE-OVER

The voice-over must:

- Sound natural
- Match the product
- Explain actual benefits
- Avoid generic marketing phrases
- Match the selected language
- Fit the scene duration


ON-SCREEN TEXT

Keep on-screen text short.

Use specific product benefits.

For example:

"40-Hour Battery"

"100% Cotton"

"Fresh Every Morning"

"Learn Through Real Projects"

"Book Your Weekend Escape"


Avoid repeatedly using generic phrases such as:

"Powerful features"

"Experience the difference"

"Made for you"

unless they genuinely fit the product.


CALL TO ACTION

Create a CTA appropriate for the product.

Food:
Order Now

Clothing:
Shop the Collection

Education:
Start Learning

Travel:
Book Your Trip

Electronics:
Buy Now

Fitness:
Start Your Journey


OUTPUT

Return ONLY valid JSON.

Do not return Markdown.

Do not return explanations.

Use exactly this JSON structure:

{
    "title": "",
    "duration": ${duration},
    "hook": "",
    "scenes": [
        {
            "scene": 1,
            "duration": 5,
            "visual": "",
            "voiceover": "",
            "text": ""
        }
    ],
    "cta": "",
    "music": ""
}

Make every scene directly related to
the actual product.

Do not copy generic advertising scenes.
`;

const response =
    await ai.models.generateContent({

        model: "gemini-3.6-flash",

        contents: prompt

    });

    let result = response.text;


    result = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();


    try {

        JSON.parse(result);

    } catch (error) {

        console.error(
            "Invalid Gemini JSON:"
        );

        console.error(result);

        throw new Error(
            "Gemini returned invalid video JSON"
        );

    }


    return result;

};


module.exports = {
    generateVideoScript
};