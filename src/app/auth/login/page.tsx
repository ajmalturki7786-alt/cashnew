'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Phone, MessageCircle, ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '@/store';
import { authService } from '@/services/auth';
import toast from 'react-hot-toast';

type AuthMethod = 'email' | 'phone';
type OtpChannel = 'email' | 'sms' | 'whatsapp';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [otpChannel, setOtpChannel] = useState<OtpChannel>('whatsapp');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateIdentifier = () => {
    const newErrors: Record<string, string> = {};
    
    if (!identifier.trim()) {
      newErrors.identifier = authMethod === 'email' 
        ? 'Email is required' 
        : 'Phone number is required';
    } else if (authMethod === 'email' && !/\S+@\S+\.\S+/.test(identifier)) {
      newErrors.identifier = 'Please enter a valid email';
    } else if (authMethod === 'phone' && !/^[6-9]\d{9}$/.test(identifier.replace(/\D/g, ''))) {
      newErrors.identifier = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateIdentifier()) return;
    
    setIsLoading(true);
    try {
      await authService.sendOtp({
        identifier: identifier.trim(),
        identifierType: authMethod,
        channel: authMethod === 'email' ? 'email' : otpChannel,
      });
      
      toast.success(`OTP sent to your ${authMethod === 'email' ? 'email' : otpChannel}`);
      setStep('otp');
      setCountdown(300); // 5 minutes
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp({
        identifier: identifier.trim(),
        identifierType: authMethod,
        otp: otpCode,
      });
      
      setAuth(response.user, response.accessToken, response.refreshToken);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl font-bold">₹</span>
            </div>
            Cash Manager
          </h1>
        </div>
        
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">
            Simple Business Finance Tracking
          </h2>
          <p className="text-blue-100 text-lg">
            Track your business transactions easily. Simple, fast, and secure.
          </p>
        </div>
        
        <div className="text-blue-100 text-sm">
          © 2025 Cash Manager
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {step === 'input' ? (
            <>
              {/* Logo for mobile */}
              <div className="lg:hidden text-center mb-8">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-bold">₹</span>
                  </div>
                  Cash Manager
                </h1>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
                <p className="text-gray-600 mt-2">
                  Sign in to continue
                </p>
              </div>

              {/* Auth Method Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setIdentifier(''); setErrors({}); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    authMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setIdentifier(''); setErrors({}); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                    authMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Phone
                </button>
              </div>

              {/* Input Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="relative">
                  {authMethod === 'phone' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      +91
                    </span>
                  )}
                  <input
                    type={authMethod === 'email' ? 'email' : 'tel'}
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setErrors({}); }}
                    placeholder={authMethod === 'email' ? 'you@example.com' : '9876543210'}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      authMethod === 'phone' ? 'pl-12' : ''
                    } ${errors.identifier ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.identifier && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.identifier}</p>
                )}
              </div>

              {/* OTP Channel Selection for Phone */}
              {authMethod === 'phone' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send OTP via
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpChannel('sms')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                        otpChannel === 'sms'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpChannel('whatsapp')}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all ${
                        otpChannel === 'whatsapp'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Get OTP
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Password Login Option */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Prefer password login?{' '}
                  <Link href="/auth/login-password" className="text-blue-600 hover:underline font-medium">
                    Login with Password
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* OTP Verification Step */
            <>
              <button
                onClick={() => { setStep('input'); setOtp(['', '', '', '', '', '']); }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
                <p className="text-gray-600 mt-2">
                  Enter the 6-digit code sent to
                </p>
                <p className="font-medium text-gray-900">
                  {authMethod === 'email' ? identifier : `+91 ${identifier}`}
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                ))}
              </div>

              {/* Countdown */}
              {countdown > 0 && (
                <p className="text-center text-sm text-gray-500 mb-6">
                  OTP expires in{' '}
                  <span className="font-medium text-blue-600">{formatCountdown(countdown)}</span>
                </p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              {/* Resend OTP */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className={`font-medium ${
                      countdown > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-600 hover:underline'
                    }`}
                  >
                    {countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : 'Resend OTP'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
