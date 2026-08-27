import api from "./api";

export const generateRecommendations = async (data) => {
    console.log("Sending recommendation request:", data);

    const response = await api.post(
        "/api/ai/recommendation/recommend",
        data
    );

    console.log("Recommendation API response:", response);

    return response;
};