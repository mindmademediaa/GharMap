import React from 'react';
import { ArrowLeft, Check, Sparkles, Globe, HardHat, Box } from 'lucide-react';
import { Logo } from './Logo';
import { Language } from '../types/gharmap';
import { TRANSLATIONS } from '../data/constants';

interface PricingPlansScreenProps {
  language: Language;
  onBack: () => void;
  onOpenNewMap: () => void;
  onOpenInfra: () => void;
}

export const PricingPlansScreen: React.FC<PricingPlansScreenProps> = ({
  language,
  onBack,
  onOpenNewMap,
  onOpenInfra,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#112A1E]">{t.pricingPlans}</h1>
          <p className="text-xs sm:text-sm text-[#546E60]">
            All architectural, 3D studio &amp; structural engineering modules are 100% free worldwide
          </p>
        </div>
      </div>

      <div className="bg-[#0E9F5D] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3.5">
            <div className="bg-white rounded-2xl p-2">
              <Logo size={38} />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-[#C7F279] text-[#112A1E] px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> 100% Free Global Access
              </span>
              <h2 className="text-2xl font-extrabold mt-2">
                All Pro &amp; Enterprise Features Unlocked
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-4xl font-extrabold tabular-nums">$0</p>
            <p className="text-xs text-white/85">Unlimited Projects • No Paywalls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
          {[
            'Unlimited 2D Blueprints (8+ layout variations + regenerate more)',
            'Irregular 4-Side Plot Support (Front, Back, Left & Right)',
            'Exact Wall Thickness, Room & Door/Window Engineering Annotations',
            '1:1 Synced 3D Exterior & Multi-Story Interior Studio',
            'A–Z Exterior Cladding, Roof, Gate, Tiles, Lighting & Furniture',
            'Infrastructure & RCC Pillar Engineering (Current + Future Floors)',
            'Homes, Commercial Markets, Buildings, Warehouses & Mixed-Use',
            'Global Currencies (USD, GBP, EUR, AED, SAR, CAD, AUD, INR, PKR)',
            'Unlimited Saved Projects, Client Quotes & PDF Blueprint Export',
          ].map((feat) => (
            <div key={feat} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white text-[#0E9F5D] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </span>
              <span className="text-white/95 font-medium">{feat}</span>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenNewMap}
            className="min-h-[48px] px-6 rounded-2xl bg-white text-[#0E9F5D] font-extrabold text-sm hover:bg-[#F2FAF5] flex items-center gap-2 transition-colors"
          >
            <Box className="w-4 h-4" />
            <span>Create New Map Now</span>
          </button>
          <button
            type="button"
            onClick={onOpenInfra}
            className="min-h-[48px] px-6 rounded-2xl bg-[#112A1E] text-white font-bold text-sm hover:bg-[#193B2B] flex items-center gap-2 transition-colors"
          >
            <HardHat className="w-4 h-4" />
            <span>Open Structural Pillar Studio</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 flex items-center gap-3 text-xs sm:text-sm text-[#405B4D]">
        <Globe className="w-5 h-5 text-[#0E9F5D] shrink-0" />
        <span>
          Built for homeowners, architects, developers, and civil engineers worldwide. Every feature in GharMap AI is open with zero restrictions.
        </span>
      </div>
    </div>
  );
};
