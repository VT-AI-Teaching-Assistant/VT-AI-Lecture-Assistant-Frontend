import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Shield,
  Mail,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  MessageSquare,
  FileText,
  Search,
  Lock,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type Step = 'role' | 'email' | 'otp' | 'canvas-token';
type UserType = 'instructor' | 'student';

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */
const Spinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Noise texture (matches Landing.tsx)                                */
/* ------------------------------------------------------------------ */
const NOISE_BG = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")';

/* ------------------------------------------------------------------ */
/*  OTP Login Page                                                     */
/* ------------------------------------------------------------------ */
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
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  /* ---- Handlers (unchanged logic) ---- */

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
        userType,
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
        userType,
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
        userType,
      });
      if (response.success && response.data) {
        if (response.data.requiresCanvasToken) {
          setStep('canvas-token');
        } else if (response.data.accessToken && response.data.user) {
          apiService.setToken(response.data.accessToken);
          localStorage.setItem(
            'vt-ai-auth-user',
            JSON.stringify({
              id: response.data.user.id,
              email: response.data.user.email,
              role: response.data.user.role,
            }),
          );
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
        canvasToken: canvasToken.trim(),
      });
      if (response.success && response.data) {
        apiService.setToken(response.data.accessToken);
        localStorage.setItem(
          'vt-ai-auth-user',
          JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            role: response.data.user.role,
          }),
        );
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

  /* ---- OTP individual digit handlers ---- */

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const chars = (otpCode + '      ').slice(0, 6).split('');
    chars[index] = digit || ' ';
    const joined = chars.join('').replace(/\s/g, '');
    setOtpCode(joined);
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = (otpCode + '      ').slice(0, 6).split('');
      if (chars[index] && chars[index] !== ' ') {
        chars[index] = ' ';
        setOtpCode(chars.join('').replace(/\s/g, ''));
      } else if (index > 0) {
        chars[index - 1] = ' ';
        setOtpCode(chars.join('').replace(/\s/g, ''));
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'Enter' && otpCode.length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setOtpCode(pasted);
    setTimeout(() => otpInputRefs.current[Math.min(pasted.length, 5)]?.focus(), 0);
  };

  /* ---- Step progress ---- */

  const allSteps: Step[] =
    userType === 'instructor'
      ? ['role', 'email', 'otp', 'canvas-token']
      : ['role', 'email', 'otp'];
  const currentStepIndex = allSteps.indexOf(step);
  const stepLabels: Record<Step, string> = {
    role: 'Role',
    email: 'Email',
    otp: 'Verify',
    'canvas-token': 'Connect',
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/*  LEFT PANEL — Branding & Context (desktop only)              */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative flex-col overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-maroon via-maroon-dark to-[#3a0a1e]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: NOISE_BG }} />
        <div className="absolute top-16 right-[8%] w-72 h-72 rounded-full bg-orange/10 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-[10%] w-96 h-96 rounded-full bg-maroon-light/10 blur-3xl" />
        <div
          className="absolute top-0 right-0 w-full h-full opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative flex-1 flex flex-col px-10 xl:px-14 py-10">
          {/* Logo */}
          <div className="opacity-0 animate-rise flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/[0.15] backdrop-blur-sm shadow-lg shadow-white/5 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-bold tracking-tight text-white">HokieLearn</span>
              <span className="text-lg font-bold tracking-tight text-orange ml-0.5">AI</span>
            </div>
          </div>

          {/* Step-contextual content */}
          <div className="flex-1 flex flex-col justify-center" key={step}>
            {/* ---- ROLE ---- */}
            {step === 'role' && (
              <>
                <div className="opacity-0 animate-rise-d1 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/[0.15] rounded-full mb-6 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-orange" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/80">
                    Get Started
                  </span>
                </div>
                <h2 className="opacity-0 animate-rise-d2 font-display text-4xl xl:text-5xl text-white leading-[1.1] mb-4">
                  Welcome to Your{' '}
                  <span className="italic text-orange/90">AI-Powered</span> Classroom
                </h2>
                <p className="opacity-0 animate-rise-d3 text-white/60 leading-relaxed mb-8 max-w-sm">
                  Sign in to access AI-powered lecture assistance, built exclusively for Virginia
                  Tech.
                </p>
                <div className="opacity-0 animate-rise-d4 space-y-3">
                  {[
                    { icon: <MessageSquare className="w-4 h-4" />, text: 'Ask anything about your lectures' },
                    { icon: <FileText className="w-4 h-4" />, text: 'Auto-generated study notes' },
                    { icon: <Search className="w-4 h-4" />, text: 'Semantic search across all materials' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3 text-white/70">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-orange/80 flex-shrink-0">
                        {f.icon}
                      </div>
                      <span className="text-sm">{f.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ---- EMAIL ---- */}
            {step === 'email' && (
              <>
                <div className="opacity-0 animate-rise-d1 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/[0.15] rounded-full mb-6 w-fit">
                  <Shield className="w-3.5 h-3.5 text-orange" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/80">
                    Secure Verification
                  </span>
                </div>
                <h2 className="opacity-0 animate-rise-d2 font-display text-4xl xl:text-5xl text-white leading-[1.1] mb-4">
                  Verify Your <span className="italic text-orange/90">Identity</span>
                </h2>
                <p className="opacity-0 animate-rise-d3 text-white/60 leading-relaxed mb-8 max-w-sm">
                  We'll send a one-time verification code to your Virginia Tech email to confirm
                  your identity.
                </p>
                <div className="opacity-0 animate-rise-d4 space-y-3">
                  {[
                    { icon: <Lock className="w-4 h-4" />, text: 'End-to-end encrypted verification' },
                    { icon: <Clock className="w-4 h-4" />, text: 'Code expires in 10 minutes' },
                    { icon: <Shield className="w-4 h-4" />, text: 'Restricted to @vt.edu addresses' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3 text-white/70">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-orange/80 flex-shrink-0">
                        {f.icon}
                      </div>
                      <span className="text-sm">{f.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ---- OTP ---- */}
            {step === 'otp' && (
              <>
                <div className="opacity-0 animate-rise-d1 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/[0.15] rounded-full mb-6 w-fit">
                  <Mail className="w-3.5 h-3.5 text-orange" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/80">
                    Check Your Email
                  </span>
                </div>
                <h2 className="opacity-0 animate-rise-d2 font-display text-4xl xl:text-5xl text-white leading-[1.1] mb-4">
                  Enter Your <span className="italic text-orange/90">Verification</span> Code
                </h2>
                <p className="opacity-0 animate-rise-d3 text-white/60 leading-relaxed mb-8 max-w-sm">
                  We've sent a 6-digit code to{' '}
                  <span className="text-white/90 font-medium">{email}</span>. Check your inbox and
                  enter it to continue.
                </p>
                <div className="opacity-0 animate-rise-d4 p-4 rounded-xl bg-white/[0.06] border border-white/10 max-w-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-orange" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">Didn't receive it?</p>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">
                        Check your spam folder. You can request a new code after the cooldown timer.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---- CANVAS TOKEN ---- */}
            {step === 'canvas-token' && (
              <>
                <div className="opacity-0 animate-rise-d1 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/[0.15] rounded-full mb-6 w-fit">
                  <KeyRound className="w-3.5 h-3.5 text-orange" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/80">
                    Canvas Integration
                  </span>
                </div>
                <h2 className="opacity-0 animate-rise-d2 font-display text-4xl xl:text-5xl text-white leading-[1.1] mb-4">
                  Connect Your <span className="italic text-orange/90">Canvas</span> Account
                </h2>
                <p className="opacity-0 animate-rise-d3 text-white/60 leading-relaxed mb-8 max-w-sm">
                  Link your Canvas LMS to sync courses, materials, and student enrollments
                  automatically.
                </p>
                <div className="opacity-0 animate-rise-d4 space-y-3">
                  {[
                    { icon: <BookOpen className="w-4 h-4" />, text: 'Auto-sync courses & materials' },
                    { icon: <Shield className="w-4 h-4" />, text: 'Token encrypted at rest (AES-256)' },
                    { icon: <Lock className="w-4 h-4" />, text: 'Never shared with third parties' },
                  ].map((f) => (
                    <div key={f.text} className="flex items-center gap-3 text-white/70">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-orange/80 flex-shrink-0">
                        {f.icon}
                      </div>
                      <span className="text-sm">{f.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div className="opacity-0 animate-rise-d5 flex items-center gap-5 text-white/40">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Canvas LMS Integrated
            </div>
            <div className="text-xs font-medium">CISL Lab &middot; Virginia Tech</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  RIGHT PANEL — Form                                          */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#faf9f7]">
        {/* Mobile header */}
        <div className="lg:hidden relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-maroon to-maroon-dark" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-orange/10 blur-2xl" />
          <div className="relative px-6 py-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/[0.15] backdrop-blur-sm flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">HokieLearn</span>
              <span className="text-lg font-bold text-orange tracking-tight ml-0.5">AI</span>
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-8 md:px-10">
          <div className="w-full max-w-[440px]">
            {/* Step progress indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                {allSteps.map((s, i) => {
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isCompleted
                              ? 'bg-maroon text-white'
                              : isCurrent
                                ? 'bg-maroon text-white ring-4 ring-maroon/20'
                                : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        <span
                          className={`text-[10px] font-semibold tracking-wider uppercase ${
                            isCurrent
                              ? 'text-maroon'
                              : isCompleted
                                ? 'text-maroon/60'
                                : 'text-gray-400'
                          }`}
                        >
                          {stepLabels[s]}
                        </span>
                      </div>
                      {i < allSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-300 ${
                            i < currentStepIndex ? 'bg-maroon' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Back button */}
            {step !== 'role' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-maroon transition-colors mb-4 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back
              </button>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200/80 rounded-xl animate-reveal">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed flex-1">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                    aria-label="Dismiss"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div key={step} className="opacity-0 animate-reveal p-6 sm:p-7 md:p-8">
                {/* ================================================ */}
                {/*  STEP: Role Selection                             */}
                {/* ================================================ */}
                {step === 'role' && (
                  <>
                    <h2 className="font-display text-2xl sm:text-3xl text-gray-900 mb-2">
                      Choose Your Role
                    </h2>
                    <p className="text-gray-500 text-sm mb-7">
                      Select how you'll be using HokieLearn AI
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleRoleSelect('instructor')}
                        className="w-full group relative p-5 rounded-xl border-2 border-gray-200 hover:border-maroon bg-white hover:bg-gradient-to-r hover:from-maroon/[0.03] hover:to-transparent transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-maroon/[0.08] group-hover:bg-maroon group-hover:shadow-lg group-hover:shadow-maroon/20 flex items-center justify-center transition-all duration-200">
                            <BookOpen className="w-5 h-5 text-maroon group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 group-hover:text-maroon transition-colors">
                              Instructor
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Manage courses, upload content, view analytics
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-maroon group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>

                      <button
                        onClick={() => handleRoleSelect('student')}
                        className="w-full group relative p-5 rounded-xl border-2 border-gray-200 hover:border-orange bg-white hover:bg-gradient-to-r hover:from-orange/[0.04] hover:to-transparent transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange/10 group-hover:bg-orange group-hover:shadow-lg group-hover:shadow-orange/20 flex items-center justify-center transition-all duration-200">
                            <GraduationCap className="w-5 h-5 text-orange group-hover:text-white transition-colors" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 group-hover:text-orange transition-colors">
                              Student
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              Access AI chat, notes, and course materials
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    </div>
                  </>
                )}

                {/* ================================================ */}
                {/*  STEP: Email Entry                                */}
                {/* ================================================ */}
                {step === 'email' && (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-maroon/[0.08] flex items-center justify-center mb-5">
                      <Mail className="w-5 h-5 text-maroon" />
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl text-gray-900 mb-2">
                      Enter Your Email
                    </h2>
                    <p className="text-gray-500 text-sm mb-7">
                      We'll send a verification code to your VT email
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                          VT Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                            placeholder="your-pid@vt.edu"
                            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all text-sm bg-gray-50/50 focus:bg-white"
                            autoFocus
                          />
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-maroon text-white rounded-xl font-semibold text-sm hover:bg-maroon-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-maroon/25 active:scale-[0.98]"
                      >
                        {loading ? <Spinner /> : null}
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                )}

                {/* ================================================ */}
                {/*  STEP: OTP Entry                                  */}
                {/* ================================================ */}
                {step === 'otp' && (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl text-gray-900 mb-2">
                      Verification Code
                    </h2>
                    <p className="text-gray-500 text-sm mb-7">
                      Enter the 6-digit code sent to{' '}
                      <span className="font-medium text-gray-700">{email}</span>
                    </p>

                    <div className="space-y-5">
                      {/* Individual OTP digit inputs */}
                      <div className="flex gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpInputRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otpCode[i] || ''}
                            onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`flex-1 min-w-0 h-12 sm:h-14 border-2 rounded-xl text-center text-lg sm:text-xl font-bold transition-all outline-none ${
                              otpCode[i]
                                ? 'border-maroon bg-maroon/[0.03] text-maroon'
                                : 'border-gray-200 bg-gray-50/50 text-gray-900 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/20'
                            }`}
                            autoFocus={i === 0}
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otpCode.length !== 6}
                        className="w-full py-3.5 px-4 bg-maroon text-white rounded-xl font-semibold text-sm hover:bg-maroon-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-maroon/25 active:scale-[0.98]"
                      >
                        {loading ? <Spinner /> : null}
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>

                      <div className="flex items-center justify-center">
                        <button
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || loading}
                          className="text-sm text-maroon hover:text-maroon-dark transition-colors disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                          {resendCooldown > 0
                            ? `Resend code in ${resendCooldown}s`
                            : 'Resend verification code'}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ================================================ */}
                {/*  STEP: Canvas Token                               */}
                {/* ================================================ */}
                {step === 'canvas-token' && (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5">
                      <KeyRound className="w-5 h-5 text-orange" />
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl text-gray-900 mb-2">
                      Canvas Access Token
                    </h2>
                    <p className="text-gray-500 text-sm mb-5">
                      Generate a personal access token from Canvas to connect your account
                    </p>

                    {/* Instructions card */}
                    <div className="p-4 rounded-xl bg-orange/[0.04] border border-orange/[0.15] mb-5">
                      <p className="text-xs font-semibold text-orange mb-2.5 uppercase tracking-wider">
                        How to get your token
                      </p>
                      <ol className="text-sm text-gray-600 space-y-2">
                        {[
                          'Go to Canvas \u2192 Account \u2192 Settings',
                          'Scroll to "Approved Integrations"',
                          'Click "+ New Access Token" \u2192 Generate',
                          'Copy the token and paste below',
                        ].map((text, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-orange/10 text-orange text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="canvas-token"
                          className="block text-sm font-medium text-gray-700 mb-1.5"
                        >
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            id="canvas-token"
                            type="password"
                            value={canvasToken}
                            onChange={(e) => setCanvasToken(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === 'Enter' && canvasToken.trim() && handleSubmitCanvasToken()
                            }
                            placeholder="Paste your Canvas token here"
                            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition-all text-sm font-mono bg-gray-50/50 focus:bg-white"
                            autoFocus
                          />
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <button
                        onClick={handleSubmitCanvasToken}
                        disabled={loading || !canvasToken.trim()}
                        className="w-full py-3.5 px-4 bg-maroon text-white rounded-xl font-semibold text-sm hover:bg-maroon-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-maroon/25 active:scale-[0.98]"
                      >
                        {loading ? <Spinner /> : null}
                        {loading ? 'Validating Token...' : 'Complete Login'}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              By signing in, you agree to HokieLearn AI's terms of service.
              <br />
              <span className="text-gray-300">
                Built with pride at CISL Lab, Virginia Tech
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpLogin;
