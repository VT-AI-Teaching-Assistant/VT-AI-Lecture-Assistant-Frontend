import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vt-maroon/5 via-white to-vt-orange/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative">
          <button
            aria-label="Demo account info"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
            onClick={() => setShowInfo((s) => !s)}
          >
            i
          </button>
          {showInfo && (
            <div className="absolute right-3 top-12 z-10 w-72 bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              <p className="font-semibold mb-1">Demo accounts</p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>User</span>
                  <code className="bg-gray-50 border rounded px-2 py-0.5">student@vt.edu / learn123</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instructor</span>
                  <code className="bg-gray-50 border rounded px-2 py-0.5">instructor@vt.edu / teach123</code>
                </div>
              </div>
            </div>
          )}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-vt-maroon to-vt-orange rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              VT
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">AI Assistant Portal</h1>
            <p className="mt-1 text-gray-500">Sign in with demo credentials</p>
          </div>

          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
                  placeholder="student@vt.edu or instructor@vt.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-transparent"
                  placeholder="learn123 or teach123"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${
                  isLoading ? 'bg-vt-maroon/70' : 'bg-vt-maroon hover:bg-red-800'
                }`}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Demo accounts section removed; info available via (i) button */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


