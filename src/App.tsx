import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import NotificationCenter from './components/NotificationCenter';
import './amplify';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        {showSignUp ? (
          <div>
            <SignUp />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowSignUp(false)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                すでにアカウントをお持ちですか？ログインする
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Login />
            <div className="text-center mt-4">
              <button
                onClick={() => setShowSignUp(true)}
                className="text-indigo-600 hover:text-indigo-500"
              >
                アカウントをお持ちでないですか？新規登録する
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">コーヒー注文システム</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                こんにちは、{user?.username || 'ユーザー'}さん！
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ログイン成功！
              </h2>
              <p className="text-gray-600">
                コーヒー注文システムをご利用いただけます。
              </p>
              <p className="text-sm text-gray-500 mt-2">
 
 
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <NotificationCenter />
    </AuthProvider>
  );
};

export default App;
