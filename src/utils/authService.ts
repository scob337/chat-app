// services/authService.ts
import api from "./API";

export const login = async (phone: string, password: string) => {
  const response = await api.post("/auth/login", {
    phone,
    password,
  });

  const { user } = response.data;
  
  // لم نعد نحتاج لتخزين التوكن في localStorage
  // لأن التوكن الآن يتم تخزينه في الكوكيز تلقائياً
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export const register = async (name: string, phone: string, password: string) => {
  const response = await api.post("/auth/register", {
    name,
    phone,
    password,
  });

  const { user } = response.data;
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem("user");
    window.location.href = '/login';
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const refreshToken = async () => {
  try {
    await api.post('/auth/refresh');
    return true;
  } catch (error) {
    return false;
  }
};
