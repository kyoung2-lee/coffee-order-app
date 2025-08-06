import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onClickSignUp?: () => void;
}

const Login: React.FC<LoginProps> = ({ onClickSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const username = email.split('@')[0]; // emailからusernameを取得 (任意)
      await signIn(username, password);
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat bg-fixed">
      <div className="bg-white/90 p-8 rounded-[12px] shadow-lg w-[400px] max-w-[90%]">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/my-logo.svg" alt="Coffee Day" className="h-10 max-w-[80px] mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coffee Day</h1>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700 text-xs text-left">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-gray-700 text-xs text-left">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-gray-700 text-sm">Remember</label>
            </div>
            <a href="#" className="text-gray-600 hover:text-gray-800 text-sm">
              Forgot password?
            </a>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 mb-4 py-[0.875rem] px-4 bg-[#ff6d4d] text-white text-sm font-medium rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Logging...' : 'LOGIN'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300/30"></div>
          <span className="mx-2 text-gray-500 bg-white/40 px-2 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-300/30"></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-gray-700 rounded-lg border border-gray-300/30 transition-colors">
            <i className="fab fa-google"></i>
          </button>
          <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-gray-700 rounded-lg border border-gray-300/30 transition-colors">
            <i className="fab fa-github"></i>
          </button>
          <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-gray-700 rounded-lg border border-gray-300/30 transition-colors">
            <i className="fab fa-instagram"></i>
          </button>
        </div>

        {onClickSignUp && (
          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm mt-6">
              Don't have an account?{' '}
              <a href="#" onClick={onClickSignUp} className="font-medium text-indigo-600 hover:text-indigo-800">
                Sign up now
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
