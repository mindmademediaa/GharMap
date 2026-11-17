import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Pencil,
  Box,
  Calculator,
  Calendar,
  MapPin,
  Users,
  HardHat,
} from 'lucide-react';
import { PROJECT_CATEGORIES, TRANSLATIONS, getRegionConfig } from '../data/constants';
import {
  AllRegionRates,
  AppScreen,
  ClientLead,
  Language,
  Project,
  ProjectCategory,
} from '../types/gharmap';
import {
  calculateMaterialCosting,
  calculatePlotAreaSqFt,
  formatCompactCurrency,
} from '../utils/calculations';

interface MyProjectsScreenProps {
  language: Language;
  projects: Project[];
  regionRates: AllRegionRates;
  leads: ClientLead[];
  onBack: () => void;
  onCreateNew: () => void;
  onOpenProject: (id: string, screen: AppScreen) => void;
  onEditProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onAddLead: (lead: ClientLead) => void;
}

export const MyProjectsScreen: React.FC<MyProjectsScreenProps> = ({
  language,
  projects,
  regionRates,
  leads,
  onBack,
  onCreateNew,
  onOpenProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onUpdateProgress,
  onAddLead,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects');
  const [newClientName, setNewClientName] = useState('');
  const [newLocation, setNewLocation] = useState('London, UK');
  const [newType, setNewType] = useState<ProjectCategory>('Commercial Market');
  const [newClientSize, setNewClientSize] = useState('40×60 ft (2,400 sq ft)');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddLead({
      id: `lead-${Date.now()}`,
      clientName: newClientName.trim(),
      location: newLocation.trim() || 'Global',
      projectType: newType,
      plotSize: newClientSize,
      status: 'Proposal Sent',
      quotedAmount: 185000,
      currencyCode: 'USD',
    });
    setNewClientName('');
  };

  return (
    <div className="space-y-5">
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
          <div>
            <h1 className="text-xl font-extrabold text-[#112A1E]">{t.myProjects}</h1>
            <p className="text-xs text-[#546E60]">
              {projects.length} saved · Unlimited projects unlocked free
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="min-h-[44px] px-4 rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Map</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#E7F0EB] rounded-2xl max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-colors ${
            activeTab === 'projects'
              ? 'bg-white text-[#112A1E] shadow-xs'
              : 'text-[#405B4D]'
          }`}
        >
          Saved Blueprints ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`min-h-[40px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'clients'
              ? 'bg-white text-[#112A1E] shadow-xs'
              : 'text-[#405B4D]'
          }`}
        >
          <Users className="w-4 h-4 text-[#0E9F5D]" />
          <span>Client Projects</span>
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const areaSqFt = calculatePlotAreaSqFt(proj.plot.sides);
            const cost = calculateMaterialCosting(proj.plot, regionRates[proj.plot.region]);
            const reg = getRegionConfig(proj.plot.region);

            return (
              <div
                key={proj.id}
                className="bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-[#112A1E] truncate">
                        {proj.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#546E60] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0E9F5D]" />
                          {proj.plot.category}
                        </span>
                        <span>·</span>
                        <span>
                          {areaSqFt.toLocaleString()} sq ft · {proj.plot.infrastructure.currentFloors}F · {reg.currencyCode}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#0E9F5D] bg-[#E7F6EE] px-2.5 py-1 rounded-xl tabular-nums shrink-0">
                      {formatCompactCurrency(cost.grandTotal, proj.plot.region)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#405B4D] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#0E9F5D]" />
                        Updated {proj.updatedAt}
                      </span>
                      <span className="font-bold text-[#112A1E] tabular-nums">
                        {proj.progress}% Complete
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={proj.progress}
                      onChange={(e) => onUpdateProgress(proj.id, Number(e.target.value))}
                      aria-label={`Progress for ${proj.name}`}
                      className="w-full accent-[#0E9F5D] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EDF3EF] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id, 'floor-plan')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#0E9F5D] text-white text-xs font-bold hover:bg-[#0A7D49]"
                    >
                      2D Map
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id, 'view-3d')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold flex items-center gap-1 hover:bg-[#D5EFE1]"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>3D</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id, 'infrastructure')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#F4F8F5] text-[#112A1E] text-xs font-bold flex items-center gap-1 hover:bg-[#E7F6EE]"
                    >
                      <HardHat className="w-3.5 h-3.5 text-[#0E9F5D]" />
                      <span>Infra</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProject(proj.id, 'costing')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#F4F8F5] text-[#112A1E] text-xs font-bold flex items-center gap-1 hover:bg-[#E7F6EE]"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#0E9F5D]" />
                      <span>BOQ</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditProject(proj.id)}
                      aria-label="Edit Project"
                      className="w-9 h-9 rounded-xl bg-[#F4F8F5] hover:bg-[#E7F6EE] text-[#405B4D] flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj.id)}
                      aria-label="Duplicate Project"
                      className="w-9 h-9 rounded-xl bg-[#F4F8F5] hover:bg-[#E7F6EE] text-[#405B4D] flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      aria-label="Delete Project"
                      className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-base font-extrabold text-[#112A1E]">
              Developer Client Portfolio &amp; Proposals
            </h2>
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white border border-[#DCE8E1] rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#112A1E]">{lead.clientName}</p>
                  <p className="text-xs text-[#546E60] mt-0.5">
                    {lead.location} · {lead.projectType} · {lead.plotSize} · {lead.status}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-[#0E9F5D] tabular-nums">
                  {lead.currencyCode} {lead.quotedAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateLead}
            className="lg:col-span-5 bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-3"
          >
            <h3 className="text-base font-extrabold text-[#112A1E]">Add Client Project</h3>
            <input
              type="text"
              placeholder="Client / Developer Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="City, Country"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ProjectCategory)}
                className="min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-xs font-semibold"
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={newClientSize}
              onChange={(e) => setNewClientSize(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
            />
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-[#0E9F5D] text-white font-bold text-sm"
            >
              Add Client &amp; Quote
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
