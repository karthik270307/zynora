import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = `${BASE_URL}/api/auth`;

export const registerUser = async (userData) => {
    const response = await axios.post(`${API}/register`, userData);
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await axios.post(`${API}/login`, userData);
    return response.data;
};

export const googleAuthUser = async (credential) => {
    const response = await axios.post(`${API}/google`, {
        credential
    });
    return response.data;
};

export const getCurrentUser = async (token) => {
    const authToken = token || localStorage.getItem("zynora_token");
    if (!authToken) return null;
    const response = await axios.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    return response.data;
};