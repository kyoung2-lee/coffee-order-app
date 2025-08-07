import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import SignUp from './components/SignUp';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
                Have an account? Sign in here
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Login onClickSignUp={() => setShowSignUp(true)} />
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
              <h1 className="text-xl font-semibold text-gray-900">Coffee Day</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hi, {user?.username || 'User'}！
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
                Coffee Dayをご利用いただけます。
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Thank you for using Coffee Day.
 
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
    </AuthProvider>
  );
};

export default App;
