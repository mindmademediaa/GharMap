import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { Language, PlanTier } from '../types/gharmap';
import { TRANSLATIONS } from '../data/constants';

interface PricingPlansScreenProps {
  language: Language;
  currentPlan: PlanTier;
  onBack: () => void;
  onSelectPlan: (plan: PlanTier) => void;
  onUnlockSingleMap: () => void;
}

export const PricingPlansScreen: React.FC<PricingPlansScreenProps> = ({
  language,
  currentPlan,
  onBack,
  onSelectPlan,
  onUnlockSingleMap,
}) => {
  const t = TRANSLATIONS[language];
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  const proPrice = billing === 'monthly' ? 'Rs 1,499' : 'Rs 14,999';
  const premiumPrice = billing === 'monthly' ? 'Rs 2,999' : 'Rs 29,999';
  const periodLabel = billing === 'monthly' ? '/month' : '/year';

  return (
    <div className="space-y-6">
      {/* Header matching Screenshot 1 */}
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
            Choose the plan that&apos;s right for your construction project
          </p>
        </div>
      </div>

      {/* Brand + Monthly/Yearly Toggle */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo size={42} />
          <div>
            <p className="text-base font-extrabold text-[#112A1E]">GharMap AI</p>
            <p className="text-xs text-[#546E60]">Construction Intelligence</p>
          </div>
        </div>

        <div className="inline-flex items-center p-1 bg-white border border-[#DCE8E1] rounded-full shadow-xs">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`min-h-[40px] px-5 rounded-full text-xs sm:text-sm font-bold transition-colors ${
              billing === 'monthly'
                ? 'bg-[#0E9F5D] text-white'
                : 'text-[#405B4D] hover:text-[#112A1E]'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`min-h-[40px] px-4 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
              billing === 'yearly'
                ? 'bg-[#0E9F5D] text-white'
                : 'text-[#405B4D] hover:text-[#112A1E]'
            }`}
          >
            <span>Yearly</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                billing === 'yearly'
                  ? 'bg-white text-[#0E9F5D]'
                  : 'bg-[#0E9F5D] text-white'
              }`}
            >
              -20% Save
            </span>
          </button>
        </div>
      </div>

      {/* 3 Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* FREE PLAN */}
        <div className="bg-white border border-[#DCE8E1] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#112A1E]">Free Plan</h2>
              {currentPlan === 'free' && (
                <span className="text-xs font-bold text-[#0E9F5D] border border-[#0E9F5D]/30 px-2.5 py-0.5 rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            <div className="mt-2 pb-4 border-b border-[#EDF3EF]">
              <span className="text-3xl font-extrabold text-[#112A1E] tabular-nums">Rs 0</span>
              <span className="text-xs text-[#546E60] ml-1">/month</span>
            </div>

            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#2E4639]">
              {[
                '1 Free Project',
                '1 Basic 2D Floor Plan (Pakistani Style only)',
                'Basic Area Calculator (Sq Ft / Marla)',
                'View Sample 3D Design (No rotation)',
                'Basic Costing Estimate (Total only, no breakdown)',
                'Community Support',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0E9F5D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('free')}
            className="mt-6 w-full min-h-[48px] rounded-2xl border border-[#0E9F5D] text-[#0E9F5D] font-bold text-sm hover:bg-[#E7F6EE] transition-colors"
          >
            {currentPlan === 'free' ? 'Current Plan' : 'Switch to Free'}
          </button>
        </div>

        {/* PRO PLAN (Most Popular Green Highlighted Card) */}
        <div className="bg-[#0E9F5D] text-white rounded-3xl p-6 flex flex-col justify-between shadow-md relative">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold">Pro Plan</h2>
              <span className="bg-[#C7F279] text-[#112A1E] text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Most Popular
              </span>
            </div>
            <div className="mt-2 pb-4 border-b border-white/20">
              <span className="text-3xl font-extrabold tabular-nums">{proPrice}</span>
              <span className="text-xs text-white/85 ml-1">{periodLabel}</span>
            </div>

            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-white/95">
              {[
                'Unlimited 2D Plans (All 5 Styles)',
                'Full 3D View with 360° Rotation + Zoom',
                'Interior / Exterior Customization (Colors, Tiles, Gate)',
                'Full Material Costing with BOQ Breakdown + City Rates',
                'PDF Download (Map + BOQ)',
                'Up to 10 Projects Save',
                'WhatsApp Share',
                'Priority Support',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white text-[#0E9F5D] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('pro')}
            className="mt-6 w-full min-h-[48px] rounded-2xl bg-white text-[#0E9F5D] font-extrabold text-sm hover:bg-[#F2FAF5] transition-colors shadow-xs"
          >
            {currentPlan === 'pro' ? 'Current Plan (Pro Active)' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-white border border-[#DCE8E1] rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#112A1E]">Premium Plan</h2>
              <span className="text-xs font-bold text-[#0E9F5D]">Builders & Contractors</span>
            </div>
            <div className="mt-2 pb-4 border-b border-[#EDF3EF]">
              <span className="text-3xl font-extrabold text-[#112A1E] tabular-nums">
                {premiumPrice}
              </span>
              <span className="text-xs text-[#546E60] ml-1">{periodLabel}</span>
            </div>

            <ul className="mt-4 space-y-2.5 text-xs sm:text-sm text-[#2E4639]">
              {[
                'Everything in PRO',
                'Unlimited Projects',
                'Structural Details: Foundation, Beam, Column Layout',
                'Electrical + Plumbing Layout',
                'Real-time Contractor Quotes',
                'Client Management Dashboard',
                'White Label PDF with Company Logo',
                'Dedicated Account Manager',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0E9F5D] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan('premium')}
            className="mt-6 w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm transition-colors"
          >
            {currentPlan === 'premium' ? 'Current Plan (Premium)' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>

      {/* Pay Per Design Option */}
      <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#0E9F5D] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#112A1E]">
              Pay Per Design · Single Map Rs 999 (One-time)
            </h3>
            <p className="text-xs sm:text-sm text-[#405B4D] mt-0.5">
              Unlock all 5 architectural styles, 360° 3D rotation, full BOQ & PDF export for your current active project without a monthly subscription.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUnlockSingleMap}
          className="min-h-[46px] px-5 rounded-2xl bg-[#112A1E] hover:bg-[#0E9F5D] text-white font-bold text-sm whitespace-nowrap shrink-0 transition-colors"
        >
          Unlock Single Map · Rs 999
        </button>
      </div>
    </div>
  );
};
