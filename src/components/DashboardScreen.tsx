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
  HardHat,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo';
import { TRANSLATIONS, getRegionConfig } from '../data/constants';
import {
  AllRegionRates,
  AppScreen,
  Language,
  Project,
  UserProfile,
} from '../types/gharmap';
import {
  calculateMaterialCosting,
  calculatePlotAreaSqFt,
  formatCompactCurrency,
} from '../utils/calculations';

interface DashboardScreenProps {
  language: Language;
  user: UserProfile;
  projects: Project[];
  regionRates: AllRegionRates;
  onNavigate: (screen: AppScreen) => void;
  onOpenProject: (projectId: string, targetScreen?: AppScreen) => void;
  onStartNewMap: () => void;
  onToggleLanguage: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  language,
  user,
  projects,
  regionRates,
  onNavigate,
  onOpenProject,
  onStartNewMap,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const recent = projects.slice(0, 3);
  const firstProj = projects[0];
  const primaryRegion = firstProj ? firstProj.plot.region : 'US';

  const totalPortfolioEst = projects.reduce((sum, p) => {
    const cost = calculateMaterialCosting(p.plot, regionRates[p.plot.region]);
    return sum + cost.grandTotal;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Top Brand Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size={42} variant="pin" />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-[#112A1E] truncate">
              {t.appName}
            </h1>
            <p className="text-xs text-[#546E60] truncate flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#0E9F5D]" />
              <span>Global Homes, Markets &amp; Infrastructure</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="min-h-[40px] px-3 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold hover:bg-[#D5EFE1] transition-colors"
          >
            {language === 'en' ? 'اردو' : 'EN'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            aria-label="Settings"
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
        <span className="self-start sm:self-center text-xs font-bold text-[#0E9F5D] bg-white px-3 py-1.5 rounded-xl border border-[#0E9F5D]/20 whitespace-nowrap">
          All Features Free &amp; Unlocked
        </span>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3.5">
          <h2 className="text-base font-bold text-[#112A1E]">{t.homeDashboard}</h2>

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

          <button
            type="button"
            onClick={() => onNavigate('infrastructure')}
            className="w-full text-left bg-white hover:border-[#0E9F5D] border border-[#DCE8E1] active:scale-[0.99] transition-all rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xs"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E7F6EE] flex items-center justify-center shrink-0">
              <HardHat className="w-7 h-7 text-[#0E9F5D]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-[#112A1E] leading-tight">
                Infrastructure &amp; Pillar Engineering
              </p>
              <p className="text-xs sm:text-sm text-[#546E60] mt-1">
                Column sizes, foundations, beams &amp; future floor load planning
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#7A9486] shrink-0" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate('costing')}
              className="w-full text-left bg-white hover:border-[#0E9F5D] border border-[#DCE8E1] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E7F6EE] flex items-center justify-center shrink-0">
                <Calculator className="w-6 h-6 text-[#0E9F5D]" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#112A1E]">{t.estimateCost}</p>
                <p className="text-xs text-[#546E60] truncate">{t.estimateCostSub}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('projects')}
              className="w-full text-left bg-white hover:border-[#0E9F5D] border border-[#DCE8E1] rounded-2xl p-4 flex items-center gap-3.5 shadow-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#E7F6EE] flex items-center justify-center shrink-0">
                <FolderOpen className="w-6 h-6 text-[#0E9F5D]" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#112A1E]">{t.myProjects}</p>
                <p className="text-xs text-[#546E60] truncate">{t.myProjectsSub}</p>
              </div>
            </button>
          </div>
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
              const areaSqFt = calculatePlotAreaSqFt(proj.plot.sides);
              const reg = getRegionConfig(proj.plot.region);
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
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#546E60] mt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0E9F5D] shrink-0" />
                        <span>
                          {proj.plot.category} · {areaSqFt.toLocaleString()} sq ft ·{' '}
                          {proj.plot.infrastructure.currentFloors}F · {reg.currencyCode}
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
                  {formatCompactCurrency(totalPortfolioEst, primaryRegion)}
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
