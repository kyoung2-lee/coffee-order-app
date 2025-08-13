import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp, confirmSignUp, signOut, getCurrentUser, resendSignUpCode, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

// 設定確認
console.log('=== AuthContext Loading ===');
console.log('Amplify 設定:', Amplify.getConfig());
console.log('Auth 設定:', Amplify.getConfig().Auth);

interface User {
  username: string;
  email: string;
  attributes?: {
    email: string;
    email_verified: boolean;
    sub: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendConfirmationCode: (username: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthフックはAuthProvider内部のみ使用できます。コンポーネントをAuthProviderで包んでください。');
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
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userInfo: User = {
        username: currentUser.username,
        email: currentUser.signInDetails?.loginId || '',
        attributes: {
          email: currentUser.signInDetails?.loginId || '',
          email_verified: true,
          sub: currentUser.userId
        }
      };
      setUser(userInfo);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signInUser = async (username: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (isSignedIn) {
        await checkAuthState();
      } else {
        // 追加ステップが必要な場合
        console.log('Sign inに必要な次のステップ:', nextStep);
      }
    } catch (error: any) {
      let errorMessage = 'ログインに失敗しました。';
      
      if (error.name === 'UserNotConfirmedException') {
        errorMessage = 'メール認証が必要です。';
      } else if (error.name === 'NotAuthorizedException') {
        errorMessage = 'ユーザー名またはパスワードが正しくありません。';
      } else if (error.name === 'UserNotFoundException') {
        errorMessage = '存在しないユーザーです。';
      } else if (error.name === 'TooManyRequestsException') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらくしてから再試行してください。';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUpUser = async (username: string, email: string, password: string) => {
    try {
      console.log('会員登録開始:', { username, email });
      console.log('=== Amplify 設定確認 ===');
      const config = Amplify.getConfig();
      console.log('全体設定:', config);
      console.log('Auth 設定:', config.Auth);
      
      // 設定構成がない場合
      if (!config.Auth) {
        throw new Error('Amplify Auth 設定がありません。');
      }
      
      // Cognito設定確認
      if (config.Auth.Cognito) {
        console.log('Cognito 設定:', config.Auth.Cognito);
      } else {
        console.log('Cognito設定がありません。他の設定を確認してください。');
      }
      
      console.log('Cognito会員登録API呼び出しを開始');
      console.log('転送データ:', {
        username,
        password: '********',
        userAttributes: { email }
      });
      
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email: email
          }
        }
      });
      
      console.log('会員登録結果:', { isSignUpComplete, userId, nextStep });
      
      if (!isSignUpComplete) {
        console.log('追加ステップが必要:', nextStep);
      }
    } catch (error: any) {
      console.error('会員登録エラー:', error);
      console.error('エラー詳細:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
        details: error.details,
        logId: error.logId
      });
      
      // エラーメッセージ設定
      let errorMessage = error.message || '登録に失敗しました。';
      
      if (error.name === 'UsernameExistsException') {
        errorMessage = '既に存在するユーザー名です。';
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'パスワードは8文字以上である必要があり、大文字、小文字、数字を含む必要があります。';
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = `入力内容に誤りがあります: ${error.message}`;
      } else if (error.name === 'InvalidEmailRoleAccessPolicyException') {
        errorMessage = 'メール送信権限がありません。管理者にお問い合わせください。';
      } else if (error.message.includes('Auth UserPool not configured')) {
        errorMessage = '現在ログインサービスが利用できません。時間をおいて再度お試しください。';
      } else if (error.message.includes('Cognito 설정을 확인해주세요')) {
        errorMessage = '認証設定に問題があります。サポートまでご連絡ください。';
      }
      
      throw new Error(errorMessage);
    }
  };

  const confirmSignUpUser = async (username: string, code: string) => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
    } catch (error: any) {
      let errorMessage = '認証コードの確認に失敗しました。もう一度お試しください。';
      
      if (error.name === 'CodeMismatchException') {
        errorMessage = '認証コードが正しくありません。ご確認の上、再入力してください。';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = '認証コードの有効期限が切れています。新しいコードを取得して再入力してください。';
      }
      
      throw new Error(errorMessage);
    }
  };

  const resendConfirmationCodeUser = async (username: string) => {
    try {
      await resendSignUpCode({ username });
    } catch (error: any) {
      throw new Error('認証コードの再送信に失敗しました。もう一度お試しください。');
    }
  };

  const forgotPasswordUser = async (username: string) => {
    try {
      await resetPassword({ username });
    } catch (error: any) {
      throw new Error('パスワードリセットメールの送信に失敗しました。');
    }
  };

  const confirmForgotPasswordUser = async (username: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username, confirmationCode: code, newPassword });
    } catch (error: any) {
      let errorMessage = 'パスワードの再設定に失敗しました。もう一度お試しください。';

      if (error.name === 'CodeMismatchException') {
        errorMessage = '認証コードが正しくありません。ご確認の上、再入力してください。';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = '認証コードの有効期限が切れています。新しいコードを取得して再入力してください。';
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = '新しいパスワードは8文字以上で、大文字・小文字・数字を含める必要があります。';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('ログアウト中にエラーが発生しました。:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn: signInUser,
    signUp: signUpUser,
    signOut: signOutUser,
    confirmSignUp: confirmSignUpUser,
    resendConfirmationCode: resendConfirmationCodeUser,
    forgotPassword: forgotPasswordUser,
    confirmForgotPassword: confirmForgotPasswordUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 