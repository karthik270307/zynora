import api from "./api";


// GET ANALYTICS
export const getAnalytics = async () => {

    const response = await api.get(
        "/api/ai/analytics"
    );

    return response.data;
};