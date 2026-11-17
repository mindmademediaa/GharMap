import React, { useCallback, useEffect, useState } from 'react';
import {
  Home,
  Map,
  Box,
  HardHat,
  Settings,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_REGION_RATES,
  TRANSLATIONS,
} from './data/constants';
import {
  AllRegionRates,
  AppScreen,
  ClientLead,
  DesignStyle,
  DesignVariation,
  GlobalRegionCode,
  HouseCustomization,
  InfrastructureConfig,
  Language,
  PlotSpecs,
  Project,
  RegionalMaterialRates,
  UnitType,
  UserProfile,
} from './types/gharmap';
import {
  loadLanguage,
  loadLeads,
  loadProjects,
  loadRegionRates,
  loadUnit,
  loadUser,
  saveLanguage,
  saveLeads,
  saveProjects,
  saveRegionRates,
  saveUnit,
  saveUser,
} from './utils/storage';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { PlotDetailsScreen } from './components/PlotDetailsScreen';
import { FloorPlan2DScreen } from './components/FloorPlan2DScreen';
import { House3DViewScreen } from './components/House3DViewScreen';
import { InfrastructureScreen } from './components/InfrastructureScreen';
import { MaterialCostingScreen } from './components/MaterialCostingScreen';
import { PricingPlansScreen } from './components/PricingPlansScreen';
import { MyProjectsScreen } from './components/MyProjectsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PrintReport } from './components/PrintReport';
import { Logo } from './components/Logo';

const DEFAULT_NEW_PLOT: PlotSpecs = {
  sides: {
    frontWidth: 32,
    backWidth: 32,
    leftLength: 50,
    rightLength: 50,
  },
  isIrregular: false,
  facing: 'North',
  region: 'US',
  category: 'Residential Home',
  budget: 'Standard',
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
  infrastructure: {
    currentFloors: 2,
    plannedFutureFloors: 1,
    soilType: 'Firm Clay / Loam',
    seismicZone: 'Moderate (Zone 2)',
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [unit, setUnit] = useState<UnitType>(() => loadUnit());
  const [user, setUser] = useState<UserProfile | null>(() => loadUser());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [regionRates, setRegionRates] = useState<AllRegionRates>(() => loadRegionRates());
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
        showToast(`Updated blueprint with ${variations.length} layout designs!`);
        return;
      }
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      createdAt: today,
      updatedAt: today,
      progress: 30,
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
    showToast(`Generated ${variations.length} blueprint variations!`);
  };

  const handleOpenProject = (id: string, targetScreen: AppScreen = 'floor-plan') => {
    setActiveProjectId(id);
    setScreen(targetScreen);
  };

  const handleStartNewMap = () => {
    setEditingPlotProjectId(null);
    setScreen('plot-details');
  };

  const handleDuplicateProject = (id: string) => {
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

  const handleUpdateRegionRates = (
    region: GlobalRegionCode,
    rates: RegionalMaterialRates,
  ) => {
    setRegionRates((prev) => {
      const next = { ...prev, [region]: rates };
      saveRegionRates(next);
      return next;
    });
  };

  const handleExportPDF = () => {
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
  const editingProject = editingPlotProjectId
    ? projects.find((p) => p.id === editingPlotProjectId)
    : undefined;
  const plotInitial = editingProject ? editingProject.plot : DEFAULT_NEW_PLOT;
  const styleInitial = editingProject ? editingProject.style : 'Modern Contemporary';
  const nameInitial = editingProject ? editingProject.name : '';

  return (
    <>
      <div className="no-print min-h-screen bg-[#F6F9F7] pb-24 lg:pb-12">
        {/* Desktop Top Navigation */}
        <header className="hidden lg:flex items-center justify-between gap-6 max-w-6xl mx-auto px-6 py-4 border-b border-[#E2ECE6] bg-white/95 sticky top-0 z-30">
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

          <nav className="flex items-center gap-5 text-sm font-semibold text-[#405B4D]">
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
              2D Blueprint
            </button>
            <button
              type="button"
              onClick={() => setScreen('view-3d')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'view-3d' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              3D Studio
            </button>
            <button
              type="button"
              onClick={() => setScreen('infrastructure')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'infrastructure' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              Infrastructure
            </button>
            <button
              type="button"
              onClick={() => setScreen('costing')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'costing' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              Costing BOQ
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
              onClick={() => setScreen('settings')}
              className={`whitespace-nowrap shrink-0 hover:text-[#0E9F5D] ${
                screen === 'settings' ? 'text-[#0E9F5D] font-bold' : ''
              }`}
            >
              {t.settings}
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
              projects={projects}
              regionRates={regionRates}
              onNavigate={setScreen}
              onOpenProject={handleOpenProject}
              onStartNewMap={handleStartNewMap}
              onToggleLanguage={handleToggleLanguage}
            />
          )}

          {screen === 'plot-details' && (
            <PlotDetailsScreen
              language={language}
              initialPlot={plotInitial}
              initialStyle={styleInitial}
              initialProjectName={nameInitial}
              onBack={() => setScreen('dashboard')}
              onCompleteGeneration={handleCompleteGeneration}
            />
          )}

          {screen === 'floor-plan' && activeProject && (
            <FloorPlan2DScreen
              language={language}
              project={activeProject}
              onBack={() => setScreen('dashboard')}
              onSwitchTo3D={() => setScreen('view-3d')}
              onSwitchToCosting={() => setScreen('costing')}
              onSwitchToInfra={() => setScreen('infrastructure')}
              onUpdateProject={handleUpdateProject}
              onExportPDF={handleExportPDF}
              onShowToast={showToast}
            />
          )}

          {screen === 'view-3d' && activeProject && (
            <House3DViewScreen
              language={language}
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
              onShowToast={showToast}
            />
          )}

          {screen === 'infrastructure' && activeProject && (
            <InfrastructureScreen
              language={language}
              project={activeProject}
              onBack={() => setScreen('floor-plan')}
              onUpdateInfrastructure={(infra: InfrastructureConfig) => {
                handleUpdateProject({
                  ...activeProject,
                  plot: {
                    ...activeProject.plot,
                    infrastructure: infra,
                  },
                  updatedAt: new Date().toISOString().slice(0, 10),
                });
              }}
              onOpen2D={() => setScreen('floor-plan')}
              onOpen3D={() => setScreen('view-3d')}
            />
          )}

          {screen === 'costing' && activeProject && (
            <MaterialCostingScreen
              language={language}
              project={activeProject}
              regionRates={regionRates}
              onBack={() => setScreen('dashboard')}
              onUpdateProjectRegion={(region: GlobalRegionCode) =>
                handleUpdateProject({
                  ...activeProject,
                  plot: { ...activeProject.plot, region },
                })
              }
              onUpdateRegionRates={handleUpdateRegionRates}
              onExportPDF={handleExportPDF}
              onShowToast={showToast}
            />
          )}

          {screen === 'pricing' && (
            <PricingPlansScreen
              language={language}
              onBack={() => setScreen('dashboard')}
              onOpenNewMap={handleStartNewMap}
              onOpenInfra={() => setScreen('infrastructure')}
            />
          )}

          {screen === 'projects' && (
            <MyProjectsScreen
              language={language}
              projects={projects}
              regionRates={regionRates}
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
            />
          )}

          {screen === 'settings' && (
            <SettingsScreen
              language={language}
              unit={unit}
              user={user}
              regionRates={regionRates}
              onBack={() => setScreen('dashboard')}
              onChangeLanguage={(lang) => {
                setLanguage(lang);
                saveLanguage(lang);
              }}
              onChangeUnit={(u) => {
                setUnit(u);
                saveUnit(u);
              }}
              onUpdateRegionRates={handleUpdateRegionRates}
              onResetAllRates={() => {
                setRegionRates(DEFAULT_REGION_RATES);
                saveRegionRates(DEFAULT_REGION_RATES);
              }}
              onUpdateUser={(u) => {
                setUser(u);
                saveUser(u);
              }}
              onSignOut={handleSignOut}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DCE8E1] h-16 px-1 grid grid-cols-5 items-center shadow-sm"
        >
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'dashboard' ? 'text-[#0E9F5D]' : 'text-[#627B6E]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">{t.home}</span>
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
            <span className="text-[10px] font-bold mt-0.5">{t.maps}</span>
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
            <Box className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">{t.ai}</span>
          </button>

          <button
            type="button"
            onClick={() => setScreen('infrastructure')}
            className={`flex flex-col items-center justify-center min-h-[48px] ${
              screen === 'infrastructure' ? 'text-[#0E9F5D]' : 'text-[#627B6E]'
            }`}
          >
            <HardHat className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">{t.infra}</span>
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
            <span className="text-[10px] font-bold mt-0.5">{t.settings}</span>
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
          regionRates={regionRates}
          user={user}
        />
      )}
    </>
  );
}
