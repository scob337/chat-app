"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getCurrentUser, login as loginService } from "../utils/authService";
import api from "../utils/API";

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
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // التحقق من صلاحية التوكن عند تحميل التطبيق
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        
        // أولاً، تحقق من وجود مستخدم في localStorage
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log('📱 Found stored user, verifying with server...');
          
          try {
            // تحقق من صلاحية التوكن مع الخادم
            const response = await api.get('/auth/me');
            if (response.data.user) {
              console.log('✅ User verified successfully');
              setUser(response.data.user);
              setIsAuthenticated(true);
              // تحديث بيانات المستخدم في localStorage إذا تغيرت
              localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
              console.log('❌ Invalid user data from server');
              clearAuthData();
            }
          } catch (verifyError) {
            console.log('❌ Token verification failed:', verifyError);
            // إذا فشل التحقق، استخدم البيانات المحفوظة محلياً (وضع offline)
            console.log('📱 Using stored user data (offline mode)');
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        } else {
          console.log('📱 No stored user found');
          // لا تحذف localStorage - فقط اضبط الحالة
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        // في حالة الخطأ، استخدم البيانات المحفوظة إن وجدت
        const storedUser = getCurrentUser();
        if (storedUser) {
          console.log('📱 Using stored user data (fallback)');
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // دالة لمسح بيانات المصادقة
  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastLoginTime');
    setUser(null);
    setIsAuthenticated(false);
  };

  // login
  const login = async (phone: string, password: string) => {
    try {
      console.log('🔐 Attempting login...');
      const userData = await loginService(phone, password);
      if (userData) {
        console.log('✅ Login successful');
        setUser(userData);
        setIsAuthenticated(true);
        // حفظ بيانات المستخدم في localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('lastLoginTime', new Date().toISOString());
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  // logout
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      // استدعاء logout API لمسح الكوكيز من الخادم
      await api.post('/auth/logout');
    } catch (error) {
      console.error('❌ Logout API failed:', error);
    } finally {
      // مسح البيانات المحلية في جميع الأحوال
      clearAuthData();
      // إعادة توجيه للصفحة الرئيسية
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
