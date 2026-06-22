import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3333/api"
});

// JWT: Injeta automaticamente o token se ele existir no localStarege
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("@Helpdesk:token");

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})