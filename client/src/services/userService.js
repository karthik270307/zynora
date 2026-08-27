import api from "./api";

// GET USER PROFILE
export const getUserProfile = async () => {
    const response = await api.get("/api/auth/profile");
    return response.data;
};

// UPDATE USER PROFILE
export const updateUserProfile = async (userData) => {
    const response = await api.put("/api/auth/profile", userData);
    return response.data;
};

// CHANGE PASSWORD
export const changeUserPassword = async (passwordData) => {
    const response = await api.post("/api/auth/change-password", passwordData);
    return response.data;
};

// DELETE ACCOUNT
export const deleteUserAccount = async () => {
    const response = await api.delete("/api/auth/delete-account");
    return response.data;
};
