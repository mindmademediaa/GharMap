import React, { useState } from 'react';
import { Phone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import { Language, UserProfile } from '../types/gharmap';

interface AuthScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  onAuthenticated: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  language,
  onToggleLanguage,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'options' | 'phone-input' | 'otp-verify'>('options');
  const [name, setName] = useState('Ahmed Raza');
  const [phone, setPhone] = useState('0300 5421890');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = () => {
    onAuthenticated({
      name: 'Ahmed Raza',
      email: 'ahmed.raza@gharmap.pk',
      authMethod: 'google',
      companyName: 'Al-Noor Builders & Associates',
    });
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError(
        language === 'ur'
          ? 'براہ کرم درست پاکستانی موبائل نمبر درج کریں'
          : 'Please enter a valid 10 or 11 digit Pakistani mobile number.',
      );
      return;
    }
    setError('');
    setOtp('1234');
    setMode('otp-verify');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      setError('Enter the 4-digit verification code (1234).');
      return;
    }
    onAuthenticated({
      name: name.trim() || 'Builder User',
      phone: `+92 ${phone.replace(/^0/, '')}`,
      authMethod: 'phone',
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F9F7] flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#DCE8E1] shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <h1 className="text-xl font-bold text-[#112A1E]">GharMap AI</h1>
              <p className="text-xs text-[#546E60]">Construction House Design</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[40px] px-3 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-semibold hover:bg-[#D5EFE1] transition-colors"
          >
            {language === 'en' ? 'اردو' : 'English'}
          </button>
        </div>

        {mode === 'options' && (
          <div className="space-y-4">
            <div className="bg-[#E7F6EE] rounded-2xl p-4">
              <h2 className="text-lg font-bold text-[#112A1E]">
                {language === 'ur' ? 'خوش آمدید!' : 'Welcome to GharMap AI'}
              </h2>
              <p className="text-sm text-[#405B4D] mt-1">
                {language === 'ur'
                  ? 'لاہور، اسلام آباد، کراچی اور پشاور کے لیے فوری 2D نقشے، 3D ویو اور PKR تخمینہ حاصل کریں۔'
                  : 'Create instant 2D floor plans, interactive 3D elevations, and accurate PKR material BOQs for Pakistan.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full min-h-[52px] rounded-2xl border border-[#D4E2DA] bg-white hover:bg-[#F7FBF9] text-[#112A1E] font-semibold text-sm flex items-center justify-center gap-3 transition-colors shadow-xs"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                />
              </svg>
              <span>{language === 'ur' ? 'گوگل کے ساتھ لاگ ان کریں' : 'Continue with Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('phone-input')}
              className="w-full min-h-[52px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-semibold text-sm flex items-center justify-center gap-3 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>
                {language === 'ur' ? 'فون نمبر OTP کے ساتھ لاگ ان' : 'Sign in with Phone OTP (+92)'}
              </span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() =>
                  onAuthenticated({
                    name: 'Guest Builder',
                    authMethod: 'guest',
                  })
                }
                className="text-sm font-medium text-[#546E60] hover:text-[#0E9F5D] py-2 px-4 min-h-[44px]"
              >
                {language === 'ur' ? 'مہمان کے طور پر جاری رکھیں' : 'Continue as Guest →'}
              </button>
            </div>
          </div>
        )}

        {mode === 'phone-input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#405B4D] mb-1.5">
                {language === 'ur' ? 'آپ کا نام' : 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bilal Khan"
                className="w-full min-h-[48px] px-4 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#405B4D] mb-1.5">
                {language === 'ur' ? 'پاکستانی موبائل نمبر' : 'Pakistani Mobile Number'}
              </label>
              <div className="flex items-center gap-2">
                <span className="min-h-[48px] px-3.5 rounded-xl bg-[#E7F6EE] border border-[#DCE8E1] text-sm font-semibold text-[#0E9F5D] flex items-center">
                  +92
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="300 1234567"
                  className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span>{language === 'ur' ? 'OTP کوڈ بھیجیں' : 'Send OTP Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMode('options')}
              className="w-full text-xs font-semibold text-[#546E60] py-2 min-h-[40px]"
            >
              {language === 'ur' ? 'واپس جائیں' : '← Back to login options'}
            </button>
          </form>
        )}

        {mode === 'otp-verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-start gap-3 bg-[#E7F6EE] p-3.5 rounded-2xl text-xs text-[#1D4E35]">
              <ShieldCheck className="w-5 h-5 text-[#0E9F5D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">OTP Sent to +92 {phone.replace(/^0/, '')}</p>
                <p className="mt-0.5 text-[#405B4D]">Demo verification code pre-filled: 1234</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#405B4D] mb-1.5">
                4-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-center text-xl font-bold tracking-[0.4em] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              />
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full min-h-[50px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'ur' ? 'تصدیق کریں اور داخل ہوں' : 'Verify & Open Dashboard'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('phone-input')}
              className="w-full text-xs font-semibold text-[#546E60] py-2 min-h-[40px]"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
