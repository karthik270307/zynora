import api from "./api";

export const generateContent = async (data) => {
    const response = await api.post("/api/ai/content", data);
    return response.data;
};

export const generateCreativeBrief = async (data) => {
    const response = await api.post("/api/ai/creative/generate", data);
    return response.data;
};

export const generateCreative = async (data) => {
    const response = await api.post("/api/ai/creative/generate", data);
    return response.data;
};