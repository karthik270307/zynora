import api from "./api";

export const getAnalytics = async (brandId = null, projectId = null) => {
    let url = "/api/ai/analytics";
    const params = [];
    if (brandId && brandId !== "null" && brandId !== "undefined" && String(brandId).trim() !== "") {
        params.push(`brandId=${encodeURIComponent(brandId)}`);
    }
    if (projectId && projectId !== "null" && projectId !== "undefined" && String(projectId).trim() !== "") {
        params.push(`projectId=${encodeURIComponent(projectId)}`);
    }
    if (params.length > 0) {
        url += `?${params.join("&")}`;
    }

    const response = await api.get(url);
    return response.data;
};