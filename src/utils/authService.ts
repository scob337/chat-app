// services/authService.ts
import api from "./API";

export const login = async (phone: string, password: string) => {
  const response = await api.post("/auth/login", {
    phone,
    password,
  });

  const { tokens, user } = response.data;

  
  localStorage.setItem("token", tokens?.accessToken);
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
