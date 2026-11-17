import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Pencil,
  Download,
  Ruler,
  Box,
  Save,
  Lock,
  Layers,
  Zap,
  Check,
  X,
} from 'lucide-react';
import { DESIGN_STYLES, TRANSLATIONS } from '../data/constants';
import {
  DesignStyle,
  Language,
  PlanTier,
  Project,
} from '../types/gharmap';
import { MARLA_SQFT, generateDesignVariations } from '../utils/calculations';
import { Logo } from './Logo';

interface FloorPlan2DScreenProps {
  language: Language;
  plan: PlanTier;
  project: Project;
  onBack: () => void;
  onSwitchTo3D: () => void;
  onSwitchToCosting: () => void;
  onUpdateProject: (updated: Project) => void;
  onExportPDF: () => void;
  onUpgradeRequest: () => void;
  onShowToast: (msg: string) => void;
}

export const FloorPlan2DScreen: React.FC<FloorPlan2DScreenProps> = ({
  language,
  plan,
  project,
  onBack,
  onSwitchTo3D,
  onSwitchToCosting,
  onUpdateProject,
  onExportPDF,
  onUpgradeRequest,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [showStructural, setShowStructural] = useState(false);
  const [showMep, setShowMep] = useState(false);
  const [editPrompt, setEditPrompt] = useState('Increase Sehan courtyard ventilation & widen lounge');

  const activeVariation =
    project.variations.find((v) => v.id === project.selectedVariationId) ||
    project.variations[0];

  const W = project.plot.width;
  const L = project.plot.length;
  const totalSqFt = W * L;
  const marla = (totalSqFt / MARLA_SQFT).toFixed(1);

  const handleStyleChange = (newStyle: DesignStyle) => {
    if (plan === 'free' && newStyle !== 'Pakistani' && !project.unlockedSingleMap) {
      onUpgradeRequest();
      return;
    }
    const newVars = generateDesignVariations(project.plot, newStyle);
    onUpdateProject({
      ...project,
      style: newStyle,
      variations: newVars,
      selectedVariationId: newVars[0].id,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onShowToast(`Applied ${newStyle} architectural layout`);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!measureMode) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const pad = 6;
    const vbWidth = W + pad * 2;
    const vbHeight = L + pad * 2;
    const clickX = ((e.clientX - rect.left) / rect.width) * vbWidth - pad;
    const clickY = ((e.clientY - rect.top) / rect.height) * vbHeight - pad;
    const clampedX = Math.max(0, Math.min(W, Number(clickX.toFixed(1))));
    const clampedY = Math.max(0, Math.min(L, Number(clickY.toFixed(1))));

    setMeasurePoints((prev) => {
      if (prev.length >= 2) return [{ x: clampedX, y: clampedY }];
      return [...prev, { x: clampedX, y: clampedY }];
    });
  };

  const measuredFeet =
    measurePoints.length === 2
      ? Math.hypot(
          measurePoints[1].x - measurePoints[0].x,
          measurePoints[1].y - measurePoints[0].y,
        ).toFixed(1)
      : null;

  const handleApplyAiEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const rotatedIdx =
      (project.variations.findIndex((v) => v.id === activeVariation.id) + 1) %
      project.variations.length;
    const nextVar = project.variations[rotatedIdx];
    onUpdateProject({
      ...project,
      selectedVariationId: nextVar.id,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setShowAiEdit(false);
    onShowToast('AI floor plan adjustment applied!');
  };

  const handleSaveProject = () => {
    onUpdateProject({
      ...project,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onShowToast('Project saved to My Projects!');
  };

  const pad = 6;

  return (
    <div className="space-y-4">
      {/* Green Top Header Card matching Screenshot 4 */}
      <div className="bg-[#0E9F5D] rounded-3xl p-3 sm:p-4 text-white shadow-sm">
        <div className="bg-white text-[#112A1E] rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl hover:bg-[#E7F6EE] flex items-center justify-center text-[#0E9F5D]"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base sm:text-lg font-extrabold truncate">{t.floorPlan2D}</h1>
          <div className="flex items-center gap-1.5 shrink-0">
            <Logo size={30} />
            <span className="hidden sm:inline text-xs font-bold text-[#112A1E]">GharMap AI</span>
          </div>
        </div>
      </div>

      {/* Location & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-[#E7F6EE] border border-[#0E9F5D]/15 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#112A1E]">
          <MapPin className="w-4 h-4 text-[#0E9F5D] shrink-0" />
          <span className="truncate">
            Residential · {project.plot.city}, Pakistan · {marla} Marla ({W}&apos;×{L}&apos;)
          </span>
        </div>

        {/* 2D Plan / 3D View Segmented Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#E7F0EB] rounded-2xl shrink-0">
          <button
            type="button"
            className="min-h-[40px] px-4 rounded-xl bg-[#0E9F5D] text-white text-xs sm:text-sm font-bold shadow-xs"
          >
            2D Plan
          </button>
          <button
            type="button"
            onClick={onSwitchTo3D}
            className="min-h-[40px] px-4 rounded-xl text-[#405B4D] hover:text-[#112A1E] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
          >
            <Box className="w-4 h-4" />
            <span>3D View</span>
          </button>
        </div>
      </div>

      {/* Style & 3 Design Variations Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-[#DCE8E1] rounded-2xl p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {DESIGN_STYLES.map((s) => {
            const locked =
              plan === 'free' && !s.freeAllowed && !project.unlockedSingleMap;
            const active = project.style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStyleChange(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors min-h-[36px] ${
                  active
                    ? 'bg-[#0E9F5D] text-white'
                    : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
                }`}
              >
                <span>{language === 'ur' ? s.labelUr : s.label}</span>
                {locked && <Lock className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-[#546E60] mr-1">Variation:</span>
          {project.variations.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() =>
                onUpdateProject({ ...project, selectedVariationId: v.id })
              }
              className={`min-h-[34px] px-3 rounded-xl text-xs font-bold transition-colors ${
                v.id === activeVariation.id
                  ? 'bg-[#112A1E] text-white'
                  : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
              }`}
            >
              {String.fromCharCode(65 + i)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: 2D Architectural Blueprint + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Blueprint Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#DCE8E1] rounded-3xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#112A1E]">
                {activeVariation.name}
              </h2>
              <p className="text-xs text-[#546E60]">{activeVariation.subtitle}</p>
            </div>

            {/* Premium Structural & MEP Layer Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (plan !== 'premium') {
                    onUpgradeRequest();
                    return;
                  }
                  setShowStructural((s) => !s);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors min-h-[36px] ${
                  showStructural
                    ? 'bg-[#112A1E] text-white border-[#112A1E]'
                    : 'bg-[#F6F9F7] text-[#405B4D] border-[#DCE8E1]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Structural</span>
                {plan !== 'premium' && <Lock className="w-3 h-3 text-[#0E9F5D]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (plan !== 'premium') {
                    onUpgradeRequest();
                    return;
                  }
                  setShowMep((s) => !s);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors min-h-[36px] ${
                  showMep
                    ? 'bg-[#0E9F5D] text-white border-[#0E9F5D]'
                    : 'bg-[#F6F9F7] text-[#405B4D] border-[#DCE8E1]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>MEP</span>
                {plan !== 'premium' && <Lock className="w-3 h-3 text-[#0E9F5D]" />}
              </button>
            </div>
          </div>

          {measureMode && (
            <div className="mb-3 bg-[#E7F6EE] text-[#1D4E35] rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center justify-between">
              <span>
                {measurePoints.length === 0 && 'Tap two points on the floor plan to measure distance.'}
                {measurePoints.length === 1 && 'Tap second point to complete measurement...'}
                {measurePoints.length === 2 &&
                  `Measured Distance: ${measuredFeet} ft (${(Number(measuredFeet) * 0.3048).toFixed(2)} m)`}
              </span>
              <button
                type="button"
                onClick={() => setMeasurePoints([])}
                className="text-[#0E9F5D] underline ml-2"
              >
                Clear
              </button>
            </div>
          )}

          {/* SVG Floor Plan */}
          <div className="relative bg-[#FAFDFB] rounded-2xl border border-[#E2ECE6] p-2 sm:p-4 overflow-hidden">
            <svg
              viewBox={`${-pad} ${-pad} ${W + pad * 2} ${L + pad * 2}`}
              onClick={handleSvgClick}
              className={`w-full max-h-[520px] select-none ${
                measureMode ? 'cursor-crosshair' : ''
              }`}
            >
              <defs>
                <pattern
                  id="floorGrid"
                  width="2"
                  height="2"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 2 0 L 0 0 0 2"
                    fill="none"
                    stroke="#E5EFE9"
                    strokeWidth="0.12"
                  />
                </pattern>
              </defs>

              {/* Plot Background Grid */}
              <rect x={0} y={0} width={W} height={L} fill="url(#floorGrid)" />

              {/* Top & Left Exterior Dimension Lines */}
              <g stroke="#0E9F5D" strokeWidth="0.18" fill="#0E9F5D">
                <line x1={0} y1={-2.5} x2={W} y2={-2.5} />
                <line x1={0} y1={-3.3} x2={0} y2={-1.7} />
                <line x1={W} y1={-3.3} x2={W} y2={-1.7} />
                <text
                  x={W / 2}
                  y={-3.4}
                  textAnchor="middle"
                  fontSize="1.7"
                  fontWeight="700"
                  stroke="none"
                >
                  {W}&apos;
                </text>

                <line x1={-2.5} y1={0} x2={-2.5} y2={L} />
                <line x1={-3.3} y1={0} x2={-1.7} y2={0} />
                <line x1={-3.3} y1={L} x2={-1.7} y2={L} />
                <text
                  x={-3.4}
                  y={L / 2}
                  textAnchor="middle"
                  fontSize="1.7"
                  fontWeight="700"
                  stroke="none"
                  transform={`rotate(-90 -3.4 ${L / 2})`}
                >
                  {L}&apos;
                </text>
              </g>

              {/* North / Facing Compass */}
              <g transform={`translate(${W + 2.8}, 4)`}>
                <text
                  x={0}
                  y={-2}
                  textAnchor="middle"
                  fontSize="1.6"
                  fontWeight="800"
                  fill="#0E9F5D"
                >
                  {project.plot.facing[0]}
                </text>
                <polygon points="0,-1.2 -0.9,1.3 0,0.7 0.9,1.3" fill="#0E9F5D" />
              </g>

              {/* Room Rectangles + Furniture Details */}
              {activeVariation.rooms.map((rm) => {
                const isSehan = rm.type === 'sehan';
                const isGarage = rm.type === 'garage';
                const isBath = rm.type === 'washroom';
                const isKitchen = rm.type === 'kitchen';
                const isBed = rm.type === 'bedroom';
                const isLounge = rm.type === 'lounge';

                const fill = isSehan
                  ? '#EEF9F2'
                  : isBath
                    ? '#F0F5F3'
                    : isGarage
                      ? '#F5F7F6'
                      : '#FFFFFF';

                return (
                  <g key={rm.id}>
                    <rect
                      x={rm.x}
                      y={rm.y}
                      width={rm.w}
                      height={rm.h}
                      fill={fill}
                      stroke="#1E3529"
                      strokeWidth={isSehan ? '0.28' : '0.55'}
                      strokeDasharray={isSehan ? '0.9 0.6' : undefined}
                    />

                    {/* Simple Furniture Symbols */}
                    {isBed && rm.w >= 7 && rm.h >= 7 && (
                      <g stroke="#546E60" strokeWidth="0.16" fill="#FAFDFB">
                        <rect
                          x={rm.x + 1}
                          y={rm.y + 1}
                          width={Math.min(5, rm.w * 0.4)}
                          height={Math.min(6, rm.h * 0.42)}
                          rx="0.3"
                        />
                        <rect
                          x={rm.x + 1.3}
                          y={rm.y + 1.3}
                          width={Math.min(2, rm.w * 0.16)}
                          height={1.1}
                          rx="0.2"
                        />
                      </g>
                    )}

                    {isLounge && rm.w >= 8 && rm.h >= 7 && (
                      <g stroke="#546E60" strokeWidth="0.16" fill="#F2F7F4">
                        <rect
                          x={rm.x + rm.w - 2.6}
                          y={rm.y + 1.8}
                          width={1.6}
                          height={Math.min(6, rm.h * 0.5)}
                          rx="0.3"
                        />
                      </g>
                    )}

                    {isKitchen && rm.w >= 5 && rm.h >= 5 && (
                      <g stroke="#546E60" strokeWidth="0.15" fill="#F4F8F5">
                        <rect x={rm.x + 1} y={rm.y + 0.8} width={Math.min(4, rm.w * 0.55)} height={1.6} />
                        <circle cx={rm.x + 2} cy={rm.y + 1.3} r="0.3" fill="#0E9F5D" />
                        <circle cx={rm.x + 3} cy={rm.y + 1.3} r="0.3" fill="#0E9F5D" />
                      </g>
                    )}

                    {isSehan && (
                      <g fill="#0E9F5D" opacity="0.8">
                        <circle cx={rm.x + 2} cy={rm.y + 2} r="0.9" />
                        <circle cx={rm.x + 4.1} cy={rm.y + 1.9} r="0.6" />
                        <text
                          x={rm.x + rm.w / 2}
                          y={rm.y + rm.h - 1.2}
                          textAnchor="middle"
                          fontSize="1.2"
                          fontWeight="600"
                          fill="#0E9F5D"
                        >
                          Gate → Street
                        </text>
                      </g>
                    )}

                    {/* Door Swing Arc */}
                    {rm.doorSide === 'bottom' && (
                      <path
                        d={`M ${rm.x + rm.w * 0.45} ${rm.y + rm.h} A 2.2 2.2 0 0 1 ${rm.x + rm.w * 0.45 + 2.2} ${rm.y + rm.h - 2.2}`}
                        fill="none"
                        stroke="#0E9F5D"
                        strokeWidth="0.18"
                      />
                    )}

                    {/* Room Title & Exact Dimensions */}
                    <text
                      x={rm.x + rm.w / 2}
                      y={rm.y + rm.h / 2 - 0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.max(1.3, Math.min(2.1, rm.w * 0.14))}
                      fontWeight="800"
                      fill="#0E9F5D"
                    >
                      {language === 'ur' ? rm.urduLabel : rm.label}
                    </text>
                    <text
                      x={rm.x + rm.w / 2}
                      y={rm.y + rm.h / 2 + 1.4}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="1.25"
                      fontWeight="600"
                      fill="#405B4D"
                    >
                      {rm.w}&apos; × {rm.h}&apos;
                    </text>
                  </g>
                );
              })}

              {/* Premium Structural Overlay (RCC Columns & Plinth Beams) */}
              {showStructural && (
                <g>
                  {[0, W * 0.5, W].map((cx) =>
                    [0, L * 0.42, L * 0.74, L].map((cy) => (
                      <rect
                        key={`col-${cx}-${cy}`}
                        x={cx - 0.45}
                        y={cy - 0.45}
                        width={0.9}
                        height={0.9}
                        fill="#112A1E"
                      />
                    )),
                  )}
                </g>
              )}

              {/* Premium Electrical & Plumbing MEP Overlay */}
              {showMep && (
                <g stroke="#0E9F5D" strokeWidth="0.22" strokeDasharray="0.7 0.5" fill="none">
                  <polyline points={`2,2 ${W - 2},2 ${W - 2},${L * 0.65} 2,${L * 0.65}`} />
                  <circle cx={W * 0.5} cy={L * 0.22} r="0.6" fill="#EAB308" stroke="none" />
                  <circle cx={W * 0.35} cy={L * 0.55} r="0.6" fill="#EAB308" stroke="none" />
                  <circle cx={W * 0.75} cy={L * 0.55} r="0.6" fill="#3B82F6" stroke="none" />
                </g>
              )}

              {/* Measurement Line */}
              {measurePoints.map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="0.65" fill="#0E9F5D" />
              ))}
              {measurePoints.length === 2 && (
                <g>
                  <line
                    x1={measurePoints[0].x}
                    y1={measurePoints[0].y}
                    x2={measurePoints[1].x}
                    y2={measurePoints[1].y}
                    stroke="#0E9F5D"
                    strokeWidth="0.3"
                    strokeDasharray="0.8 0.5"
                  />
                  <text
                    x={(measurePoints[0].x + measurePoints[1].x) / 2}
                    y={(measurePoints[0].y + measurePoints[1].y) / 2 - 1}
                    textAnchor="middle"
                    fontSize="1.6"
                    fontWeight="800"
                    fill="#112A1E"
                  >
                    {measuredFeet}&apos;
                  </text>
                </g>
              )}
            </svg>

            {/* Legend & Total Area Footer */}
            <div className="mt-3 pt-3 border-t border-[#E2ECE6] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-4 text-[#405B4D]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E3529]" /> Wall
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 border-t-2 border-dashed border-[#0E9F5D]" /> Opening / Door
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E7F6EE] border border-[#0E9F5D]" /> Courtyard
                </span>
              </div>
              <span className="font-bold text-[#0E9F5D] tabular-nums">
                Total: {W}&apos; × {L}&apos; · {totalSqFt.toLocaleString()} sq ft ({marla} Marla)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: AI Note + Action Buttons matching Screenshot 4 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#0E9F5D] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#1D4E35]">
              <span className="font-extrabold">AI Note: </span>
              <span>{language === 'ur' ? activeVariation.aiNoteUr : activeVariation.aiNote}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={() => setShowAiEdit(true)}
              className="min-h-[48px] px-3 rounded-2xl bg-white border border-[#0E9F5D] text-[#0E9F5D] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#E7F6EE] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>AI Edit</span>
            </button>

            <button
              type="button"
              onClick={onExportPDF}
              className="min-h-[48px] px-3 rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportPdf}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMeasureMode((m) => !m);
                setMeasurePoints([]);
              }}
              className={`min-h-[48px] px-3 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                measureMode
                  ? 'bg-[#112A1E] text-white border-[#112A1E]'
                  : 'bg-white border-[#0E9F5D] text-[#0E9F5D] hover:bg-[#E7F6EE]'
              }`}
            >
              <Ruler className="w-4 h-4" />
              <span>{measureMode ? 'Exit Measure' : 'Measure'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSaveProject}
              className="min-h-[48px] px-3 rounded-2xl bg-white border border-[#DCE8E1] hover:border-[#0E9F5D] text-[#112A1E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4 text-[#0E9F5D]" />
              <span>Save Project</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToCosting}
              className="min-h-[48px] px-3 rounded-2xl bg-[#E7F6EE] hover:bg-[#D5EFE1] text-[#0E9F5D] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View PKR Cost →</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Edit Modal */}
      {showAiEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleApplyAiEdit}
            className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0E9F5D]" />
                <h3 className="text-lg font-extrabold text-[#112A1E]">AI Plan Editor</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAiEdit(false)}
                className="w-9 h-9 rounded-full bg-[#F4F8F5] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#546E60]">
              Describe how you want GharMap AI to adjust room placement or ventilation:
            </p>
            <textarea
              rows={3}
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-[#F4F8F5] border border-[#DCE8E1] text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9F5D]"
            />
            <div className="flex flex-wrap gap-1.5">
              {['Swap Kitchen & Lounge', 'Larger Sehan Courtyard', 'En-suite Master Bath'].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setEditPrompt(chip)}
                    className="px-3 py-1.5 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-semibold"
                  >
                    {chip}
                  </button>
                ),
              )}
            </div>
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Regenerate Layout</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
