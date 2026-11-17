import React, { useEffect } from 'react';
import { Logo } from './Logo';
import { Language } from '../types/gharmap';

interface SplashScreenProps {
  language: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ language, onFinish }) => {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 1200);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen bg-[#0E9F5D] text-white flex flex-col items-center justify-between p-8">
      <div />
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
          <Logo size={56} variant="pin" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">GharMap AI</h1>
        <p className="text-white/95 text-sm font-semibold mt-2">
          Global Architecture, Buildings &amp; Infrastructure Studio
        </p>
        <p className="text-white/80 text-xs mt-1">
          Homes · Commercial Markets · Multi-Story Buildings · Structural Engineering
        </p>
        <p className="urdu-font text-white/95 text-base font-medium mt-3" dir="rtl">
          دنیا بھر کے لیے گھر، مارکیٹ، بلڈنگ اور اسٹرکچرل ڈیزائننگ کا مکمل سسٹم
        </p>
        <div className="w-48 h-1.5 bg-white/25 rounded-full overflow-hidden mt-8">
          <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="text-sm font-semibold text-white/90 hover:text-white underline underline-offset-4 py-2 px-4 min-h-[44px]"
      >
        {language === 'ur' ? 'جاری رکھیں' : 'Enter Studio →'}
      </button>
    </div>
  );
};
