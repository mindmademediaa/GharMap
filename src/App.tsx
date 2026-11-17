import React, { useCallback, useEffect, useState } from 'react';
import {
  Home,
  Map,
  Sparkles,
  Settings,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  DEFAULT_CITY_RATES,
  DEFAULT_CUSTOMIZATION,
  TRANSLATIONS,
} from './data/constants';
import {
  AllCityRates,
  AppScreen,
  CityMaterialRates,
  CityName,
  ClientLead,
  DesignStyle,
  DesignVariation,
  HouseCustomization,
  Language,
  PlanTier,
  PlotSpecs,
  Project,
  UnitType,
  UserProfile,
} from './types/gharmap';
import {
  loadCityRates,
  loadLanguage,
  loadLeads,
  loadPlan,
  loadProjects,
  loadUnit,
  loadUser,
  saveCityRates,
  saveLanguage,
  saveLeads,
  savePlan,
  saveProjects,
  saveUnit,
  saveUser,
} from './utils/storage';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { PlotDetailsScreen } from './components/PlotDetailsScreen';
import { FloorPlan2DScreen } from './components/FloorPlan2DScreen';
import { House3DViewScreen } from './components/House3DViewScreen';
import { MaterialCostingScreen } from './components/MaterialCostingScreen';
import { PricingPlansScreen } from './components/PricingPlansScreen';
import { MyProjectsScreen } from './components/MyProjectsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PrintReport } from './components/PrintReport';
import { Logo } from './components/Logo';

const DEFAULT_NEW_PLOT: PlotSpecs = {
  length: 45,
  width: 25,
  facing: 'North',
  city: 'Lahore',
  budget: 'Medium',
  counts: {
    rooms: 3,
    washrooms: 2,
    kitchen: 1,
    lounge: 1,
    baramda: 1,
    garage: 1,
    sehan: 1,
    store: 1,
    mumty: 1,
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [unit, setUnit] = useState<UnitType>(() => loadUnit());
  const [plan, setPlan] = useState<PlanTier>(() => loadPlan());
  const [user, setUser] = useState<UserProfile | null>(() => loadUser());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [cityRates, setCityRates] = useState<AllCityRates>(() => loadCityRates());
  const [leads, setLeads] = useState<ClientLead[]>(() => loadLeads());

  const [screen, setScreen] = useState<AppScreen>('splash');
  const [activeProjectId, setActiveProjectId] = useState<string>(
    () => projects[0]?.id || '',
  );
  const [editingPlotProjectId, setEditingPlotProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleToggleLanguage = () => {
    const next: Language = language === 'en' ? 'ur' : 'en';
    setLanguage(next);
    saveLanguage(next);
  };

  const handleSplashFinish = useCallback(() => {
    setScreen(user ? 'dashboard' : 'auth');
  }, [user]);

  const handleAuthenticated = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    saveUser(loggedUser);
    setScreen('dashboard');
    showToast(`Welcome, ${loggedUser.name}!`);
  };

  const handleSignOut = () => {
    setUser(null);
    saveUser(null);
    setScreen('auth');
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      saveProjects(next);
      return next;
    });
  };

  const handleCompleteGeneration = (
    projectName: string,
    plot: PlotSpecs,
    style: DesignStyle,
    variations: DesignVariation[],
    selectedVariationId: string,
  ) => {
    const today = new Date().toISOString().slice(0, 10);

    if (editingPlotProjectId) {
      const existing = projects.find((p) => p.id === editingPlotProjectId);
      if (existing) {
        const updated: Project = {
          ...existing,
          name: projectName,
          plot,
          style,
          variations,
          selectedVariationId,
          updatedAt: today,
        };
        handleUpdateProject(updated);
        setActiveProjectId(updated.id);
        setEditingPlotProjectId(null);
        setScreen('floor-plan');
        showToast('Updated floor plan with 3 AI variations!');
        return;
      }
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      createdAt: today,
      updatedAt: today,
      progress: 25,
      plot,
      style,
      variations,
      selectedVariationId,
      customization: { ...DEFAULT_CUSTOMIZATION },
    };

    setProjects((prev) => {
      const next = [newProj, ...prev];
      saveProjects(next);
      return next;
    });
    setActiveProjectId(newProj.id);
    setScreen('floor-plan');
    showToast('AI generated 3 floor plan designs!');
  };

  const handleOpenProject = (id: string, targetScreen: AppScreen = 'floor-plan') => {
    setActiveProjectId(id);
    setScreen(targetScreen);
  };

  const handleStartNewMap = () => {
    // Allow 1 custom free map beyond the 2 seeded showcase projects, or unlimited on Pro/Premium
    const customCount = projects.filter((p) => !p.id.startsWith('proj-lahore') && !p.id.startsWith('proj-peshawar')).length;
    if (plan === 'free' && customCount >= 1) {
      showToast('Free plan allows 1 custom project. Upgrade to Pro for up to 10!');
      setScreen('pricing');
      return;
    }
    setEditingPlotProjectId(null);
    setScreen('plot-details');
  };

  const handleDuplicateProject = (id: string) => {
    if (plan === 'free' && projects.length >= 3) {
      showToast('Upgrade to Pro to duplicate and save up to 10 projects.');
      setScreen('pricing');
      return;
    }
    if (plan === 'pro' && projects.length >= 10) {
      showToast('Pro plan supports up to 10 projects. Upgrade to Premium for unlimited!');
      setScreen('pricing');
      return;
    }
    const src = projects.find((p) => p.id === id);
    if (!src) return;
    const copy: Project = {
      ...src,
      id: `proj-${Date.now()}`,
      name: `${src.name} (Copy)`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setProjects((prev) => {
      const next = [copy, ...prev];
      saveProjects(next);
      return next;
    });
    showToast('Project duplicated!');
  };

  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      showToast('Keep at least 1 active project in your workspace.');
      return;
    }
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveProjects(next);
      if (activeProjectId === id && next[0]) {
        setActiveProjectId(next[0].id);
      }
      return next;
    });
    showToast('Project deleted');
  };

  const handleUpdateCityRates = (city: CityName, rates: CityMaterialRates) => {
    setCityRates((prev) => {
      const next = { ...prev, [city]: rates };
      saveCityRates(next);
      return next;
    });
  };

  const handleSelectPlan = (nextPlan: PlanTier) => {
    setPlan(nextPlan);
    savePlan(nextPlan);
    showToast(`Activated ${nextPlan.toUpperCase()} Plan!`);
    setScreen('dashboard');
  };

  const handleUnlockSingleMap = () => {
    if (activeProject) {
      handleUpdateProject({ ...activeProject, unlockedSingleMap: true });
    }
    showToast('Unlocked full 3D, all 5 styles & BOQ PDF for current map!');
    setScreen('floor-plan');
  };

  const handleExportPDF = () => {
    if (plan === 'free' && !activeProject?.unlockedSingleMap) {
      showToast('Upgrade to Pro or unlock Single Map (Rs 999) to export PDF.');
      setScreen('pricing');
      return;
    }
    window.print();
  };

  if (screen === 'splash') {
    return <SplashScreen language={language} onFinish={handleSplashFinish} />;
  }

  if (screen === 'auth' || !user) {
    return (
      <AuthScreen
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const t = TRANSLATIONS[language];
  const plotInitial =
    editingPlotProjectId && projects.find((p) => p.id === editingPlotProjectId)
      ? projects.find((p) => p.id === editingPlotProjectId)!.plot
      : DEFAULT_NEW_PLOT;
  const styleInitial =
    editingPlotProjectId && projects.find((p) => p.id === editingPlotProjectId)
      ? projects.find((p) => p.id === editingPlotProjectId)!.style
      : 'Pakistani';
  const nameInitial =
    editingPlotProjectId && projects.find((p) => p.id === editingPlotProjectId)
      ? projects.find((p) => p.id === editingPlotProjectId)!.name
      : '';

  return (
    <>
      <div className="no-print min-h-screen bg-[#F6F9F7] pb-24 lg:pb-12">
        {/* Desktop 3-Zone Top Bar (hidden on small mobile where bottom nav rules) */}
        <header className="hidden lg:flex items-center justify-between gap-8 max-w-6xl mx-auto px-6 py-4 border-b border-[#E2ECE6] bg-white/90 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <Logo size={34} />
            <span className="text-lg font-extrabold tracking-tight text-[#112A1E]">
              GharMap AI
            </span>
          </button>

          <nav className="flex items-center gap-6 text-sm font-semibold text-[#405B4D]">
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'dashboard' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              {t.home}
            </button>
            <button
              type="button"
              onClick={() => setScreen('floor-plan')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'floor-plan' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              2D Plan
            </button>
            <button
              type="button"
              onClick={() => setScreen('view-3d')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'view-3d' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              3D View
            </button>
            <button
              type="button"
              onClick={() => setScreen('costing')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'costing' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              Costing
            </button>
            <button
              type="button"
              onClick={() => setScreen('projects')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'projects' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              {t.myProjects}
            </button>
            <button
              type="button"
              onClick={() => setScreen('pricing')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'pricing' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              Pricing
            </button>
          </nav>

          <button
            type="button"
            onClick={handleStartNewMap}
            className="min-h-[42px] px-4 rounded-xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createNewMap}</span>
          </button>
        </header>

        {/* Main Responsive Container */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          {screen === 'dashboard' && (
            <DashboardScreen
              language={language}
              user={user}
              plan={plan}
              projects={projects}
              cityRates={cityRates}
              onNavigate={setScreen}
              onOpenProject={handleOpenProject}
              onStartNewMap={handleStartNewMap}
              onToggleLanguage={handleToggleLanguage}
            />
          )}

          {screen === 'plot-details' && (
            <PlotDetailsScreen
              language={language}
              plan={plan}
              initialPlot={plotInitial}
              initialStyle={styleInitial}
              initialProjectName={nameInitial}
              onBack={() => setScreen('dashboard')}
              onUpgradeRequest={() => setScreen('pricing')}
              onCompleteGeneration={handleCompleteGeneration}
            />
          )}

          {screen === 'floor-plan' && activeProject && (
            <FloorPlan2DScreen
              language={language}
              plan={plan}
              project={activeProject}
              onBack={() => setScreen('dashboard')}
              onSwitchTo3D={() => setScreen('view-3d')}
              onSwitchToCosting={() => setScreen('costing')}
              onUpdateProject={handleUpdateProject}
              onExportPDF={handleExportPDF}
              onUpgradeRequest={() => setScreen('pricing')}
              onShowToast={showToast}
            />
          )}

          {screen === 'view-3d' && activeProject && (
            <House3DViewScreen
              language={language}
              plan={plan}
              project={activeProject}
              onBack={() => setScreen('floor-plan')}
              onSwitchTo2D={() => setScreen('floor-plan')}
              onUpdateCustomization={(c: HouseCustomization) =>
                handleUpdateProject({
                  ...activeProject,
                  customization: c,
                  updatedAt: new Date().toISOString().slice(0, 10),
                })
              }
              onUpgradeRequest={() => setScreen('pricing')}
              onShowToast={showToast}
            />
          )}

          {screen === 'costing' && activeProject && (
            <MaterialCostingScreen
              language={language}
              plan={plan}
              project={activeProject}
              cityRates={cityRates}
              onBack={() => setScreen('dashboard')}
              onUpdateProjectCity={(city: CityName) =>
                handleUpdateProject({
                  ...activeProject,
                  plot: { ...activeProject.plot, city },
                })
              }
              onUpdateCityRates={handleUpdateCityRates}
              onExportPDF={handleExportPDF}
              onUpgradeRequest={() => setScreen('pricing')}
              onShowToast={showToast}
            />
          )}

          {screen === 'pricing' && (
            <PricingPlansScreen
              language={language}
              currentPlan={plan}
              onBack={() => setScreen('dashboard')}
              onSelectPlan={handleSelectPlan}
              onUnlockSingleMap={handleUnlockSingleMap}
            />
          )}

          {screen === 'projects' && (
            <MyProjectsScreen
              language={language}
              plan={plan}
              projects={projects}
              cityRates={cityRates}
              leads={leads}
              onBack={() => setScreen('dashboard')}
              onCreateNew={handleStartNewMap}
              onOpenProject={handleOpenProject}
              onEditProject={(id) => {
                setEditingPlotProjectId(id);
                setScreen('plot-details');
              }}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onUpdateProgress={(id, progress) => {
                const target = projects.find((p) => p.id === id);
                if (target) {
                  handleUpdateProject({ ...target, progress });
                }
              }}
              onAddLead={(lead) => {
                setLeads((prev) => {
                  const next = [lead, ...prev];
                  saveLeads(next);
                  return next;
                });
                showToast('Added client & contractor quote!');
              }}
              onUpgradeRequest={() => setScreen('pricing')}
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              language={language}
              unit={unit}
              plan={plan}
              user={user}
              cityRates={cityRates}
              onBack={() => setScreen('dashboard')}
              onChangeLanguage={(lang) => {
                setLanguage(lang);
                saveLanguage(lang);
              }}
              onChangeUnit={(u) => {
                setUnit(u);
                saveUnit(u);
              }}
              onUpdateCityRates={handleUpdateCityRates}
              onResetAllRates={() => {
                setCityRates(DEFAULT_CITY_RATES);
                saveCityRates(DEFAULT_CITY_RATES);
              }}
              onUpdateUser={(u) => {
                setUser(u);
                saveUser(u);
              }}
              onOpenPricing={() => setScreen('pricing')}
              onSignOut={handleSignOut}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar matching Screenshot 6 (Home, Maps, AI/3D, Settings) */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DCE8E1] h-16 px-2 grid grid-cols-4 items-center shadow-sm"
        >
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'dashboard' ? 'text-[#0E9F5D]' : 'text-[#627B6E]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">{t.home}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen('floor-plan')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'floor-plan' || screen === 'projects' || screen === 'plot-details'
                ? 'text-[#0E9F5D]'
                : 'text-[#627B6E]'
            }`}
          >
            <Map className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">{t.maps}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen('view-3d')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'view-3d' || screen === 'costing'
                ? 'text-[#0E9F5D]'
                : 'text-[#627B6E]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">{t.ai}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen('settings')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'settings' || screen === 'pricing'
                ? 'text-[#0E9F5D]'
                : 'text-[#627B6E]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] font-bold mt-0.5">{t.settings}</span>
          </button>
        </nav>

        {/* Non-blocking Toast Feedback */}
        {toast && (
          <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#112A1E] text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-[92vw]">
            <CheckCircle2 className="w-4 h-4 text-[#0E9F5D] shrink-0" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Print-Only PDF Architectural Blueprint & BOQ */}
      {activeProject && (
        <PrintReport
          project={activeProject}
          cityRates={cityRates}
          plan={plan}
          user={user}
        />
      )}
    </>
  );
}
