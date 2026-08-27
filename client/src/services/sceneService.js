import api from "./api";


export const generateSceneImages =
    async (scenes) => {

        const response =
            await api.post(
                "/api/ai/scenes/generate",
                {
                    scenes
                }
            );

        return response.data;
    };