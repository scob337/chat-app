// api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // غيّرها حسب السيرفر بتاعك
});

// Interceptor يضيف التوكن على كل request
api.interceptors.request.use(
  (config) => {
      config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGFkZTkyMDU1ZjFkZjBkMGY1MGRkN2MiLCJpYXQiOjE3NTYyMzcyNDMsImV4cCI6MTc1NjIzODE0M30.MWi54PDMskPwah4HzEfJ2KA5TWZSt0_bBFPuDDlQgKg`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
