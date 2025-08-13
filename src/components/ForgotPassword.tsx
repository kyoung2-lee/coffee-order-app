import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const { forgotPassword, confirmForgotPassword } = useAuth();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await forgotPassword(username);
      setIsCodeSent(true);
    } catch (error: any) {
      setError(error.message || 'パスワードリセットメールの送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('新しいパスワードが一致しません。');
      return;
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります。');
      return;
    }

    // Cognitoパスワードポリシー確認
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('パスワードは大文字、小文字、数字を含む必要があります。');
      return;
    }

    setIsLoading(true);

    try {
      await confirmForgotPassword(username, confirmationCode, newPassword);
      // 成功メッセージの表示後にログインページに移動
      if (onBackToLogin) {
        onBackToLogin();
      }
    } catch (error: any) {
      setError(error.message || 'パスワードリセットに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCodeSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="bg-white/90 p-8 rounded-[12px] shadow-2xl w-[400px] max-w-[90%]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              パスワードリセット
            </h1>
            <p className="text-gray-600 text-sm">
              メールで送信された認証コードを入力して新しいパスワードを設定してください。
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleResetPassword}>
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
                onChange={e => setConfirmationCode(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
                新しいパスワード <span className="text-red-500">*</span>
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
                placeholder="新しいパスワード（8文字以上、大文字/小文字/数字を含む）"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
                新しいパスワード確認 <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
                placeholder="新しいパスワード確認"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-[0.875rem] px-4 bg-[#ff6d4d] text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isLoading ? '処理中...' : 'パスワードリセット'}
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
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="bg-white/90 p-8 rounded-[12px] shadow-2xl w-[400px] max-w-[90%]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            パスワードを忘れた場合
          </h1>
          <p className="text-gray-600 text-sm">
            ユーザー名を入力するとパスワードリセットメールを送信します。
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSendCode}>
          <div>
            <label htmlFor="username" className="block font-medium text-gray-700 text-[12px] text-left mb-2">
              ユーザー名 <span className="text-red-500">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white/50"
              placeholder="ユーザー名を入力してください"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-[0.875rem] px-4 bg-[#ff6d4d] text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {isLoading ? '送信中...' : '認証コード送信'}
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

export default ForgotPassword;
