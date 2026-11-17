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
  Lock,
  Building2,
} from 'lucide-react';
import { CITIES, TRANSLATIONS } from '../data/constants';
import {
  AllCityRates,
  AppScreen,
  CityName,
  ClientLead,
  Language,
  PlanTier,
  Project,
} from '../types/gharmap';
import {
  MARLA_SQFT,
  calculateMaterialCosting,
  formatCompactPKR,
  formatPKR,
} from '../utils/calculations';

interface MyProjectsScreenProps {
  language: Language;
  plan: PlanTier;
  projects: Project[];
  cityRates: AllCityRates;
  leads: ClientLead[];
  onBack: () => void;
  onCreateNew: () => void;
  onOpenProject: (id: string, screen: AppScreen) => void;
  onEditProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onAddLead: (lead: ClientLead) => void;
  onUpgradeRequest: () => void;
}

export const MyProjectsScreen: React.FC<MyProjectsScreenProps> = ({
  language,
  plan,
  projects,
  cityRates,
  leads,
  onBack,
  onCreateNew,
  onOpenProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onUpdateProgress,
  onAddLead,
  onUpgradeRequest,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'projects' | 'clients'>('projects');
  const [newClientName, setNewClientName] = useState('');
  const [newClientCity, setNewClientCity] = useState<CityName>('Lahore');
  const [newClientSize, setNewClientSize] = useState('5 Marla (25×45 ft)');

  const maxProjects = plan === 'free' ? 1 : plan === 'pro' ? 10 : Infinity;

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    onAddLead({
      id: `lead-${Date.now()}`,
      clientName: newClientName.trim(),
      city: newClientCity,
      plotSize: newClientSize,
      status: 'Proposal Sent',
      quotedPkr: 3650000,
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
              {projects.length} saved · Plan limit:{' '}
              {maxProjects === Infinity ? 'Unlimited' : maxProjects}
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

      {/* Saved Projects / Premium Client Management Switcher */}
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
          Saved Maps ({projects.length})
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
          <span>Clients & Quotes</span>
          {plan !== 'premium' && <Lock className="w-3 h-3 text-[#0E9F5D]" />}
        </button>
      </div>

      {activeTab === 'projects' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const totalSqFt = proj.plot.length * proj.plot.width;
            const marla = (totalSqFt / MARLA_SQFT).toFixed(1);
            const cost = calculateMaterialCosting(
              proj.plot,
              cityRates[proj.plot.city],
            );

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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#546E60] mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#0E9F5D]" />
                          {proj.plot.city}
                        </span>
                        <span>·</span>
                        <span>
                          {proj.plot.width}&apos;×{proj.plot.length}&apos; ({marla} Marla)
                        </span>
                        <span>·</span>
                        <span>{proj.style}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#0E9F5D] bg-[#E7F6EE] px-2.5 py-1 rounded-xl tabular-nums shrink-0">
                      {formatCompactPKR(cost.grandTotal)}
                    </span>
                  </div>

                  {/* Interactive Construction Progress Slider */}
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
                      onChange={(e) =>
                        onUpdateProgress(proj.id, Number(e.target.value))
                      }
                      aria-label={`Progress for ${proj.name}`}
                      className="w-full accent-[#0E9F5D] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Action Row: Open 2D, 3D, Cost, Edit, Duplicate, Delete */}
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
                      onClick={() => onOpenProject(proj.id, 'costing')}
                      className="min-h-[38px] px-3 rounded-xl bg-[#F4F8F5] text-[#112A1E] text-xs font-bold flex items-center gap-1 hover:bg-[#E7F6EE]"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#0E9F5D]" />
                      <span>Cost</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditProject(proj.id)}
                      aria-label="Edit Project"
                      title="Edit Plot & Rooms"
                      className="w-9 h-9 rounded-xl bg-[#F4F8F5] hover:bg-[#E7F6EE] text-[#405B4D] flex items-center justify-center"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateProject(proj.id)}
                      aria-label="Duplicate Project"
                      title="Duplicate Project"
                      className="w-9 h-9 rounded-xl bg-[#F4F8F5] hover:bg-[#E7F6EE] text-[#405B4D] flex items-center justify-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      aria-label="Delete Project"
                      title="Delete Project"
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
      ) : plan !== 'premium' ? (
        <div className="bg-white border border-[#DCE8E1] rounded-3xl p-8 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E7F6EE] text-[#0E9F5D] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-[#112A1E]">
            Builder & Contractor Client Dashboard
          </h2>
          <p className="text-sm text-[#546E60]">
            Manage client proposals, live contractor material quotes, structural & MEP layouts, and white-label PDFs with your company logo on the Premium Plan.
          </p>
          <button
            type="button"
            onClick={onUpgradeRequest}
            className="min-h-[48px] px-6 rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm"
          >
            Upgrade to Premium · Rs 2,999/mo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-base font-extrabold text-[#112A1E]">
              Active Client Proposals & Contractor Quotes
            </h2>
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white border border-[#DCE8E1] rounded-2xl p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#112A1E]">{lead.clientName}</p>
                  <p className="text-xs text-[#546E60] mt-0.5">
                    {lead.city} · {lead.plotSize} · {lead.status}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-[#0E9F5D] tabular-nums">
                  {formatPKR(lead.quotedPkr)}
                </span>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateLead}
            className="lg:col-span-5 bg-white border border-[#DCE8E1] rounded-3xl p-5 space-y-3"
          >
            <h3 className="text-base font-extrabold text-[#112A1E]">Add New Client</h3>
            <input
              type="text"
              placeholder="Client Name (e.g. Tariq Builders)"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newClientCity}
                onChange={(e) => setNewClientCity(e.target.value as CityName)}
                className="min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-semibold"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newClientSize}
                onChange={(e) => setNewClientSize(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[46px] rounded-2xl bg-[#0E9F5D] text-white font-bold text-sm"
            >
              Add Client & Generate Quote
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
