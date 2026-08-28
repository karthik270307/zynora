import axios from "axios";


const API =
    `${import.meta.env.VITE_API_URL}/api/ai/comparison`;


export const compareCreatives = async (data) => {

    try {

        console.log(
            "Sending comparison request:",
            data
        );


        const response =
            await axios.post(
                `${API}/compare`,
                data
            );


        console.log(
            "Comparison API response:",
            response.data
        );


        return response.data;


    } catch (error) {

        console.error(
            "Comparison API error:",
            error.response?.data ||
            error.message
        );


        throw error;

    }

};