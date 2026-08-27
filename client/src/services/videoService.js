import api from "./api";


export const generateVideoScript =
    async (videoData) => {

        const response =
            await api.post(
                "/api/ai/video/generate-script",
                videoData
            );

        return response.data;
    };


export const renderVideo =
    async (scenes) => {

        const response =
            await api.post(
                "/api/ai/video/render",
                {
                    scenes
                }
            );

        return response.data;
    };