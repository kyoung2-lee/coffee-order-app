import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignUpProps {
  onBackToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const { signUp, confirmSignUp, resendConfirmationCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上である必要があります。');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('パスワードは大文字、小文字、数字、特殊文字を含む必要があります。');
      return;
    }

    setIsLoading(true);

    try {
      console.log('会員登録開始:', { username: email, email });
      await signUp(email, email, password);
      setIsSuccess(true);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('SignUpコンポーネントエラー:', error);
      setError(error.message || '登録に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await confirmSignUp(email, confirmationCode);
      setShowConfirmation(false);
      setIsSuccess(false);
      // ログインページにリダイレクトまたは成功メッセージを表示する
    } catch (error: any) {
      setError(error.message || '認証コードの確認に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      await resendConfirmationCode(email);
      setError('認証コードが再送信されました。');
    } catch (error: any) {
      setError(error.message || '認証コードの再送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white/90 p-8 rounded-[12px] shadow-2xl w-[400px] max-w-[90%]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              メール認証
            </h1>
            <p className="text-gray-600 text-sm">
              {email}に送信された認証コードを入力してください。
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleConfirmSignUp}>
            <div>
              <label htmlFor="confirmationCode" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
                認証コード <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmationCode"
                name="confirmationCode"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
                placeholder="認証コード6桁"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-[0.875rem] px-4 bg-[#ff6d4d] text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? '確認中...' : '認証確認'}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="px-4 py-[0.875rem] border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                再送信
              </button>
            </div>
          </form>

          {onBackToLogin && (
            <div className="text-center mt-6">
              <button
                onClick={onBackToLogin}
                className="text-gray-600 hover:text-gray-800 text-sm">
                ログインに戻る
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSuccess && !showConfirmation) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white/90 p-8 rounded-[12px] shadow-2xl w-[400px] max-w-[90%]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              登録完了！
            </h1>
            <p className="text-gray-600 text-sm">
              メールで送信された認証コードを確認してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="bg-white/90 p-8 rounded-[12px] shadow-2xl w-[400px] max-w-[90%]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            新規登録
          </h1>
          <p className="text-gray-600 text-sm">
            アカウントを作成するために必要な情報を入力してください。
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
              placeholder="パスワード（8文字以上、大文字/小文字/数字/特殊文字を含む）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              例: Test123!@#
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
              placeholder="パスワード確認"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-[0.875rem] px-4 bg-[#ff6d4d] text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? '登録中...' : '登録'}
          </button>
        </form>

        {onBackToLogin && (
          <div className="text-center mt-6">
            <button
              onClick={onBackToLogin}
              className="text-gray-600 hover:text-gray-800 text-sm">
              ログインに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp; 