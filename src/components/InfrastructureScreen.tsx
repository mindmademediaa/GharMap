import React from 'react';
import {
  ArrowLeft,
  HardHat,
  Layers,
  ShieldCheck,
  Ruler,
  Box,
  RotateCcw,
} from 'lucide-react';
import {
  InfrastructureConfig,
  Language,
  Project,
  SeismicZone,
  SoilType,
} from '../types/gharmap';
import {
  calculateInfrastructureSpecs,
  calculatePlotAreaSqFt,
  sqFtToSqM,
} from '../utils/calculations';

interface InfrastructureScreenProps {
  language: Language;
  project: Project;
  onBack: () => void;
  onUpdateInfrastructure: (infra: InfrastructureConfig) => void;
  onOpen2D: () => void;
  onOpen3D: () => void;
}

const SOILS: SoilType[] = ['Firm Clay / Loam', 'Sandy / Alluvial', 'Hard Rock', 'Soft / Reclaimed'];
const SEISMIC: SeismicZone[] = ['Low (Zone 1)', 'Moderate (Zone 2)', 'High (Zone 3-4)'];

export const InfrastructureScreen: React.FC<InfrastructureScreenProps> = ({
  project,
  onBack,
  onUpdateInfrastructure,
  onOpen2D,
  onOpen3D,
}) => {
  const infra = project.plot.infrastructure;
  const spec = calculateInfrastructureSpecs(project.plot);
  const areaSqFt = calculatePlotAreaSqFt(project.plot.sides);
  const areaSqM = sqFtToSqM(areaSqFt);

  const updateField = <K extends keyof InfrastructureConfig>(
    key: K,
    val: InfrastructureConfig[K],
  ) => {
    onUpdateInfrastructure({ ...infra, [key]: val });
  };

  const resetCustomOverrides = () => {
    onUpdateInfrastructure({
      ...infra,
      customColumnWidthIn: undefined,
      customColumnDepthIn: undefined,
      customWallThicknessIn: undefined,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            <h1 className="text-xl font-extrabold text-[#112A1E]">
              Infrastructure &amp; Structural Engineering
            </h1>
            <p className="text-xs text-[#546E60]">
              {project.name} · {areaSqFt.toLocaleString()} sq ft ({areaSqM} m²) · {project.plot.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen2D}
            className="min-h-[40px] px-3.5 rounded-xl bg-white border border-[#DCE8E1] text-xs font-bold text-[#112A1E] hover:border-[#0E9F5D]"
          >
            View Column Grid on 2D
          </button>
          <button
            type="button"
            onClick={onOpen3D}
            className="min-h-[40px] px-3.5 rounded-xl bg-[#0E9F5D] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Box className="w-4 h-4" />
            <span>View {infra.currentFloors}-Floor 3D</span>
          </button>
        </div>
      </div>

      {/* Engineering Recommendation Summary */}
      <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-2xl p-4 flex items-start gap-3">
        <HardHat className="w-5 h-5 text-[#0E9F5D] shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm font-semibold text-[#1D4E35]">
          {spec.engineeringSummary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Controls for Current Floors, Future Expansion, Soil, Seismic & Manual Overrides */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-[#112A1E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0E9F5D]" />
              <span>Load &amp; Future Expansion Planner</span>
            </h2>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Floors to Construct Now</span>
                <span className="text-[#0E9F5D] tabular-nums">{infra.currentFloors} Stories</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={infra.currentFloors}
                onChange={(e) => updateField('currentFloors', Number(e.target.value))}
                className="w-full accent-[#0E9F5D]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Future Upper Floors Planned (Foundation Reserve)</span>
                <span className="text-[#0E9F5D] tabular-nums">+{infra.plannedFutureFloors} Floors</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                value={infra.plannedFutureFloors}
                onChange={(e) => updateField('plannedFutureFloors', Number(e.target.value))}
                className="w-full accent-[#0E9F5D]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#405B4D] mb-1">Site Soil Condition</label>
                <select
                  value={infra.soilType}
                  onChange={(e) => updateField('soilType', e.target.value as SoilType)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold"
                >
                  {SOILS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#405B4D] mb-1">Seismic Zone</label>
                <select
                  value={infra.seismicZone}
                  onChange={(e) => updateField('seismicZone', e.target.value as SeismicZone)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold"
                >
                  {SEISMIC.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Manual Pillar & Wall Thickness Modifier */}
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#112A1E] flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#0E9F5D]" />
                <span>Modify Pillar &amp; Wall Thickness</span>
              </h3>
              <button
                type="button"
                onClick={resetCustomOverrides}
                className="text-xs font-bold text-[#0E9F5D] flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Auto AI</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block font-semibold text-[#405B4D] mb-1">Pillar Width (in)</label>
                <input
                  type="number"
                  min={9}
                  max={36}
                  step={3}
                  value={infra.customColumnWidthIn ?? spec.columnWidthIn}
                  onChange={(e) =>
                    updateField('customColumnWidthIn', Math.max(9, Number(e.target.value) || 9))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#405B4D] mb-1">Pillar Depth (in)</label>
                <input
                  type="number"
                  min={9}
                  max={42}
                  step={3}
                  value={infra.customColumnDepthIn ?? spec.columnDepthIn}
                  onChange={(e) =>
                    updateField('customColumnDepthIn', Math.max(9, Number(e.target.value) || 12))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#405B4D] mb-1">Outer Wall (in)</label>
                <input
                  type="number"
                  min={4.5}
                  max={18}
                  step={1.5}
                  value={infra.customWallThicknessIn ?? spec.exteriorWallIn}
                  onChange={(e) =>
                    updateField('customWallThicknessIn', Math.max(4.5, Number(e.target.value) || 9))
                  }
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cross-Section Pillar Diagram + Structural Specs Schedule */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#112A1E]">
                RCC Pillar &amp; Footing Cross-Section Blueprint
              </h2>
              <span className="text-xs font-bold text-[#0E9F5D] bg-[#E7F6EE] px-3 py-1 rounded-xl">
                {spec.totalPlannedStories} Total Stories Load
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* SVG Pillar + Footing Section */}
              <div className="bg-[#FAFDFB] border border-[#E2ECE6] rounded-2xl p-4 flex justify-center">
                <svg viewBox="0 0 220 220" className="w-56 h-56">
                  {/* Soil Line */}
                  <line x1="10" y1="120" x2="210" y2="120" stroke="#7A9486" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="15" y="114" fontSize="9" fill="#546E60" fontWeight="600">
                    Ground Level (GL)
                  </text>

                  {/* PCC Lean Concrete Bed */}
                  <rect x="35" y="185" width="150" height="10" fill="#B8C4BE" stroke="#112A1E" strokeWidth="1" />
                  {/* Footing Pad */}
                  <polygon points="45,185 175,185 160,162 60,162" fill="#DCE8E1" stroke="#112A1E" strokeWidth="1.5" />
                  {/* Column Neck & Shaft */}
                  <rect
                    x={110 - Math.min(28, spec.columnWidthIn)}
                    y="24"
                    width={Math.min(56, spec.columnWidthIn * 2)}
                    height="138"
                    fill="#E7F6EE"
                    stroke="#0E9F5D"
                    strokeWidth="2"
                  />
                  {/* Rebar Lines */}
                  <line
                    x1={110 - Math.min(22, spec.columnWidthIn * 0.7)}
                    y1="28"
                    x2={110 - Math.min(22, spec.columnWidthIn * 0.7)}
                    y2="178"
                    stroke="#112A1E"
                    strokeWidth="1.8"
                  />
                  <line
                    x1={110 + Math.min(22, spec.columnWidthIn * 0.7)}
                    y1="28"
                    x2={110 + Math.min(22, spec.columnWidthIn * 0.7)}
                    y2="178"
                    stroke="#112A1E"
                    strokeWidth="1.8"
                  />
                  {/* Labels */}
                  <text x="110" y="16" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0E9F5D">
                    Pillar: {spec.columnWidthIn}&quot; × {spec.columnDepthIn}&quot; ({Math.round(spec.columnWidthIn * 25.4)}×{Math.round(spec.columnDepthIn * 25.4)}mm)
                  </text>
                  <text x="110" y="210" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#112A1E">
                    Footing: {spec.footingSizeFt} · Depth {spec.footingDepthFt}&apos;
                  </text>
                </svg>
              </div>

              {/* Spec Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Column / Pillar Size</span>
                  <span className="font-extrabold text-[#112A1E] tabular-nums">
                    {spec.columnWidthIn}&quot; × {spec.columnDepthIn}&quot; ({Math.round(spec.columnWidthIn * 25.4)}×{Math.round(spec.columnDepthIn * 25.4)} mm)
                  </span>
                </div>
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Estimated Pillars</span>
                  <span className="font-extrabold text-[#112A1E] tabular-nums">
                    {spec.estimatedColumnsCount} cols (~{spec.columnGridSpacingFt}&apos; spacing)
                  </span>
                </div>
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Rebar &amp; Stirrups</span>
                  <span className="font-extrabold text-[#0E9F5D] text-right">{spec.rebarSpec}</span>
                </div>
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Foundation Type</span>
                  <span className="font-extrabold text-[#112A1E] text-right">{spec.footingType}</span>
                </div>
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Plinth / Roof Beam</span>
                  <span className="font-extrabold text-[#112A1E] tabular-nums">{spec.beamSizeIn}</span>
                </div>
                <div className="bg-[#F6F9F7] rounded-xl p-3 flex justify-between">
                  <span className="text-[#546E60] font-semibold">Slab &amp; Wall Thickness</span>
                  <span className="font-extrabold text-[#112A1E] tabular-nums">
                    Slab {spec.slabThicknessIn}&quot; · Ext {spec.exteriorWallIn}&quot; · Int {spec.partitionWallIn}&quot;
                  </span>
                </div>
                <div className="bg-[#E7F6EE] rounded-xl p-3 flex justify-between items-center">
                  <span className="text-[#1D4E35] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#0E9F5D]" />
                    Concrete / Steel Grade
                  </span>
                  <span className="font-extrabold text-[#0E9F5D] text-right">
                    {spec.concreteGrade} · {spec.steelGrade.split(' ')[0]} {spec.steelGrade.split(' ')[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
