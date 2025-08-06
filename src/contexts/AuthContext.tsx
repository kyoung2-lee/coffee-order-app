import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    // 모의 로그인 - 간단한 검증
    if (username && password) {
      const mockUser = { username, email: `${username}@example.com` };
      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
    } else {
      throw new Error('ユーザー名とパスワードを入力してください。');
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    // 모의 회원가입
    if (username && email && password) {
      const mockUser = { username, email };
      setUser(mockUser);
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
    } else {
      throw new Error('すべての項目を入力してください。');
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    // 모의 인증 코드 확인
    if (code === '123456') {
      // 성공적으로 처리됨
    } else {
      throw new Error('認証コードが正しくありません。');
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 