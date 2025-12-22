import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '../config/oauth';
import { apiService } from '../services/ApiService';
import { useAuth, AuthUser } from '../context/AuthContext';

/**
 * OAuth Callback Handler
 * This component handles the redirect from Canvas OAuth (fake_oauth_canvas)
 * and exchanges the authorization code for tokens
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'error' | 'success'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract authorization code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for errors from OAuth server
        if (error) {
          setStatus('error');
          setErrorMessage(`OAuth error: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          return;
        }

        console.log('Exchanging authorization code for Canvas access token...');
        
        // Step 1: Exchange authorization code for Canvas access token
        const tokenResponse = await exchangeCodeForToken(code);
        
        console.log('Canvas token received:', {
          hasAccessToken: !!tokenResponse.access_token,
          user: tokenResponse.user
        });

        // Step 2: Send Canvas access token to backend for JWT token generation
        const response = await apiService.post<{ 
          success: boolean; 
          data: { accessToken: string; user: any }; 
          message?: string 
        }>('/auth/oauth/login', {
          canvasAccessToken: tokenResponse.access_token,
          canvasUser: tokenResponse.user
        });

        if (response.success && response.data) {
          console.log('JWT tokens received from backend');
          
          // Store JWT access token in memory
          apiService.setToken(response.data.accessToken);
          
          // Store minimal user info for session persistence
          const userData = response.data.user;
          localStorage.setItem('vt-ai-auth-user', JSON.stringify({ 
            id: userData.id, 
            email: userData.email, 
            role: userData.role 
          }));

          // Refresh user profile to update context
          await refreshUser();

          setStatus('success');
          
          // Redirect to profile page after a brief delay
          setTimeout(() => {
            navigate('/profile');
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage(response.message || 'Failed to authenticate with backend');
        }
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vt-maroon/5 via-white to-vt-orange/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-vt-maroon to-vt-orange rounded-xl flex items-center justify-center text-white mb-4">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h1>
              <p className="text-gray-500">Please wait while we complete your login</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-vt-maroon text-white rounded-lg hover:bg-red-800 transition-colors"
              >
                Return to Login
              </button>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h1>
              <p className="text-gray-500">Redirecting to your profile...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;

