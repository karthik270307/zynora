import api from "./api";

export const getAnalytics = async (brandId = null, projectId = null) => {
    let url = "/api/ai/analytics";
    const params = [];
    if (brandId) params.push(`brandId=${brandId}`);
    if (projectId) params.push(`projectId=${projectId}`);
    if (params.length > 0) {
        url += `?${params.join("&")}`;
    }

    const response = await api.get(url);
    return response.data;
};