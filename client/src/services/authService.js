import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

export const registerUser = async (userData) => {
    const response = await axios.post(
        `${API}/register`,
        userData
    );
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await axios.post(
        `${API}/login`,
        userData
    );
    return response.data;
};

export const googleAuthUser = async (googleToken) => {
    const response = await axios.post(
        `${API}/google`,
        { token: googleToken }
    );
    return response.data;
};