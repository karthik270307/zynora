import api from "./api";


// CREATE CREATIVE
export const createCreative = async (creativeData) => {

    const response = await api.post(
        "/api/creatives",
        creativeData
    );

    return response.data;
};


// GET ALL CREATIVES
export const getCreatives = async () => {

    const response = await api.get(
        "/api/creatives"
    );

    return response.data;
};


// GET ONE CREATIVE
export const getCreative = async (id) => {

    const response = await api.get(
        `/api/creatives/${id}`
    );

    return response.data;
};

// UPDATE CREATIVE
export const updateCreative = async (id, creativeData) => {
    const response = await api.put(
        `/api/creatives/${id}`,
        creativeData
    );
    return response.data;
};