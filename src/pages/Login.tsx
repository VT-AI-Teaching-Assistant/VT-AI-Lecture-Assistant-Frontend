import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/ApiService';
import { getAuthorizationUrl } from '../config/oauth';

const Login = () => {
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>('Unknown');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'instructor') {
        navigate('/profile', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Check for session expired or Canvas re-auth required parameters on mount
  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setSessionExpiredMessage('Your session has expired. Please sign in again to continue.');
      // Remove the query parameter from URL without reload
      searchParams.delete('sessionExpired');
      setSearchParams(searchParams, { replace: true });
    } else if (searchParams.get('canvasReauthRequired') === 'true') {
      setSessionExpiredMessage('Your Canvas connection has expired. Please sign in with Canvas again to reconnect.');
      // Remove the query parameter from URL without reload
      searchParams.delete('canvasReauthRequired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const testBackendConnection = async () => {
    try {
      setBackendStatus('Testing...');
      const response = await apiService.get('/health');
      console.log('Backend health check:', response);
      setBackendStatus('Connected');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('Failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const res = await login(email.trim(), password);
    setIsLoading(false);
    if (res.success) {
      navigate('/profile');
    } else {
      setError(res.message);
    }
  };

  const handleOAuthLogin = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);
    
    // Redirect to OAuth authorization endpoint
    const authUrl = getAuthorizationUrl(state);
    window.location.href = authUrl;
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
            {/* Session Expired / Re-authentication Message */}
            {sessionExpiredMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Sign In Required</p>
                    <p className="text-sm text-amber-700">{sessionExpiredMessage}</p>
                  </div>
                  <button
                    onClick={() => setSessionExpiredMessage(null)}
                    className="ml-auto text-amber-600 hover:text-amber-800"
                    aria-label="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

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

              {/* Backend Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Backend Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${backendStatus === 'Connected' ? 'bg-green-100 text-green-800' :
                    backendStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                      backendStatus === 'Testing...' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {backendStatus}
                  </span>
                  <button
                    type="button"
                    onClick={testBackendConnection}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Test
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-lg text-white font-medium transition-colors ${isLoading ? 'bg-vt-maroon/70' : 'bg-vt-maroon hover:bg-red-800'
                  }`}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* OAuth Login Button */}
            <button
              onClick={handleOAuthLogin}
              className="w-full py-2 px-4 border-2 border-vt-maroon text-vt-maroon rounded-lg font-medium hover:bg-vt-maroon hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Sign in with Canvas OAuth
            </button>

            {/* Demo accounts section removed; info available via (i) button */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


