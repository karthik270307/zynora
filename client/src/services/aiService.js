import api from "./api";

export const generateContent = async (data) => {
    const response = await api.post("/api/ai/content", data);
    return response;
};

export const generateCreativeBrief = async (data) => {
    const response = await api.post("/api/ai/content", data);
    return response;
};