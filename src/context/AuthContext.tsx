"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCurrentUser, login as loginService } from "../utils/authService";

type User = {
  id: string;
  name: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب اليوزر المخزن عند تحميل الصفحة
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // login function
  const login = async (phone: string, password: string) => {
    const userData = await loginService(phone, password); // نستخدم الدالة من authService
    setUser(userData);
  };

  // logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook جاهز للاستخدام
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
