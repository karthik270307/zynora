import api from "./api";


export const generateImage = async (prompt) => {

    const response = await api.post(
        "/api/ai/gemini-image/generate",
        {
            prompt
        }
    );

    return response.data;
};