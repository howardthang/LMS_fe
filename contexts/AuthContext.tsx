import React, { createContext, ReactNode, useContext, useState } from 'react';
import authService from '../api/authService';

export type UserType = 'student' | 'librarian' | null;

interface AuthContextType {
  userType: UserType;
  login: (username: string, password?: string) => Promise<UserType>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userType, setUserType] = useState<UserType>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('userType');
    return (saved as UserType) || null;
  });

  const login = async (username: string, password?: string): Promise<UserType> => {
    let type: UserType = 'student';

    if (password) {
      try {
        const response = await authService.login(username, password);
        if (response && response.data) {
          const accessToken = response.data.accessToken;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          try {
            // Fix base64url character conversions
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Decode with UTF-8 support
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const payload = JSON.parse(jsonPayload);
            if (payload.scope && payload.scope.includes('LIBRARIAN')) {
              type = 'librarian';
            }
          } catch (e) {
            console.error('Failed to parse token payload', e);
          }
        }
      } catch (error) {
        console.error('Login failed', error);
        throw error;
      }
    } else {
      // Giữ lại fallback cho đăng nhập với SSO hoặc mock ban đầu
      type = username.toLowerCase() === 'librarian' ? 'librarian' : 'student';
    }

    setUserType(type);
    localStorage.setItem('userType', type);
    return type;
  };


  const logout = () => {
    setUserType(null);
    localStorage.removeItem('userType');
  };

  return (
    <AuthContext.Provider value={{ userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
