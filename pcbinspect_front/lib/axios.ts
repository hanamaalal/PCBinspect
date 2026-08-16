import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001",

  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (
      token &&
      !config.url?.includes("/utilisateur/login")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // =========================================
  // FORM DATA
  // =========================================
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default api;