import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';

type Step = 'role' | 'email' | 'otp' | 'canvas-token';
type UserType = 'instructor' | 'student';

const OtpLogin = () => {
  const { isAuthenticated, user, isLoading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('role');
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [canvasToken, setCanvasToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'instructor') {
        navigate('/profile', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRoleSelect = (role: UserType) => {
    setUserType(role);
    setStep('email');
    setError('');
  };

  const handleSendOtp = useCallback(async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!email.toLowerCase().trim().endsWith('@vt.edu')) {
      setError('Only @vt.edu email addresses are allowed.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.post('/auth/otp/request', {
        email: email.toLowerCase().trim(),
        userType
      });
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, userType]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');

    try {
      await apiService.post('/auth/otp/request', {
        email: email.toLowerCase().trim(),
        userType
      });
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to resend code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.post<{
        success: boolean;
        data: {
          verified: boolean;
          userType: string;
          requiresCanvasToken: boolean;
          accessToken: string | null;
          user: any;
        };
        message?: string;
      }>('/auth/otp/verify', {
        email: email.toLowerCase().trim(),
        otpCode,
        userType
      });

      if (response.success && response.data) {
        if (response.data.requiresCanvasToken) {
          // Instructor: go to Canvas token step
          setStep('canvas-token');
        } else if (response.data.accessToken && response.data.user) {
          // Student: login complete
          apiService.setToken(response.data.accessToken);
          localStorage.setItem('vt-ai-auth-user', JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role
          }));
          await refreshUser();
          navigate('/profile');
        }
      } else {
        setError(response.message || 'Verification failed.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Verification failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCanvasToken = async () => {
    if (!canvasToken.trim()) {
      setError('Please enter your Canvas access token.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiService.post<{
        success: boolean;
        data: { accessToken: string; user: any };
        message?: string;
      }>('/auth/otp/canvas-token', {
        email: email.toLowerCase().trim(),
        canvasToken: canvasToken.trim()
      });

      if (response.success && response.data) {
        apiService.setToken(response.data.accessToken);
        localStorage.setItem('vt-ai-auth-user', JSON.stringify({
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role
        }));
        await refreshUser();
        navigate('/profile');
      } else {
        setError(response.message || 'Login failed.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed. Please check your Canvas token.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'email') {
      setStep('role');
      setUserType(null);
      setEmail('');
    } else if (step === 'otp') {
      setStep('email');
      setOtpCode('');
    } else if (step === 'canvas-token') {
      setStep('otp');
      setCanvasToken('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-vt-maroon/5 via-white to-vt-orange/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-vt-maroon to-vt-orange rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              VT
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">AI Assistant Portal</h1>
            <p className="mt-1 text-gray-500">
              {step === 'role' && 'Select your role to get started'}
              {step === 'email' && 'Enter your VT email address'}
              {step === 'otp' && 'Enter verification code'}
              {step === 'canvas-token' && 'Enter your Canvas access token'}
            </p>
          </div>

          <div className="px-8 pb-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                  <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800" aria-label="Dismiss">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 0: Role Selection */}
            {step === 'role' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleRoleSelect('instructor')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vt-maroon hover:bg-vt-maroon/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-vt-maroon/10 rounded-lg flex items-center justify-center group-hover:bg-vt-maroon/20 transition-colors">
                      <svg className="w-5 h-5 text-vt-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">I'm an Instructor</p>
                      <p className="text-sm text-gray-500">Manage courses and content</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-vt-orange hover:bg-vt-orange/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-vt-orange/10 rounded-lg flex items-center justify-center group-hover:bg-vt-orange/20 transition-colors">
                      <svg className="w-5 h-5 text-vt-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">I'm a Student</p>
                      <p className="text-sm text-gray-500">Access course materials and AI chat</p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Step 1: Email Entry */}
            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    VT Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    placeholder="your-pid@vt.edu"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-vt-maroon outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-vt-maroon text-white rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
                <button
                  onClick={handleBack}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back to role selection
                </button>
              </div>
            )}

            {/* Step 2: OTP Entry */}
            {step === 'otp' && (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Verification code sent to <strong>{email}</strong>
                  </p>
                </div>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && otpCode.length === 6 && handleVerifyOtp()}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-vt-maroon outline-none transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 px-4 bg-vt-maroon text-white rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm text-vt-maroon hover:text-red-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Canvas Token Entry (Instructors only) */}
            {step === 'canvas-token' && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-1">Canvas Personal Access Token Required</p>
                  <ol className="text-sm text-blue-600 list-decimal list-inside space-y-0.5">
                    <li>Go to Canvas &gt; Account &gt; Settings</li>
                    <li>Scroll to "Approved Integrations"</li>
                    <li>Click "+ New Access Token"</li>
                    <li>Enter a purpose (e.g., "VT AI Assistant") and click "Generate Token"</li>
                    <li>Copy the token and paste it below</li>
                  </ol>
                </div>
                <div>
                  <label htmlFor="canvas-token" className="block text-sm font-medium text-gray-700 mb-1">
                    Canvas Access Token
                  </label>
                  <input
                    id="canvas-token"
                    type="password"
                    value={canvasToken}
                    onChange={(e) => setCanvasToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && canvasToken.trim() && handleSubmitCanvasToken()}
                    placeholder="Paste your Canvas token here"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vt-maroon focus:border-vt-maroon outline-none transition-colors font-mono text-sm"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSubmitCanvasToken}
                  disabled={loading || !canvasToken.trim()}
                  className="w-full py-3 px-4 bg-vt-maroon text-white rounded-lg font-medium hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {loading ? 'Validating...' : 'Complete Login'}
                </button>
                <button
                  onClick={handleBack}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {['role', 'email', 'otp'].concat(userType === 'instructor' ? ['canvas-token'] : []).map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s === step ? 'bg-vt-maroon' :
                    ['role', 'email', 'otp', 'canvas-token'].indexOf(s) < ['role', 'email', 'otp', 'canvas-token'].indexOf(step)
                      ? 'bg-vt-maroon/40' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpLogin;
