import React, { useState } from 'react';
import {
  ArrowLeft,
  Globe,
  Ruler,
  Sliders,
  Crown,
  LogOut,
  Check,
  RotateCcw,
  Building2,
} from 'lucide-react';
import { CITIES, DEFAULT_CITY_RATES, TRANSLATIONS } from '../data/constants';
import {
  AllCityRates,
  CityMaterialRates,
  CityName,
  Language,
  PlanTier,
  UnitType,
  UserProfile,
} from '../types/gharmap';

interface SettingsScreenProps {
  language: Language;
  unit: UnitType;
  plan: PlanTier;
  user: UserProfile;
  cityRates: AllCityRates;
  onBack: () => void;
  onChangeLanguage: (lang: Language) => void;
  onChangeUnit: (unit: UnitType) => void;
  onUpdateCityRates: (city: CityName, rates: CityMaterialRates) => void;
  onResetAllRates: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onOpenPricing: () => void;
  onSignOut: () => void;
  onShowToast: (msg: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  unit,
  plan,
  user,
  cityRates,
  onBack,
  onChangeLanguage,
  onChangeUnit,
  onUpdateCityRates,
  onResetAllRates,
  onUpdateUser,
  onOpenPricing,
  onSignOut,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCity, setSelectedCity] = useState<CityName>('Lahore');
  const [draftRates, setDraftRates] = useState<CityMaterialRates>(cityRates.Lahore);
  const [companyName, setCompanyName] = useState(user.companyName || 'Al-Noor Builders');

  const handleCitySelect = (city: CityName) => {
    setSelectedCity(city);
    setDraftRates(cityRates[city]);
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCityRates(selectedCity, draftRates);
    onShowToast(`Admin Panel: Saved ${selectedCity} PKR material rates!`);
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
          <h1 className="text-xl font-extrabold text-[#112A1E]">{t.settings} & Admin Panel</h1>
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
        {/* Left: Language, Units, Plan & White-label */}
        <div className="lg:col-span-5 space-y-4">
          {/* Language & Units */}
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-[#0E9F5D]" />
                <span className="text-sm font-extrabold text-[#112A1E]">
                  Language / زبان
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onChangeLanguage('en')}
                  className={`min-h-[44px] rounded-xl text-sm font-bold ${
                    language === 'en'
                      ? 'bg-[#0E9F5D] text-white'
                      : 'bg-[#F4F8F5] text-[#405B4D]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('ur')}
                  className={`min-h-[44px] rounded-xl text-sm font-bold urdu-font ${
                    language === 'ur'
                      ? 'bg-[#0E9F5D] text-white'
                      : 'bg-[#F4F8F5] text-[#405B4D]'
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
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['ft', 'Feet (ft)'],
                    ['marla', 'Marla'],
                    ['sqft', 'Sq Ft'],
                  ] as [UnitType, string][]
                ).map(([u, label]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => onChangeUnit(u)}
                    className={`min-h-[42px] rounded-xl text-xs font-bold ${
                      unit === u
                        ? 'bg-[#0E9F5D] text-white'
                        : 'bg-[#F4F8F5] text-[#405B4D]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-3xl p-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#405B4D]">Active Subscription</p>
              <p className="text-lg font-extrabold text-[#112A1E] capitalize flex items-center gap-1.5 mt-0.5">
                <Crown className="w-5 h-5 text-[#0E9F5D]" />
                {plan} Plan
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPricing}
              className="min-h-[44px] px-4 rounded-2xl bg-[#0E9F5D] text-white text-xs font-bold"
            >
              Manage Plan
            </button>
          </div>

          {/* White-Label PDF Branding (Premium) */}
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0E9F5D]" />
                <h2 className="text-sm font-extrabold text-[#112A1E]">
                  White-Label PDF Company Name
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#0E9F5D]">Premium</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your Construction Firm Name"
                className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  onUpdateUser({ ...user, companyName: companyName.trim() });
                  onShowToast('Saved company branding for White-Label PDFs!');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-[#112A1E] text-white text-xs font-bold"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right: Admin Panel — Editable City Material Rates */}
        <form
          onSubmit={handleSaveRates}
          className="lg:col-span-7 bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-4 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0E9F5D]" />
              <div>
                <h2 className="text-base font-extrabold text-[#112A1E]">
                  Admin Panel · City Material Rates (PKR)
                </h2>
                <p className="text-xs text-[#546E60]">
                  Customize cement, bricks, steel, sand, bajri & labour rates per city
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetAllRates();
                setDraftRates(DEFAULT_CITY_RATES[selectedCity]);
                onShowToast('Reset all city rates to Pakistan market defaults');
              }}
              className="text-xs font-bold text-[#546E60] hover:text-[#0E9F5D] flex items-center gap-1 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedCity === city
                    ? 'bg-[#0E9F5D] text-white'
                    : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {(
              [
                ['cementPerBag', 'Cement (PKR/Bag)'],
                ['brickPerPc', 'Brick (PKR/Pc)'],
                ['steelPerKg', 'Steel (PKR/Kg)'],
                ['sandPerCft', 'Sand (PKR/Cft)'],
                ['bajriPerCft', 'Bajri (PKR/Cft)'],
                ['tilesPerSqFt', 'Tiles (PKR/SqFt)'],
                ['paintPerSqFt', 'Paint (PKR/SqFt)'],
                ['labourPerSqFt', 'Labour (PKR/SqFt)'],
              ] as [keyof CityMaterialRates, string][]
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block font-semibold text-[#405B4D] mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={draftRates[field]}
                  onChange={(e) =>
                    setDraftRates((prev) => ({
                      ...prev,
                      [field]: Math.max(1, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold text-[#112A1E] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save {selectedCity} Rates</span>
          </button>
        </form>
      </div>
    </div>
  );
};
