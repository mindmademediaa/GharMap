import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Download,
  Ruler,
  Box,
  Save,
  Layers,
  Zap,
  RefreshCw,
  HardHat,
} from 'lucide-react';
import { DESIGN_STYLES, TRANSLATIONS, getRegionConfig } from '../data/constants';
import {
  DesignStyle,
  Language,
  Project,
} from '../types/gharmap';
import {
  calculateInfrastructureSpecs,
  calculatePlotAreaSqFt,
  ftToMeters,
  generateDesignVariations,
  sqFtToSqM,
} from '../utils/calculations';
import { Logo } from './Logo';

interface FloorPlan2DScreenProps {
  language: Language;
  project: Project;
  onBack: () => void;
  onSwitchTo3D: () => void;
  onSwitchToCosting: () => void;
  onSwitchToInfra: () => void;
  onUpdateProject: (updated: Project) => void;
  onExportPDF: () => void;
  onShowToast: (msg: string) => void;
}

export const FloorPlan2DScreen: React.FC<FloorPlan2DScreenProps> = ({
  language,
  project,
  onBack,
  onSwitchTo3D,
  onSwitchToCosting,
  onSwitchToInfra,
  onUpdateProject,
  onExportPDF,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [measureMode, setMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<{ x: number; y: number }[]>([]);
  const [showWallDetailsOnMap, setShowWallDetailsOnMap] = useState(true);
  const [showStructural, setShowStructural] = useState(true);
  const [showMep, setShowMep] = useState(false);

  const activeVariation =
    project.variations.find((v) => v.id === project.selectedVariationId) ||
    project.variations[0];

  const { frontWidth, backWidth, leftLength, rightLength } = project.plot.sides;
  const maxW = Math.max(frontWidth, backWidth);
  const maxL = Math.max(leftLength, rightLength);
  const areaSqFt = calculatePlotAreaSqFt(project.plot.sides);
  const areaSqM = sqFtToSqM(areaSqFt);
  const infraSpec = calculateInfrastructureSpecs(project.plot);
  const reg = getRegionConfig(project.plot.region);

  const backInset = (maxW - backWidth) / 2;
  const frontInset = (maxW - frontWidth) / 2;
  const quadPoints = `${backInset},0 ${backInset + backWidth},0 ${frontInset + frontWidth},${rightLength} ${frontInset},${leftLength}`;

  const handleStyleChange = (newStyle: DesignStyle) => {
    const newVars = generateDesignVariations(project.plot, newStyle, 0);
    onUpdateProject({
      ...project,
      style: newStyle,
      variations: newVars,
      selectedVariationId: newVars[0].id,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    onShowToast(`Generated 8 variations in ${newStyle} style`);
  };

  const handleGenerateMore = () => {
    const more = generateDesignVariations(
      project.plot,
      project.style,
      project.variations.length,
    );
    onUpdateProject({
      ...project,
      variations: [...project.variations, ...more],
      selectedVariationId: more[0].id,
    });
    onShowToast(`Added 8 more layout variations (${project.variations.length + 8} total)!`);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!measureMode) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const pad = 7;
    const vbWidth = maxW + pad * 2;
    const vbHeight = maxL + pad * 2;
    const clickX = ((e.clientX - rect.left) / rect.width) * vbWidth - pad;
    const clickY = ((e.clientY - rect.top) / rect.height) * vbHeight - pad;
    const clampedX = Math.max(0, Math.min(maxW, Number(clickX.toFixed(1))));
    const clampedY = Math.max(0, Math.min(maxL, Number(clickY.toFixed(1))));

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

  const pad = 7;

  return (
    <div className="space-y-4">
      {/* Header */}
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
          <div className="text-center min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold truncate">{t.floorPlan2D}</h1>
            <p className="text-[11px] text-[#546E60] truncate">
              {project.plot.category} · {areaSqFt.toLocaleString()} sq ft ({areaSqM} m²) · {reg.currencyCode}
            </p>
          </div>
          <Logo size={30} />
        </div>
      </div>

      {/* 2D / 3D / Infra Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#E7F0EB] rounded-2xl">
          <button
            type="button"
            className="min-h-[40px] px-4 rounded-xl bg-[#0E9F5D] text-white text-xs sm:text-sm font-bold shadow-xs"
          >
            2D Blueprint
          </button>
          <button
            type="button"
            onClick={onSwitchTo3D}
            className="min-h-[40px] px-4 rounded-xl text-[#405B4D] hover:text-[#112A1E] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
          >
            <Box className="w-4 h-4" />
            <span>Synced 3D View</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {DESIGN_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStyleChange(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap min-h-[36px] ${
                project.style === s.id
                  ? 'bg-[#0E9F5D] text-white'
                  : 'bg-white border border-[#DCE8E1] text-[#405B4D]'
              }`}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Variation Gallery Strip (8+ Variations + Generate More) */}
      <div className="bg-white border border-[#DCE8E1] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {project.variations.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onUpdateProject({ ...project, selectedVariationId: v.id })}
              className={`min-h-[36px] px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                v.id === activeVariation.id
                  ? 'bg-[#112A1E] text-white'
                  : 'bg-[#F4F8F5] text-[#405B4D] hover:bg-[#E7F6EE]'
              }`}
            >
              #{i + 1} {v.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleGenerateMore}
          className="min-h-[36px] px-3 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-[#D5EFE1]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>+8 More</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Blueprint Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#DCE8E1] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#112A1E]">
                {activeVariation.name}
              </h2>
              <p className="text-xs text-[#546E60]">{activeVariation.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowWallDetailsOnMap((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border min-h-[34px] ${
                  showWallDetailsOnMap
                    ? 'bg-[#E7F6EE] text-[#0E9F5D] border-[#0E9F5D]/30'
                    : 'bg-[#F6F9F7] text-[#405B4D] border-[#DCE8E1]'
                }`}
              >
                Wall &amp; Door Specs
              </button>
              <button
                type="button"
                onClick={() => setShowStructural((s) => !s)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border min-h-[34px] ${
                  showStructural
                    ? 'bg-[#112A1E] text-white border-[#112A1E]'
                    : 'bg-[#F6F9F7] text-[#405B4D] border-[#DCE8E1]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pillars ({infraSpec.columnWidthIn}&quot;×{infraSpec.columnDepthIn}&quot;)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMep((s) => !s)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border min-h-[34px] ${
                  showMep
                    ? 'bg-[#0E9F5D] text-white border-[#0E9F5D]'
                    : 'bg-[#F6F9F7] text-[#405B4D] border-[#DCE8E1]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>MEP</span>
              </button>
            </div>
          </div>

          {measureMode && (
            <div className="bg-[#E7F6EE] text-[#1D4E35] rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center justify-between">
              <span>
                {measurePoints.length < 2
                  ? 'Click any two points on the blueprint to measure exact length.'
                  : `Measured: ${measuredFeet} ft (${ftToMeters(Number(measuredFeet))} m)`}
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

          {/* SVG Blueprint */}
          <div className="bg-[#FAFDFB] rounded-2xl border border-[#E2ECE6] p-2 sm:p-4 overflow-hidden">
            <svg
              viewBox={`${-pad} ${-pad} ${maxW + pad * 2} ${maxL + pad * 2}`}
              onClick={handleSvgClick}
              className={`w-full max-h-[540px] select-none ${measureMode ? 'cursor-crosshair' : ''}`}
            >
              <defs>
                <pattern id="bpGrid" width="2" height="2" patternUnits="userSpaceOnUse">
                  <path d="M 2 0 L 0 0 0 2" fill="none" stroke="#E5EFE9" strokeWidth="0.12" />
                </pattern>
              </defs>

              <rect x={0} y={0} width={maxW} height={maxL} fill="url(#bpGrid)" />

              {/* 4-Sided Dimension Lines (Back, Front, Left, Right) */}
              <g fill="#0E9F5D" fontSize="1.65" fontWeight="700">
                <text x={maxW / 2} y={-2.5} textAnchor="middle">
                  Back Width: {backWidth}&apos; ({ftToMeters(backWidth)}m)
                </text>
                <text x={maxW / 2} y={maxL + 4.2} textAnchor="middle">
                  Front Width (Street): {frontWidth}&apos; ({ftToMeters(frontWidth)}m)
                </text>
                <text
                  x={-3.4}
                  y={maxL / 2}
                  textAnchor="middle"
                  transform={`rotate(-90 -3.4 ${maxL / 2})`}
                >
                  Left Length: {leftLength}&apos; ({ftToMeters(leftLength)}m)
                </text>
                <text
                  x={maxW + 3.8}
                  y={maxL / 2}
                  textAnchor="middle"
                  transform={`rotate(90 ${maxW + 3.8} ${maxL / 2})`}
                >
                  Right Length: {rightLength}&apos; ({ftToMeters(rightLength)}m)
                </text>
              </g>

              {/* Rooms */}
              {activeVariation.rooms.map((rm) => {
                const isSehan = rm.type === 'sehan';
                const isBath = rm.type === 'washroom';
                const isGarage = rm.type === 'garage';
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
                      strokeWidth={isSehan ? '0.3' : Math.max(0.45, rm.wallThicknessIn * 0.06)}
                      strokeDasharray={isSehan ? '0.9 0.6' : undefined}
                    />
                    <text
                      x={rm.x + rm.w / 2}
                      y={rm.y + rm.h / 2 - (showWallDetailsOnMap ? 1.1 : 0.4)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={Math.max(1.25, Math.min(2.0, rm.w * 0.13))}
                      fontWeight="800"
                      fill="#0E9F5D"
                    >
                      {language === 'ur' ? rm.urduLabel : rm.label}
                    </text>
                    <text
                      x={rm.x + rm.w / 2}
                      y={rm.y + rm.h / 2 + (showWallDetailsOnMap ? 0.6 : 1.3)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="1.2"
                      fontWeight="700"
                      fill="#112A1E"
                    >
                      {rm.w}&apos; × {rm.h}&apos; ({rm.w * rm.h} sq ft)
                    </text>
                    {showWallDetailsOnMap && (
                      <text
                        x={rm.x + rm.w / 2}
                        y={rm.y + rm.h / 2 + 2.3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="1.0"
                        fontWeight="600"
                        fill="#546E60"
                      >
                        Wall {rm.wallThicknessIn}&quot; · Door {rm.doorSizeLabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Exact 4-sided irregular site boundary overlay */}
              {project.plot.isIrregular && (
                <polygon
                  points={quadPoints}
                  fill="none"
                  stroke="#0E9F5D"
                  strokeWidth="0.55"
                  strokeDasharray="1.4 0.8"
                />
              )}

              {/* Structural RCC Pillars Grid */}
              {showStructural && (
                <g>
                  {[0, maxW * 0.5, maxW].map((cx) =>
                    [0, maxL * 0.36, maxL * 0.72, maxL].map((cy) => (
                      <rect
                        key={`col-${cx}-${cy}`}
                        x={cx - 0.55}
                        y={cy - 0.55}
                        width={1.1}
                        height={1.1}
                        fill="#112A1E"
                      />
                    )),
                  )}
                </g>
              )}

              {/* MEP Electrical & Plumbing Overlay */}
              {showMep && (
                <g stroke="#0E9F5D" strokeWidth="0.22" strokeDasharray="0.7 0.5" fill="none">
                  <polyline points={`2,2 ${maxW - 2},2 ${maxW - 2},${maxL * 0.65} 2,${maxL * 0.65}`} />
                  <circle cx={maxW * 0.5} cy={maxL * 0.22} r="0.6" fill="#EAB308" stroke="none" />
                  <circle cx={maxW * 0.35} cy={maxL * 0.55} r="0.6" fill="#EAB308" stroke="none" />
                  <circle cx={maxW * 0.75} cy={maxL * 0.55} r="0.6" fill="#3B82F6" stroke="none" />
                </g>
              )}

              {/* Measure Line */}
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
                    strokeWidth="0.32"
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
          </div>

          {/* Complete Construction Dimension & Wall Thickness Schedule */}
          <div className="pt-2 overflow-x-auto">
            <h3 className="text-xs font-extrabold text-[#112A1E] mb-2">
              Construction Dimension &amp; Wall Thickness Schedule
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2ECE6] text-[#546E60]">
                  <th className="py-1.5 pr-2">Room / Space</th>
                  <th className="py-1.5 px-2 text-right">Width × Length</th>
                  <th className="py-1.5 px-2 text-right">Area</th>
                  <th className="py-1.5 px-2 text-right">Wall Thick</th>
                  <th className="py-1.5 pl-2 text-right">Door / Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5F2] tabular-nums">
                {activeVariation.rooms.map((rm) => (
                  <tr key={rm.id}>
                    <td className="py-2 pr-2 font-bold text-[#112A1E]">{rm.label}</td>
                    <td className="py-2 px-2 text-right text-[#405B4D]">
                      {rm.w}&apos; × {rm.h}&apos; ({ftToMeters(rm.w)}m × {ftToMeters(rm.h)}m)
                    </td>
                    <td className="py-2 px-2 text-right font-semibold text-[#0E9F5D]">
                      {rm.w * rm.h} sq ft
                    </td>
                    <td className="py-2 px-2 text-right text-[#112A1E]">
                      {rm.wallThicknessIn}&quot; ({Math.round(rm.wallThicknessIn * 25.4)}mm)
                    </td>
                    <td className="py-2 pl-2 text-right text-[#546E60]">
                      D: {rm.doorSizeLabel} {rm.windowSizeLabel ? `· W: ${rm.windowSizeLabel}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Engineering & Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#E7F6EE] border border-[#0E9F5D]/20 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#0E9F5D] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#1D4E35]">
              <span className="font-extrabold">AI Blueprint Note: </span>
              <span>{language === 'ur' ? activeVariation.aiNoteUr : activeVariation.aiNote}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={onSwitchTo3D}
              className="min-h-[48px] px-4 rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <Box className="w-4 h-4" />
              <span>Open This Design in 3D</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToInfra}
              className="min-h-[48px] px-4 rounded-2xl bg-white border border-[#0E9F5D] text-[#0E9F5D] hover:bg-[#E7F6EE] font-bold text-sm flex items-center justify-center gap-2"
            >
              <HardHat className="w-4 h-4" />
              <span>Pillar &amp; Foundation Specs</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMeasureMode((m) => !m);
                setMeasurePoints([]);
              }}
              className={`min-h-[48px] px-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 ${
                measureMode
                  ? 'bg-[#112A1E] text-white border-[#112A1E]'
                  : 'bg-white border-[#DCE8E1] text-[#112A1E]'
              }`}
            >
              <Ruler className="w-4 h-4 text-[#0E9F5D]" />
              <span>{measureMode ? 'Exit Measure' : 'Measure Blueprint'}</span>
            </button>

            <button
              type="button"
              onClick={onExportPDF}
              className="min-h-[48px] px-4 rounded-2xl bg-white border border-[#DCE8E1] hover:border-[#0E9F5D] text-[#112A1E] font-bold text-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-[#0E9F5D]" />
              <span>{t.exportPdf}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onUpdateProject({
                  ...project,
                  updatedAt: new Date().toISOString().slice(0, 10),
                });
                onShowToast('Blueprint & schedule saved!');
              }}
              className="min-h-[46px] px-3 rounded-2xl bg-white border border-[#DCE8E1] text-[#112A1E] font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#0E9F5D]" />
              <span>Save Project</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToCosting}
              className="min-h-[46px] px-3 rounded-2xl bg-[#E7F6EE] text-[#0E9F5D] font-bold text-xs flex items-center justify-center"
            >
              Material Cost →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
