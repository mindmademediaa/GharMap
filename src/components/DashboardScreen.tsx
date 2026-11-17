import React from 'react';
import {
  MapPin,
  Calculator,
  FolderOpen,
  Calendar,
  TrendingUp,
  Banknote,
  ArrowRight,
  User,
  Crown,
} from 'lucide-react';
import { Logo } from './Logo';
import { TRANSLATIONS } from '../data/constants';
import {
  AllCityRates,
  AppScreen,
  Language,
  PlanTier,
  Project,
  UserProfile,
} from '../types/gharmap';
import { calculateMaterialCosting, formatCompactPKR } from '../utils/calculations';

interface DashboardScreenProps {
  language: Language;
  user: UserProfile;
  plan: PlanTier;
  projects: Project[];
  cityRates: AllCityRates;
  onNavigate: (screen: AppScreen) => void;
  onOpenProject: (projectId: string, targetScreen?: AppScreen) => void;
  onStartNewMap: () => void;
  onToggleLanguage: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  language,
  user,
  plan,
  projects,
  cityRates,
  onNavigate,
  onOpenProject,
  onStartNewMap,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const recent = projects.slice(0, 2);

  const totalEstCost = projects.reduce((sum, p) => {
    const cost = calculateMaterialCosting(p.plot, cityRates[p.plot.city]);
    return sum + cost.grandTotal;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={42} variant="pin" />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#112A1E] truncate">
              {t.appName}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[40px] px-3 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold hover:bg-[#D5EFE1] transition-colors"
            title="Switch English / Urdu"
          >
            {language === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className="min-h-[40px] px-3 rounded-xl bg-white border border-[#DCE8E1] text-xs font-bold text-[#112A1E] hover:border-[#0E9F5D] flex items-center gap-1.5 transition-colors"
          >
            <Crown className="w-3.5 h-3.5 text-[#0E9F5D]" />
            <span className="capitalize">{plan}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            aria-label="Account Settings"
            className="w-11 h-11 rounded-full bg-white border border-[#0E9F5D]/40 flex items-center justify-center text-[#0E9F5D] hover:bg-[#E7F6EE] transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Greeting Banner */}
      <div className="bg-[#E7F6EE] rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-[#112A1E]">
            {t.goodMorning} {user.name.split(' ')[0]}
          </p>
          <p className="text-sm text-[#456252]">{t.readyPrompt}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('pricing')}
          className="self-start sm:self-center text-xs font-semibold text-[#0E9F5D] hover:underline whitespace-nowrap"
        >
          {plan === 'free' ? 'Upgrade to Pro →' : `${plan.toUpperCase()} Member`}
        </button>
      </div>

      {/* Main Dashboard Grid: Actions + Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Primary Action Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          <h2 className="text-base font-bold text-[#112A1E] text-center lg:text-left">
            {t.homeDashboard}
          </h2>

          {/* Create New Map - Primary Solid Green Card */}
          <button
            type="button"
            onClick={onStartNewMap}
            className="w-full text-left bg-[#0E9F5D] hover:bg-[#0A7D49] active:scale-[0.99] transition-all rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0">
              <MapPin className="w-7 h-7 text-[#0E9F5D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-extrabold text-white leading-tight">{t.createNewMap}</p>
              <p className="text-xs sm:text-sm text-white/90 mt-1">{t.createNewMapSub}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-white/90 shrink-0" />
          </button>

          {/* Estimate Cost */}
          <button
            type="button"
            onClick={() => onNavigate('costing')}
            className="w-full text-left bg-white hover:border-[#0E9F5D] border border-[#DCE8E1] active:scale-[0.99] transition-all rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E7F6EE] flex items-center justify-center shrink-0">
              <Calculator className="w-7 h-7 text-[#0E9F5D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-[#112A1E] leading-tight">{t.estimateCost}</p>
              <p className="text-xs sm:text-sm text-[#546E60] mt-1">{t.estimateCostSub}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#7A9486] shrink-0" />
          </button>

          {/* My Projects */}
          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="w-full text-left bg-white hover:border-[#0E9F5D] border border-[#DCE8E1] active:scale-[0.99] transition-all rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E7F6EE] flex items-center justify-center shrink-0">
              <FolderOpen className="w-7 h-7 text-[#0E9F5D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-[#112A1E] leading-tight">{t.myProjects}</p>
              <p className="text-xs sm:text-sm text-[#546E60] mt-1">{t.myProjectsSub}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#7A9486] shrink-0" />
          </button>
        </div>

        {/* Right column: Recent Projects + Summary KPIs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#112A1E]">{t.recentProjects}</h2>
            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="text-sm font-semibold text-[#0E9F5D] hover:underline min-h-[36px] flex items-center gap-1"
            >
              <span>{t.seeAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recent.map((proj) => {
              const marla = ((proj.plot.length * proj.plot.width) / 225).toFixed(1);
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onOpenProject(proj.id, 'floor-plan')}
                  className="w-full text-left bg-white border border-[#DCE8E1] hover:border-[#0E9F5D] rounded-2xl p-4 shadow-xs transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-[#112A1E] truncate">
                        {proj.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#546E60] mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0E9F5D] shrink-0" />
                        <span>
                          {proj.plot.city} · {marla} Marla · {proj.progress}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#E7F6EE] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0E9F5D] rounded-full transition-all"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#112A1E] tabular-nums">
                      {proj.progress}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 2-Card Summary KPIs matching screenshot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#E7F6EE] rounded-2xl p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#0E9F5D] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#112A1E] tabular-nums truncate">
                  {projects.length} {t.activeProjects}
                </p>
                <p className="text-xs text-[#546E60]">{t.ongoing}</p>
              </div>
            </div>
            <div className="bg-[#E7F6EE] rounded-2xl p-4 flex items-center gap-3">
              <Banknote className="w-6 h-6 text-[#0E9F5D] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#112A1E] tabular-nums truncate">
                  {formatCompactPKR(totalEstCost)}
                </p>
                <p className="text-xs text-[#546E60]">{t.estCost}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
