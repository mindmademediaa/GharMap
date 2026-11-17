import React, { useState } from 'react';
import {
  ArrowLeft,
  Info,
  Ruler,
  Home,
  Minus,
  Plus,
  Sparkles,
  Lock,
  Check,
  MapPin,
  Compass,
  Wallet,
} from 'lucide-react';
import { CITIES, DESIGN_STYLES, TRANSLATIONS } from '../data/constants';
import {
  BudgetTier,
  CityName,
  DesignStyle,
  DesignVariation,
  Language,
  PlanTier,
  PlotFacing,
  PlotSpecs,
  RoomCounts,
} from '../types/gharmap';
import { MARLA_SQFT, generateDesignVariations } from '../utils/calculations';
import { Logo } from './Logo';

interface PlotDetailsScreenProps {
  language: Language;
  plan: PlanTier;
  initialPlot: PlotSpecs;
  initialStyle: DesignStyle;
  initialProjectName: string;
  onBack: () => void;
  onUpgradeRequest: () => void;
  onCompleteGeneration: (
    projectName: string,
    plot: PlotSpecs,
    style: DesignStyle,
    variations: DesignVariation[],
    selectedVariationId: string,
  ) => void;
}

const PRESET_PLOTS = [
  { label: '3 Marla', length: 34, width: 20 },
  { label: '5 Marla', length: 45, width: 25 },
  { label: '7 Marla', length: 52, width: 30 },
  { label: '10 Marla', length: 65, width: 35 },
  { label: '1 Kanal', length: 90, width: 50 },
];

const FACINGS: PlotFacing[] = ['North', 'South', 'East', 'West'];
const BUDGETS: BudgetTier[] = ['Low', 'Medium', 'Premium'];

export const PlotDetailsScreen: React.FC<PlotDetailsScreenProps> = ({
  language,
  plan,
  initialPlot,
  initialStyle,
  initialProjectName,
  onBack,
  onUpgradeRequest,
  onCompleteGeneration,
}) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Plot & Rooms, 2: Style & AI Loading, 3: 3 Variations
  const [projectName, setProjectName] = useState(initialProjectName);
  const [plot, setPlot] = useState<PlotSpecs>(initialPlot);
  const [style, setStyle] = useState<DesignStyle>(initialStyle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [variations, setVariations] = useState<DesignVariation[]>([]);
  const [selectedVarId, setSelectedVarId] = useState('var-1');
  const [showInfoTip, setShowInfoTip] = useState(false);

  const totalSqFt = Math.max(100, (plot.length || 0) * (plot.width || 0));
  const marlaVal = (totalSqFt / MARLA_SQFT).toFixed(1);

  const updateCount = (key: keyof RoomCounts, delta: number, max = 8) => {
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
    if (plan === 'free' && chosenStyle !== 'Pakistani') {
      onUpgradeRequest();
      return;
    }

    setStep(2);
    setIsGenerating(true);
    setGenProgress(8);

    const startTime = Date.now();
    const duration = 3000; // exact 3-second AI generation animation

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(98, Math.round((elapsed / duration) * 100));
      setGenProgress(pct);
    }, 80);

    window.setTimeout(() => {
      window.clearInterval(interval);
      setGenProgress(100);
      const generated = generateDesignVariations(plot, chosenStyle);
      setVariations(generated);
      setSelectedVarId(generated[0].id);
      setIsGenerating(false);
      setStep(3);
    }, duration);
  };

  const counterItems: {
    key: keyof RoomCounts;
    label: string;
    labelUr: string;
    isToggle?: boolean;
    sub?: string;
  }[] = [
    { key: 'rooms', label: 'Bedrooms / Rooms', labelUr: 'کمرے (بیڈروم)' },
    { key: 'washrooms', label: 'Washrooms', labelUr: 'باتھ رومز' },
    { key: 'kitchen', label: 'Kitchen', labelUr: 'باورچی خانہ' },
    { key: 'lounge', label: 'Lounge / TV Room', labelUr: 'لاؤنج', isToggle: true },
    { key: 'baramda', label: 'Baramda (Veranda)', labelUr: 'برآمدہ', isToggle: true },
    { key: 'garage', label: 'Garage / Car Porch', labelUr: 'گیراج / کار پورچ' },
    {
      key: 'sehan',
      label: 'Sehan (Courtyard)',
      labelUr: 'صحن',
      isToggle: true,
      sub: 'Open courtyard area for ventilation',
    },
    { key: 'store', label: 'Store Room', labelUr: 'اسٹور روم', isToggle: true },
    { key: 'mumty', label: 'Mumty (Roof Stair)', labelUr: 'ممٹی', isToggle: true },
  ];

  // 3-Second AI Loading Overlay
  if (isGenerating) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#DCE8E1] rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#E7F6EE] mx-auto flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#0E9F5D] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#112A1E]">
              AI is designing your house...
            </h2>
            <p className="urdu-font text-sm text-[#0E9F5D] font-semibold mt-1" dir="rtl">
              اے آئی آپ کے پلاٹ کے مطابق 3 بہترین نقشے تیار کر رہا ہے...
            </p>
            <p className="text-xs text-[#546E60] mt-2">
              Optimizing {plot.length}×{plot.width} ft ({marlaVal} Marla) for {plot.city} ({plot.facing} facing)
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
              <span>Generating 3 variations...</span>
              <span>{genProgress}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-[#405B4D] pt-2">
            <div className="bg-[#F6F9F7] rounded-xl p-2">Room Zoning</div>
            <div className="bg-[#F6F9F7] rounded-xl p-2">Sehan Airflow</div>
            <div className="bg-[#F6F9F7] rounded-xl p-2">PKR BOQ</div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: 3 Design Variations Picker
  if (step === 3 && variations.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-[#112A1E]">3 AI Design Variations</h1>
            <p className="text-xs text-[#546E60]">
              {plot.width}&apos; × {plot.length}&apos; ({marlaVal} Marla) · {style} Style · {plot.city}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#E7F6EE] text-[#0E9F5D]">
            Step 3 of 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#0E9F5D]">
                      Option {String.fromCharCode(65 + idx)} · {v.efficiencyScore}
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

                  {/* Mini SVG Floor Plan Preview */}
                  <div className="bg-[#F6F9F7] rounded-2xl p-3 border border-[#E2ECE6] mb-3">
                    <svg
                      viewBox={`0 0 ${plot.width} ${plot.length}`}
                      className="w-full h-44"
                    >
                      {v.rooms.map((rm) => {
                        const fill =
                          rm.type === 'sehan'
                            ? '#E7F6EE'
                            : rm.type === 'kitchen'
                              ? '#F3F8F5'
                              : rm.type === 'washroom'
                                ? '#E9EFF2'
                                : '#FFFFFF';
                        return (
                          <g key={rm.id}>
                            <rect
                              x={rm.x}
                              y={rm.y}
                              width={rm.w}
                              height={rm.h}
                              fill={fill}
                              stroke="#1D3A2A"
                              strokeWidth={Math.max(0.4, plot.width * 0.015)}
                              strokeDasharray={rm.type === 'sehan' ? '1.2 0.8' : undefined}
                            />
                            <text
                              x={rm.x + rm.w / 2}
                              y={rm.y + rm.h / 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={Math.max(2.1, plot.width * 0.085)}
                              fontWeight="700"
                              fill="#0E9F5D"
                            >
                              {rm.label.split(' ')[0]}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <h3 className="text-base font-bold text-[#112A1E]">{v.name}</h3>
                  <p className="text-xs text-[#546E60] mt-1">{v.subtitle}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#EDF3EF] text-xs text-[#2B523D]">
                  <span className="font-semibold">AI Note: </span>
                  {language === 'ur' ? v.aiNoteUr : v.aiNote}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const finalName =
              projectName.trim() || `${marlaVal} Marla ${style} Home - ${plot.city}`;
            onCompleteGeneration(finalName, plot, style, variations, selectedVarId);
          }}
          className="w-full min-h-[54px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-base shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Open Selected 2D Floor Plan & 3D Model →</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header matching Screenshot 5 */}
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
        <button
          type="button"
          onClick={() => setShowInfoTip((v) => !v)}
          aria-label="Plot sizing info"
          className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {showInfoTip && (
        <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-2xl p-4 text-xs text-[#1D4E35]">
          In Pakistan residential societies (DHA, Bahria, CDA), 1 Marla = 225 sq ft (e.g. 25×45 ft = 5 Marla, 35×65 ft = 10 Marla). Covered area is calculated at 85% of total plot area.
        </div>
      )}

      {/* Brand + Step Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={30} />
            <span className="text-sm font-bold text-[#0E9F5D]">GharMap AI</span>
          </div>
          <span className="text-xs font-semibold bg-[#E7F6EE] text-[#0E9F5D] px-3 py-1 rounded-xl">
            Step {step} of 3
          </span>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-[#112A1E]">{t.tellUsPlot}</h2>
          <p className="text-xs sm:text-sm text-[#546E60] mt-0.5">{t.plotSub}</p>
        </div>
        <div className="w-full h-1.5 bg-[#DCE8E1] rounded-full overflow-hidden">
          <div className="h-full bg-[#0E9F5D] rounded-full transition-all" style={{ width: '55%' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: Dimensions, City, Facing, Budget, Style */}
        <div className="lg:col-span-6 space-y-5">
          {/* Plot Dimensions Card */}
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ruler className="w-5 h-5 text-[#112A1E]" />
                <h3 className="text-base font-extrabold text-[#112A1E]">{t.plotDimensions}</h3>
              </div>
              <span className="text-xs font-bold text-[#0E9F5D] tabular-nums">
                {totalSqFt.toLocaleString()} sq ft · {marlaVal} Marla
              </span>
            </div>

            {/* Quick Marla Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PLOTS.map((preset) => {
                const active =
                  plot.length === preset.length && plot.width === preset.width;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setPlot((prev) => ({
                        ...prev,
                        length: preset.length,
                        width: preset.width,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[36px] ${
                      active
                        ? 'bg-[#0E9F5D] text-white'
                        : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1.5">
                  Length (ft)
                </label>
                <input
                  type="number"
                  min={20}
                  max={200}
                  value={plot.length}
                  onChange={(e) =>
                    setPlot((prev) => ({
                      ...prev,
                      length: Math.max(15, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-base font-bold text-[#112A1E] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
                />
                <span className="text-[11px] text-[#546E60] mt-1 block">feet (لمبائی)</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#112A1E] mb-1.5">
                  Width (ft)
                </label>
                <input
                  type="number"
                  min={15}
                  max={150}
                  value={plot.width}
                  onChange={(e) =>
                    setPlot((prev) => ({
                      ...prev,
                      width: Math.max(12, Number(e.target.value) || 0),
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-base font-bold text-[#112A1E] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
                />
                <span className="text-[11px] text-[#546E60] mt-1 block">feet (چوڑائی)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#112A1E] mb-1.5">
                Project Name (Optional)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={`${marlaVal} Marla Home - ${plot.city}`}
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
              />
            </div>
          </div>

          {/* City, Facing & Budget */}
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#0E9F5D]" />
                <span className="text-sm font-bold text-[#112A1E]">City (Material Rates)</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CITIES.map((city: CityName) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setPlot((prev) => ({ ...prev, city }))}
                    className={`min-h-[40px] px-2 rounded-xl text-xs font-semibold transition-colors ${
                      plot.city === city
                        ? 'bg-[#0E9F5D] text-white'
                        : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-[#0E9F5D]" />
                  <span className="text-sm font-bold text-[#112A1E]">Plot Facing</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FACINGS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setPlot((prev) => ({ ...prev, facing: f }))}
                      className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                        plot.facing === f
                          ? 'bg-[#0E9F5D] text-white'
                          : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-[#0E9F5D]" />
                  <span className="text-sm font-bold text-[#112A1E]">Budget Tier</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setPlot((prev) => ({ ...prev, budget: b }))}
                      className={`min-h-[40px] rounded-xl text-xs font-semibold transition-colors ${
                        plot.budget === b
                          ? 'bg-[#0E9F5D] text-white'
                          : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Architectural Style Selection */}
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#112A1E]">Select Architecture Style</h3>
              <span className="text-xs text-[#546E60]">5 Styles Available</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DESIGN_STYLES.map((s) => {
                const locked = plan === 'free' && !s.freeAllowed;
                const active = style === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (locked) {
                        onUpgradeRequest();
                        return;
                      }
                      setStyle(s.id);
                    }}
                    className={`text-left p-3 rounded-2xl border transition-all min-h-[74px] flex flex-col justify-between ${
                      active
                        ? 'bg-[#E7F6EE] border-[#0E9F5D] text-[#112A1E]'
                        : 'bg-[#F8FAF9] border-[#DCE8E1] text-[#405B4D] hover:border-[#0E9F5D]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold">
                        {language === 'ur' ? s.labelUr : s.label}
                      </span>
                      {locked && <Lock className="w-3.5 h-3.5 text-[#0E9F5D] shrink-0" />}
                    </div>
                    <span className="text-[11px] text-[#546E60] line-clamp-2 mt-1">
                      {locked ? 'Pro / Rs 999' : s.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Property Details Counters matching Screenshot 5 */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-[#DCE8E1] p-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <Home className="w-5 h-5 text-[#112A1E]" />
              <h3 className="text-base font-extrabold text-[#112A1E]">{t.propertyDetails}</h3>
            </div>

            <div className="divide-y divide-[#EDF3EF]">
              {counterItems.map((item) => {
                const val = plot.counts[item.key];
                return (
                  <div
                    key={item.key}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#112A1E]">
                        {language === 'ur' ? item.labelUr : item.label}
                      </p>
                      {item.sub && (
                        <p className="text-xs text-[#546E60]">{item.sub}</p>
                      )}
                    </div>

                    {item.isToggle ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={val > 0}
                        onClick={() => toggleCount(item.key)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center shrink-0 ${
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
                          aria-label={`Decrease ${item.label}`}
                          className="w-10 h-10 rounded-xl border border-[#0E9F5D] text-[#0E9F5D] flex items-center justify-center hover:bg-[#E7F6EE] transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-7 text-center text-sm font-extrabold text-[#112A1E] tabular-nums">
                          {val}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCount(item.key, 1)}
                          aria-label={`Increase ${item.label}`}
                          className="w-10 h-10 rounded-xl bg-[#0E9F5D] text-white flex items-center justify-center hover:bg-[#0A7D49] transition-colors"
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

          <div className="bg-[#E7F6EE] rounded-2xl px-4 py-3 text-xs font-medium text-[#1D4E35] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0E9F5D] shrink-0" />
            <span>
              AI will generate 3 tailored floor plan variations for your {plot.width}×{plot.length} ft plot.
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleStartGeneration(style)}
            className="w-full min-h-[54px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{t.generate2DPlan}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
