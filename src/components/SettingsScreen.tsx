import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Ruler,
  Sliders,
  LogOut,
  Check,
  RotateCcw,
  Building2,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_REGION_RATES,
  GLOBAL_REGIONS,
  TRANSLATIONS,
  getRegionConfig,
} from '../data/constants';
import {
  AllRegionRates,
  GlobalRegionCode,
  Language,
  RegionalMaterialRates,
  UnitType,
  UserProfile,
} from '../types/gharmap';

interface SettingsScreenProps {
  language: Language;
  unit: UnitType;
  user: UserProfile;
  regionRates: AllRegionRates;
  onBack: () => void;
  onChangeLanguage: (lang: Language) => void;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateRegionRates: (region: GlobalRegionCode, rates: RegionalMaterialRates) => void;
  onResetAllRates: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  unit,
  user,
  regionRates,
  onBack,
  onChangeLanguage,
  onChangeUnit,
  onUpdateRegionRates,
  onResetAllRates,
  onUpdateUser,
  onSignOut,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedRegion, setSelectedRegion] = useState<GlobalRegionCode>('US');
  const [draftRates, setDraftRates] = useState<RegionalMaterialRates>(regionRates.US);
  const [companyName, setCompanyName] = useState(
    user.companyName || 'GharMap Studio & Associates',
  );

  const regConfig = getRegionConfig(selectedRegion);

  const handleRegionSelect = (code: GlobalRegionCode) => {
    setSelectedRegion(code);
    setDraftRates(regionRates[code]);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRegionRates(selectedRegion, draftRates);
    onShowToast(`Saved ${regConfig.countryName} material rates!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#112A1E]">{t.settings} &amp; Regional Rates</h1>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="min-h-[42px] px-4 rounded-2xl bg-white border border-[#DCE8E1] text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-[#0E9F5D]" />
                <span className="text-sm font-extrabold text-[#112A1E]">Language / زبان</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeLanguage('en')}
                  className={`min-h-[44px] rounded-xl text-sm font-bold ${
                    language === 'en' ? 'bg-[#0E9F5D] text-white' : 'bg-[#F4F8F5] text-[#405B4D]'
                  }`}
                >
                  English (Global)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('ur')}
                  className={`min-h-[44px] rounded-xl text-sm font-bold urdu-font ${
                    language === 'ur' ? 'bg-[#0E9F5D] text-white' : 'bg-[#F4F8F5] text-[#405B4D]'
                  }`}
                >
                  اردو (Urdu)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-[#0E9F5D]" />
                <span className="text-sm font-extrabold text-[#112A1E]">
                  Measurement Units
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    ['ft', 'Feet'],
                    ['m', 'Meters'],
                    ['sqft', 'Sq Ft'],
                    ['sqm', 'm²'],
                  ] as [UnitType, string][]
                ).map(([u, label]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => onChangeUnit(u)}
                    className={`min-h-[42px] rounded-xl text-xs font-bold ${
                      unit === u ? 'bg-[#0E9F5D] text-white' : 'bg-[#F4F8F5] text-[#405B4D]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-3xl p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#405B4D]">Access Tier</p>
              <p className="text-base font-extrabold text-[#112A1E] flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4 text-[#0E9F5D]" />
                100% Free Global Access
              </p>
              <p className="text-xs text-[#405B4D] mt-0.5">
                All blueprints, 3D Studio, Infra &amp; PDF exports unlocked.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0E9F5D]" />
              <h2 className="text-sm font-extrabold text-[#112A1E]">
                White-Label PDF Firm Name
              </h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Architecture / Developer Firm"
                className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateUser({ ...user, companyName: companyName.trim() });
                  onShowToast('Saved firm branding for PDF reports!');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-[#112A1E] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSaveRates}
          className="lg:col-span-7 bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-4 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0E9F5D]" />
              <div>
                <h2 className="text-base font-extrabold text-[#112A1E]">
                  Global Regional Material Rates Editor
                </h2>
                <p className="text-xs text-[#546E60]">
                  Customize unit prices for any country &amp; currency
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetAllRates();
                setDraftRates(DEFAULT_REGION_RATES[selectedRegion]);
                onShowToast('Reset all global rates to defaults');
              }}
              className="text-xs font-bold text-[#546E60] hover:text-[#0E9F5D] flex items-center gap-1 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {GLOBAL_REGIONS.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => handleRegionSelect(r.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedRegion === r.code
                    ? 'bg-[#0E9F5D] text-white'
                    : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                }`}
              >
                {r.code} ({r.currencyCode})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {(
              [
                ['cementPerBag', 'Cement / Bag'],
                ['brickPerPc', 'Brick / Pc'],
                ['steelPerKg', 'Steel / Kg'],
                ['sandPerCft', 'Sand / Cft'],
                ['bajriPerCft', 'Aggregate / Cft'],
                ['tilesPerSqFt', 'Tiles / Sq Ft'],
                ['paintPerSqFt', 'Paint / Sq Ft'],
                ['labourPerSqFt', 'Labour / Sq Ft'],
              ] as [keyof RegionalMaterialRates, string][]
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block font-semibold text-[#405B4D] mb-1">
                  {label} ({regConfig.currencyCode})
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={draftRates[field]}
                  onChange={(e) =>
                    setDraftRates((prev) => ({
                      ...prev,
                      [field]: Math.max(0.05, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold text-[#112A1E] tabular-nums"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save {regConfig.countryName} Rates</span>
          </button>
        </form>
      </div>
    </div>
  );
};
