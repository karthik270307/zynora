import api from "./api";

export const predictPerformance = async (data) => {

    const response = await api.post(
        "/api/ai/prediction/predict",
        data
    );

    return response.data;
};