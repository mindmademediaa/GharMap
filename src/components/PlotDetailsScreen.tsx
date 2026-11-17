import React, { useState } from 'react';
import {
  ArrowLeft,
  Ruler,
  Home,
  Minus,
  Plus,
  Sparkles,
  Check,
  Globe,
  Compass,
  Wallet,
  Building2,
  HardHat,
  RefreshCw,
} from 'lucide-react';
import {
  DESIGN_STYLES,
  GLOBAL_REGIONS,
  PROJECT_CATEGORIES,
  TRANSLATIONS,
} from '../data/constants';
import {
  BudgetTier,
  DesignStyle,
  DesignVariation,
  GlobalRegionCode,
  Language,
  PlotFacing,
  PlotSpecs,
  ProjectCategory,
  RoomCounts,
  SeismicZone,
  SoilType,
} from '../types/gharmap';
import {
  calculateInfrastructureSpecs,
  calculatePlotAreaSqFt,
  generateDesignVariations,
  sqFtToSqM,
} from '../utils/calculations';
import { Logo } from './Logo';

interface PlotDetailsScreenProps {
  language: Language;
  initialPlot: PlotSpecs;
  initialStyle: DesignStyle;
  initialProjectName: string;
  onBack: () => void;
  onCompleteGeneration: (
    projectName: string,
    plot: PlotSpecs,
    style: DesignStyle,
    variations: DesignVariation[],
    selectedVariationId: string,
  ) => void;
}

const PRESET_PLOTS = [
  { label: 'Compact (25×45)', front: 25, back: 25, left: 45, right: 45 },
  { label: 'Irregular Lot', front: 34, back: 28, left: 52, right: 46 },
  { label: 'Commercial Bay', front: 45, back: 45, left: 65, right: 65 },
  { label: 'Corner Plaza', front: 58, back: 50, left: 82, right: 74 },
];

const FACINGS: PlotFacing[] = ['North', 'South', 'East', 'West'];
const BUDGETS: BudgetTier[] = ['Economy', 'Standard', 'Luxury'];
const SOILS: SoilType[] = ['Firm Clay / Loam', 'Sandy / Alluvial', 'Hard Rock', 'Soft / Reclaimed'];
const SEISMIC: SeismicZone[] = ['Low (Zone 1)', 'Moderate (Zone 2)', 'High (Zone 3-4)'];

export const PlotDetailsScreen: React.FC<PlotDetailsScreenProps> = ({
  language,
  initialPlot,
  initialStyle,
  initialProjectName,
  onBack,
  onCompleteGeneration,
}) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [projectName, setProjectName] = useState(initialProjectName);
  const [plot, setPlot] = useState<PlotSpecs>(initialPlot);
  const [style, setStyle] = useState<DesignStyle>(initialStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [variations, setVariations] = useState<DesignVariation[]>([]);
  const [selectedVarId, setSelectedVarId] = useState('var-1');
  const [batchOffset, setBatchOffset] = useState(0);

  const areaSqFt = calculatePlotAreaSqFt(plot.sides);
  const areaSqM = sqFtToSqM(areaSqFt);
  const infraPreview = calculateInfrastructureSpecs(plot);

  const isCommercial =
    plot.category === 'Commercial Market' ||
    plot.category === 'Multi-Story Building' ||
    plot.category === 'Mixed-Use Infrastructure' ||
    plot.category === 'Warehouse / Industrial';

  const updateSide = (key: keyof PlotSpecs['sides'], val: number) => {
    const clean = Math.max(10, Math.min(400, val || 10));
    setPlot((prev) => {
      if (!prev.isIrregular) {
        if (key === 'frontWidth' || key === 'backWidth') {
          return {
            ...prev,
            sides: { ...prev.sides, frontWidth: clean, backWidth: clean },
          };
        }
        return {
          ...prev,
          sides: { ...prev.sides, leftLength: clean, rightLength: clean },
        };
      }
      return {
        ...prev,
        sides: { ...prev.sides, [key]: clean },
      };
    });
  };

  const updateCount = (key: keyof RoomCounts, delta: number, max = 20) => {
    setPlot((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [key]: Math.max(0, Math.min(max, prev.counts[key] + delta)),
      },
    }));
  };

  const toggleCount = (key: keyof RoomCounts) => {
    setPlot((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [key]: prev.counts[key] > 0 ? 0 : 1,
      },
    }));
  };

  const handleStartGeneration = (chosenStyle: DesignStyle) => {
    setStep(2);
    setIsGenerating(true);
    setGenProgress(10);

    const startTime = Date.now();
    const duration = 2200;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(98, Math.round((elapsed / duration) * 100));
      setGenProgress(pct);
    }, 60);

    window.setTimeout(() => {
      window.clearInterval(interval);
      setGenProgress(100);
      const generated = generateDesignVariations(plot, chosenStyle, 0);
      setVariations(generated);
      setSelectedVarId(generated[0].id);
      setBatchOffset(0);
      setIsGenerating(false);
      setStep(3);
    }, duration);
  };

  const handleGenerateMoreVariations = () => {
    const nextOffset = batchOffset + 8;
    const more = generateDesignVariations(plot, style, nextOffset);
    setVariations((prev) => [...prev, ...more]);
    setBatchOffset(nextOffset);
  };

  const counterItems: {
    key: keyof RoomCounts;
    label: string;
    isToggle?: boolean;
    sub?: string;
  }[] = [
    {
      key: 'rooms',
      label: isCommercial ? 'Shops / Offices / Units' : 'Bedrooms / Suites',
    },
    {
      key: 'washrooms',
      label: isCommercial ? 'Restrooms / WC' : 'Washrooms / Baths',
    },
    {
      key: 'kitchen',
      label: isCommercial ? 'Pantry / Cafe Bay' : 'Kitchen',
    },
    {
      key: 'lounge',
      label: isCommercial ? 'Main Lobby / Hall' : 'Living Lounge',
      isToggle: true,
    },
    {
      key: 'baramda',
      label: isCommercial ? 'Front Arcade / Corridor' : 'Veranda / Porch',
      isToggle: true,
    },
    {
      key: 'garage',
      label: isCommercial ? 'Parking / Loading Bays' : 'Car Garage',
    },
    {
      key: 'sehan',
      label: isCommercial ? 'Open Atrium / Courtyard' : 'Courtyard / Garden',
      isToggle: true,
      sub: 'Open-to-sky ventilation & daylight zone',
    },
    {
      key: 'store',
      label: isCommercial ? 'Inventory / Server Store' : 'Storage / Utility',
      isToggle: true,
    },
    {
      key: 'mumty',
      label: isCommercial ? 'Elevator & Stair Core' : 'Rooftop Stair / Mumty',
      isToggle: true,
    },
  ];

  // Live 4-side quadrilateral polygon points for site preview
  const maxW = Math.max(plot.sides.frontWidth, plot.sides.backWidth, 20);
  const maxL = Math.max(plot.sides.leftLength, plot.sides.rightLength, 20);
  const backInset = (maxW - plot.sides.backWidth) / 2;
  const frontInset = (maxW - plot.sides.frontWidth) / 2;
  const quadPoints = `${backInset},0 ${backInset + plot.sides.backWidth},0 ${frontInset + plot.sides.frontWidth},${plot.sides.rightLength} ${frontInset},${plot.sides.leftLength}`;

  if (isGenerating) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#DCE8E1] rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#E7F6EE] mx-auto flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#0E9F5D] animate-spin" style={{ animationDuration: '2.5s' }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#112A1E]">
              AI is engineering 8 blueprint variations...
            </h2>
            <p className="text-xs text-[#546E60] mt-2">
              {plot.category} · Front {plot.sides.frontWidth}&apos; / Back {plot.sides.backWidth}&apos; / Left {plot.sides.leftLength}&apos; / Right {plot.sides.rightLength}&apos; ({areaSqFt.toLocaleString()} sq ft)
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-2.5 bg-[#E7F6EE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0E9F5D] rounded-full transition-all duration-100"
                style={{ width: `${genProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-[#546E60] tabular-nums">
              <span>Computing walls, columns &amp; 3D geometry...</span>
              <span>{genProgress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 8+ Design Variations Gallery
  if (step === 3 && variations.length > 0) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[#112A1E]">
                {variations.length} Generated Design Variations
              </h1>
              <p className="text-xs text-[#546E60]">
                {plot.category} · {areaSqFt.toLocaleString()} sq ft ({areaSqM} m²) · {style}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateMoreVariations}
            className="min-h-[42px] px-4 rounded-2xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold flex items-center gap-1.5 hover:bg-[#D5EFE1]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate 8 More Designs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {variations.map((v, idx) => {
            const isSelected = v.id === selectedVarId;
            return (
              <div
                key={v.id}
                onClick={() => setSelectedVarId(v.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedVarId(v.id);
                }}
                className={`cursor-pointer rounded-3xl p-4 border transition-all bg-white flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-[#0E9F5D] shadow-md'
                    : 'border-[#DCE8E1] hover:border-[#0E9F5D]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0E9F5D]">
                      Design #{idx + 1} · {v.efficiencyScore}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#0E9F5D] border-[#0E9F5D] text-white'
                          : 'border-[#C5D5CC]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Mini SVG Preview with irregular outline */}
                  <div className="bg-[#F6F9F7] rounded-2xl p-2.5 border border-[#E2ECE6] mb-3">
                    <svg viewBox={`-2 -2 ${maxW + 4} ${maxL + 4}`} className="w-full h-36">
                      {v.rooms.map((rm) => (
                        <g key={rm.id}>
                          <rect
                            x={rm.x}
                            y={rm.y}
                            width={rm.w}
                            height={rm.h}
                            fill={
                              rm.type === 'sehan'
                                ? '#E7F6EE'
                                : rm.type === 'washroom'
                                  ? '#EBF2F0'
                                  : '#FFFFFF'
                            }
                            stroke="#1D3A2A"
                            strokeWidth={Math.max(0.4, maxW * 0.014)}
                          />
                          <text
                            x={rm.x + rm.w / 2}
                            y={rm.y + rm.h / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={Math.max(2.1, maxW * 0.075)}
                            fontWeight="700"
                            fill="#0E9F5D"
                          >
                            {rm.label.split(' ')[0]}
                          </text>
                        </g>
                      ))}
                      {plot.isIrregular && (
                        <polygon
                          points={quadPoints}
                          fill="none"
                          stroke="#0E9F5D"
                          strokeWidth="0.7"
                          strokeDasharray="1.5 1"
                        />
                      )}
                    </svg>
                  </div>

                  <h3 className="text-sm font-bold text-[#112A1E]">{v.name}</h3>
                  <p className="text-xs text-[#546E60] mt-0.5 line-clamp-2">{v.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const finalName =
              projectName.trim() ||
              `${plot.category} (${areaSqFt} sq ft) - ${style}`;
            onCompleteGeneration(finalName, plot, style, variations, selectedVarId);
          }}
          className="w-full min-h-[54px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-base shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Open Selected Blueprint &amp; Synced 3D Model →</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-[#112A1E]">{t.plotDetails}</h1>
        <div className="flex items-center gap-2">
          <Logo size={32} />
        </div>
      </div>

      {/* Category Selection (Homes, Markets, Buildings, Warehouses, Mixed-Use) */}
      <div className="bg-white rounded-3xl border border-[#DCE8E1] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#0E9F5D]" />
          <h2 className="text-base font-extrabold text-[#112A1E]">
            1. What are you designing?
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PROJECT_CATEGORIES.map((cat) => {
            const active = plot.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setPlot((prev) => ({ ...prev, category: cat.id }))}
                className={`text-left p-3 rounded-2xl border transition-all ${
                  active
                    ? 'bg-[#E7F6EE] border-[#0E9F5D] text-[#112A1E]'
                    : 'bg-[#F8FAF9] border-[#DCE8E1] text-[#405B4D] hover:border-[#0E9F5D]/50'
                }`}
              >
                <p className="text-xs font-extrabold">
                  {language === 'ur' ? cat.labelUr : cat.label}
                </p>
                <p className="text-[11px] text-[#546E60] mt-1">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: 4-Sided Plot Geometry, Region, Infrastructure Floors & Style */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#0E9F5D]" />
                <h3 className="text-base font-extrabold text-[#112A1E]">{t.plotDimensions}</h3>
              </div>
              <span className="text-xs font-bold text-[#0E9F5D] tabular-nums">
                {areaSqFt.toLocaleString()} sq ft · {areaSqM} m²
              </span>
            </div>

            {/* Rectangle vs Irregular 4-Side Plot Switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0F4F1] rounded-2xl">
              <button
                type="button"
                onClick={() =>
                  setPlot((prev) => ({
                    ...prev,
                    isIrregular: false,
                    sides: {
                      frontWidth: prev.sides.frontWidth,
                      backWidth: prev.sides.frontWidth,
                      leftLength: prev.sides.leftLength,
                      rightLength: prev.sides.leftLength,
                    },
                  }))
                }
                className={`min-h-[38px] rounded-xl text-xs font-bold ${
                  !plot.isIrregular ? 'bg-white text-[#112A1E] shadow-xs' : 'text-[#546E60]'
                }`}
              >
                Equal Sides (Rectangle)
              </button>
              <button
                type="button"
                onClick={() => setPlot((prev) => ({ ...prev, isIrregular: true }))}
                className={`min-h-[38px] rounded-xl text-xs font-bold ${
                  plot.isIrregular ? 'bg-[#0E9F5D] text-white shadow-xs' : 'text-[#546E60]'
                }`}
              >
                4-Side Irregular Plot
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PLOTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    setPlot((prev) => ({
                      ...prev,
                      isIrregular: p.front !== p.back || p.left !== p.right,
                      sides: {
                        frontWidth: p.front,
                        backWidth: p.back,
                        leftLength: p.left,
                        rightLength: p.right,
                      },
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#F4F8F5] hover:bg-[#E7F6EE] text-xs font-semibold text-[#405B4D]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 4-Side Inputs (2 Widths & 2 Lengths) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1">
                  Front Width (Street) ft
                </label>
                <input
                  type="number"
                  min={10}
                  max={400}
                  value={plot.sides.frontWidth}
                  onChange={(e) => updateSide('frontWidth', Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1">
                  Back Width (Rear) ft
                </label>
                <input
                  type="number"
                  min={10}
                  max={400}
                  disabled={!plot.isIrregular}
                  value={plot.sides.backWidth}
                  onChange={(e) => updateSide('backWidth', Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-bold tabular-nums disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1">
                  Left Length ft
                </label>
                <input
                  type="number"
                  min={12}
                  max={400}
                  value={plot.sides.leftLength}
                  onChange={(e) => updateSide('leftLength', Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-bold tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1">
                  Right Length ft
                </label>
                <input
                  type="number"
                  min={12}
                  max={400}
                  disabled={!plot.isIrregular}
                  value={plot.sides.rightLength}
                  onChange={(e) => updateSide('rightLength', Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-bold tabular-nums disabled:opacity-60"
                />
              </div>
            </div>

            {/* Live Quadrilateral Site Diagram */}
            <div className="bg-[#FAFDFB] border border-[#E2ECE6] rounded-2xl p-3 flex items-center justify-between gap-4">
              <svg viewBox={`-6 -6 ${maxW + 12} ${maxL + 12}`} className="w-28 h-28 shrink-0">
                <polygon
                  points={quadPoints}
                  fill="#E7F6EE"
                  stroke="#0E9F5D"
                  strokeWidth="1.2"
                />
                <text x={maxW / 2} y={-1.5} textAnchor="middle" fontSize="4.2" fontWeight="700" fill="#112A1E">
                  {plot.sides.backWidth}&apos;
                </text>
                <text x={maxW / 2} y={maxL + 4.5} textAnchor="middle" fontSize="4.2" fontWeight="700" fill="#0E9F5D">
                  Front {plot.sides.frontWidth}&apos;
                </text>
              </svg>
              <div className="text-xs text-[#405B4D] space-y-1 flex-1">
                <p className="font-bold text-[#112A1E]">4-Side Geometry Check</p>
                <p>
                  Left: {plot.sides.leftLength}&apos; · Right: {plot.sides.rightLength}&apos;
                </p>
                <p>
                  Front: {plot.sides.frontWidth}&apos; · Back: {plot.sides.backWidth}&apos;
                </p>
                <p className="text-[#0E9F5D] font-bold">
                  Net Area: {areaSqFt.toLocaleString()} sq ft ({areaSqM} m²)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#112A1E] mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={`${plot.category} - ${areaSqFt} sq ft`}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-medium"
              />
            </div>
          </div>

          {/* Global Country/Currency + Floors & Infrastructure Engineering Preview */}
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#112A1E] mb-1.5">
                  <Globe className="w-4 h-4 text-[#0E9F5D]" />
                  <span>Country / Currency</span>
                </label>
                <select
                  value={plot.region}
                  onChange={(e) =>
                    setPlot((prev) => ({
                      ...prev,
                      region: e.target.value as GlobalRegionCode,
                    }))
                  }
                  className="w-full min-h-[44px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-xs font-bold"
                >
                  {GLOBAL_REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.countryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#112A1E] mb-1.5">
                  <Wallet className="w-4 h-4 text-[#0E9F5D]" />
                  <span>Finish Quality</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setPlot((prev) => ({ ...prev, budget: b }))}
                      className={`min-h-[44px] rounded-xl text-xs font-bold ${
                        plot.budget === b
                          ? 'bg-[#0E9F5D] text-white'
                          : 'bg-[#F4F8F5] text-[#405B4D]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Infrastructure: Current Floors + Future Expansion + Soil */}
            <div className="bg-[#E7F6EE] rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <HardHat className="w-4 h-4 text-[#0E9F5D]" />
                <span className="text-sm font-extrabold text-[#112A1E]">
                  Structural &amp; Future Floor Planning
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#405B4D] block mb-1">
                    Floors to Build Now
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={plot.infrastructure.currentFloors}
                    onChange={(e) =>
                      setPlot((prev) => ({
                        ...prev,
                        infrastructure: {
                          ...prev.infrastructure,
                          currentFloors: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                        },
                      }))
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-[#DCE8E1] font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#405B4D] block mb-1">
                    Future Expansion (+Floors)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={plot.infrastructure.plannedFutureFloors}
                    onChange={(e) =>
                      setPlot((prev) => ({
                        ...prev,
                        infrastructure: {
                          ...prev.infrastructure,
                          plannedFutureFloors: Math.max(0, Math.min(5, Number(e.target.value) || 0)),
                        },
                      }))
                    }
                    className="w-full min-h-[40px] px-3 rounded-xl bg-white border border-[#DCE8E1] font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#405B4D] block mb-1">Soil Type</label>
                  <select
                    value={plot.infrastructure.soilType}
                    onChange={(e) =>
                      setPlot((prev) => ({
                        ...prev,
                        infrastructure: {
                          ...prev.infrastructure,
                          soilType: e.target.value as SoilType,
                        },
                      }))
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-white border border-[#DCE8E1] font-semibold"
                  >
                    {SOILS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#405B4D] block mb-1">Seismic Zone</label>
                  <select
                    value={plot.infrastructure.seismicZone}
                    onChange={(e) =>
                      setPlot((prev) => ({
                        ...prev,
                        infrastructure: {
                          ...prev.infrastructure,
                          seismicZone: e.target.value as SeismicZone,
                        },
                      }))
                    }
                    className="w-full min-h-[40px] px-2.5 rounded-xl bg-white border border-[#DCE8E1] font-semibold"
                  >
                    {SEISMIC.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-[#1D4E35]">
                Auto Pillar Size: {infraPreview.columnWidthIn}&quot; × {infraPreview.columnDepthIn}&quot; · {infraPreview.rebarSpec} · {infraPreview.footingType}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Architectural Style + Counters */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#112A1E]">Architecture Style</h3>
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#0E9F5D]" />
                <select
                  value={plot.facing}
                  onChange={(e) =>
                    setPlot((prev) => ({ ...prev, facing: e.target.value as PlotFacing }))
                  }
                  className="bg-[#F4F8F5] border border-[#DCE8E1] rounded-xl px-2.5 py-1 text-xs font-bold"
                >
                  {FACINGS.map((f) => (
                    <option key={f} value={f}>
                      Facing {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DESIGN_STYLES.map((s) => {
                const active = style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`text-left p-3 rounded-2xl border transition-all ${
                      active
                        ? 'bg-[#E7F6EE] border-[#0E9F5D] text-[#112A1E]'
                        : 'bg-[#F8FAF9] border-[#DCE8E1] text-[#405B4D]'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{s.label}</p>
                    <p className="text-[11px] text-[#546E60] mt-1">{s.tag}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-[#112A1E]" />
              <h3 className="text-base font-extrabold text-[#112A1E]">{t.propertyDetails}</h3>
            </div>
            <div className="divide-y divide-[#EDF3EF]">
              {counterItems.map((item) => {
                const val = plot.counts[item.key];
                return (
                  <div key={item.key} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#112A1E]">{item.label}</p>
                      {item.sub && <p className="text-xs text-[#546E60]">{item.sub}</p>}
                    </div>
                    {item.isToggle ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={val > 0}
                        onClick={() => toggleCount(item.key)}
                        className={`w-13 h-7 rounded-full p-0.5 transition-colors flex items-center shrink-0 ${
                          val > 0 ? 'bg-[#0E9F5D] justify-end' : 'bg-[#D6E0DA] justify-start'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-white shadow-xs" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCount(item.key, -1)}
                          className="w-9 h-9 rounded-xl border border-[#0E9F5D] text-[#0E9F5D] flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-sm font-extrabold tabular-nums">
                          {val}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCount(item.key, 1)}
                          className="w-9 h-9 rounded-xl bg-[#0E9F5D] text-white flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleStartGeneration(style)}
            className="w-full min-h-[54px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-base shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Generate 8+ Floor Plan Variations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
