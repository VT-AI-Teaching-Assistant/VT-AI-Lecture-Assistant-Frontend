import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthorizationUrl } from '../config/oauth';
import OtpLogin from './OtpLogin';

const authMode = process.env.REACT_APP_AUTH_MODE || 'otp';

const Login = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Check for session expired parameter on mount
  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setSessionExpiredMessage('Your session has expired. Please sign in again to continue.');
      // Remove the query parameter from URL without reload
      searchParams.delete('sessionExpired');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOAuthLogin = () => {
    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('oauth_state', state);

    // Redirect to OAuth authorization endpoint
    const authUrl = getAuthorizationUrl(state);
    window.location.href = authUrl;
  };

  // Use OTP login when auth mode is 'otp'
  if (authMode === 'otp') {
    return <OtpLogin />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-vt-maroon/5 via-white to-vt-orange/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-vt-maroon to-vt-orange rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              VT
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">AI Assistant Portal</h1>
            <p className="mt-1 text-gray-500">Sign in with your Canvas account</p>
          </div>

          <div className="px-8 pb-8">
            {/* Session Expired Message */}
            {sessionExpiredMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Session Expired</p>
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

            {/* Canvas OAuth Login Button */}
            <button
              onClick={handleOAuthLogin}
              className="w-full py-3 px-4 bg-vt-maroon text-white rounded-lg font-medium hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Sign in with Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
