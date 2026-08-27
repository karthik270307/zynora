import api from "./api";

export const analyzeCreative = async (data) => {
    const response = await api.post(
        "/api/ai/analysis/analyze",
        data
    );

    return response.data;
};