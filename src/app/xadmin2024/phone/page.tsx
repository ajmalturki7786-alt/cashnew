'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { adminService } from '@/services/admin.service';
import { Shield, Phone, ArrowLeft } from 'lucide-react';

export default function AdminPhoneLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(0);

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    // Clean phone number - remove spaces, dashes, country code if present
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Remove leading 91 if 12 digits (country code included)
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.sendOtp({
        identifier: cleanPhone,
        identifierType: 'phone',
        channel: 'sms'
      });
      
      setOtpSent(true);
      setTimer(60);
      setSuccess('OTP sent successfully to your phone!');
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter 6-digit OTP');
      return;
    }

    // Clean phone number
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authService.verifyOtp({
        identifier: cleanPhone,
        identifierType: 'phone',
        otp: otp
      });
      
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Small delay to ensure token is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check admin status
      const isAdmin = await adminService.checkAdminStatus();
      
      if (isAdmin) {
        window.location.href = '/admin';
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setError('Access denied. Admin privileges required.');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setOtp('');
    await handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Phone OTP Verification</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm mb-6">
              {success}
            </div>
          )}

          {!otpSent ? (
            // Phone Number Input
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={10}
                    className="w-full pl-14 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter your registered admin phone number
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || phoneNumber.length < 10}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Send OTP
                  </>
                )}
              </button>
            </div>
          ) : (
            // OTP Verification
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••"
                />
                <p className="text-xs text-gray-400 mt-2">
                  OTP sent to +91 {phoneNumber}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Verify & Login'
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                  className="text-red-400 hover:text-red-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          This area is monitored. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
