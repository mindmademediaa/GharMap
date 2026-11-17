import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  Lock,
  Edit3,
  Layers,
  Hammer,
  Grid3X3,
  PaintBucket,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { CITIES, TRANSLATIONS } from '../data/constants';
import {
  AllCityRates,
  CityMaterialRates,
  CityName,
  Language,
  PlanTier,
  Project,
} from '../types/gharmap';
import { calculateMaterialCosting, formatPKR } from '../utils/calculations';

interface MaterialCostingScreenProps {
  language: Language;
  plan: PlanTier;
  project: Project;
  cityRates: AllCityRates;
  onBack: () => void;
  onUpdateProjectCity: (city: CityName) => void;
  onUpdateCityRates: (city: CityName, rates: CityMaterialRates) => void;
  onExportPDF: () => void;
  onUpgradeRequest: () => void;
  onShowToast: (msg: string) => void;
}

export const MaterialCostingScreen: React.FC<MaterialCostingScreenProps> = ({
  language,
  plan,
  project,
  cityRates,
  onBack,
  onUpdateProjectCity,
  onUpdateCityRates,
  onExportPDF,
  onUpgradeRequest,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [editingRates, setEditingRates] = useState(false);
  const currentRates = cityRates[project.plot.city];
  const [draftRates, setDraftRates] = useState<CityMaterialRates>(currentRates);

  const hasFullBoq = plan !== 'free' || Boolean(project.unlockedSingleMap);
  const cost = calculateMaterialCosting(project.plot, currentRates);

  const breakdownItems = [
    {
      id: 'cement',
      name: 'Cement',
      sub: `${cost.cementBags.toLocaleString()} bags · 50kg each`,
      qty: cost.cementBags.toLocaleString(),
      unit: 'Bags',
      rate: currentRates.cementPerBag,
      amount: cost.cementCost,
      color: '#0B5D38',
      icon: 'cement',
    },
    {
      id: 'bricks',
      name: 'Bricks (Awwal)',
      sub: `${cost.bricksCount.toLocaleString()} pcs`,
      qty: cost.bricksCount.toLocaleString(),
      unit: 'Pcs',
      rate: currentRates.brickPerPc,
      amount: cost.bricksCost,
      color: '#0E9F5D',
      icon: 'bricks',
    },
    {
      id: 'steel',
      name: 'Steel (Grade 60)',
      sub: `${cost.steelKg.toLocaleString()} kg (${(cost.steelKg / 1000).toFixed(2)} tons)`,
      qty: cost.steelKg.toLocaleString(),
      unit: 'Kg',
      rate: currentRates.steelPerKg,
      amount: cost.steelCost,
      color: '#2FB978',
      icon: 'steel',
    },
    {
      id: 'sand-bajri',
      name: 'Sand & Aggregate (Bajri)',
      sub: `${cost.sandCft.toLocaleString()} cft Sand · ${cost.bajriCft.toLocaleString()} cft Bajri`,
      qty: `${cost.sandCft} / ${cost.bajriCft}`,
      unit: 'Cft',
      rate: Math.round((currentRates.sandPerCft + currentRates.bajriPerCft) / 2),
      amount: cost.sandCost + cost.bajriCost,
      color: '#6CD2A0',
      icon: 'sand',
    },
    {
      id: 'tiles',
      name: 'Floor Tiles & Fixing',
      sub: `${cost.tilesSqFt.toLocaleString()} sq ft (${project.customization.floorTiles})`,
      qty: cost.tilesSqFt.toLocaleString(),
      unit: 'Sq Ft',
      rate: currentRates.tilesPerSqFt,
      amount: cost.tilesCost,
      color: '#9BE2BD',
      icon: 'tiles',
    },
    {
      id: 'paint',
      name: 'Interior & Exterior Paint',
      sub: `${cost.paintSqFt.toLocaleString()} sq ft surface`,
      qty: cost.paintSqFt.toLocaleString(),
      unit: 'Sq Ft',
      rate: currentRates.paintPerSqFt,
      amount: cost.paintCost,
      color: '#BCECD3',
      icon: 'paint',
    },
    {
      id: 'labour',
      name: 'Construction Labour',
      sub: `${cost.coveredArea.toLocaleString()} sq ft @ PKR ${currentRates.labourPerSqFt}/sq ft`,
      qty: cost.coveredArea.toLocaleString(),
      unit: 'Sq Ft',
      rate: currentRates.labourPerSqFt,
      amount: cost.labourCost,
      color: '#194732',
      icon: 'labour',
    },
  ];

  // Pie Chart SVG arc generator
  const subtotalBase = cost.materialsTotal + cost.labourCost;
  const pieSlices = breakdownItems.slice(0, 5).reduce<
    {
      id: string;
      name: string;
      pct: number;
      color: string;
      startAngle: number;
      endAngle: number;
    }[]
  >((acc, item) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const pct = Math.max(2, Math.round((item.amount / subtotalBase) * 100));
    const angle = (item.amount / subtotalBase) * 360;
    acc.push({
      id: item.id,
      name: item.name.split(' ')[0],
      pct,
      color: item.color,
      startAngle: prevEnd,
      endAngle: prevEnd + angle,
    });
    return acc;
  }, []);

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeSlice = (cx: number, cy: number, r: number, start: number, end: number) => {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
  };

  const handleShareWhatsapp = () => {
    if (!hasFullBoq) {
      onUpgradeRequest();
      return;
    }
    const text = [
      `*GharMap AI - Construction Estimate*`,
      `Project: ${project.name}`,
      `City: ${project.plot.city} | Plot: ${project.plot.width}' x ${project.plot.length}' (${cost.marlaArea} Marla)`,
      `Covered Area: ${cost.coveredArea.toLocaleString()} sq ft`,
      `• Cement: ${cost.cementBags} bags (${formatPKR(cost.cementCost)})`,
      `• Bricks: ${cost.bricksCount.toLocaleString()} pcs (${formatPKR(cost.bricksCost)})`,
      `• Steel: ${cost.steelKg.toLocaleString()} kg (${formatPKR(cost.steelCost)})`,
      `• Sand & Bajri: ${formatPKR(cost.sandCost + cost.bajriCost)}`,
      `• Labour: ${formatPKR(cost.labourCost)}`,
      `• 10% Contingency Buffer: ${formatPKR(cost.buffer10Percent)}`,
      `*Total Estimated Cost: ${formatPKR(cost.grandTotal)}*`,
    ].join('\n');

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onShowToast('Estimate formatted for WhatsApp & copied to clipboard!');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCityRates(project.plot.city, draftRates);
    setEditingRates(false);
    onShowToast(`Updated ${project.plot.city} material rates!`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header matching Screenshot 2 */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-11 h-11 rounded-2xl bg-white border border-[#DCE8E1] flex items-center justify-center text-[#112A1E] hover:border-[#0E9F5D]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-[#112A1E]">{t.materialCosting}</h1>
        <button
          type="button"
          onClick={handleShareWhatsapp}
          aria-label="Share Estimate on WhatsApp"
          className="w-11 h-11 rounded-2xl bg-white border border-[#0E9F5D]/30 flex items-center justify-center text-[#0E9F5D] hover:bg-[#E7F6EE]"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* GharMap AI Banner */}
      <div className="bg-white border border-[#DCE8E1] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#405B4D]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#E7F6EE] text-[#0E9F5D] font-extrabold">
            AI
          </span>
          <span>
            GharMap AI · {project.plot.city} · Covered Area: {cost.coveredArea.toLocaleString()} sq ft ({cost.marlaArea} Marla)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={project.plot.city}
            onChange={(e) => {
              const nextCity = e.target.value as CityName;
              onUpdateProjectCity(nextCity);
              setDraftRates(cityRates[nextCity]);
            }}
            className="bg-[#F4F8F5] border border-[#DCE8E1] rounded-xl px-2.5 py-1 text-xs font-bold text-[#112A1E]"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              if (!hasFullBoq) {
                onUpgradeRequest();
                return;
              }
              setDraftRates(currentRates);
              setEditingRates(true);
            }}
            className="px-2.5 py-1 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] font-bold flex items-center gap-1 hover:bg-[#D5EFE1]"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Rates</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Pie Chart + Total Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pie Chart Card matching Screenshot 2 */}
          <div className="bg-[#C9EAD7]/70 border border-[#0E9F5D]/15 rounded-3xl p-6 space-y-5">
            {hasFullBoq ? (
              <>
                <div className="flex justify-center">
                  <svg width="170" height="170" viewBox="0 0 120 120" className="drop-shadow-xs">
                    {pieSlices.map((sl) => (
                      <path
                        key={sl.id}
                        d={describeSlice(60, 60, 54, sl.startAngle, sl.endAngle)}
                        fill={sl.color}
                        stroke="#E7F6EE"
                        strokeWidth="1.5"
                      />
                    ))}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm font-semibold text-[#112A1E]">
                  {pieSlices.map((sl) => (
                    <div key={sl.id} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: sl.color }}
                      />
                      <span className="truncate">
                        {sl.name} {sl.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Lock className="w-9 h-9 text-[#0E9F5D] mx-auto" />
                <p className="text-sm font-bold text-[#112A1E]">
                  Free Plan: Basic Total Estimate Only
                </p>
                <p className="text-xs text-[#405B4D]">
                  Upgrade to Pro to unlock Pie Chart breakdown, itemized BOQ quantities, city rate editing, PDF & WhatsApp export.
                </p>
                <button
                  type="button"
                  onClick={onUpgradeRequest}
                  className="px-4 py-2 rounded-xl bg-[#0E9F5D] text-white text-xs font-bold"
                >
                  Unlock Full BOQ Breakdown
                </button>
              </div>
            )}
          </div>

          {/* Green Total Estimated Cost Card matching Screenshot 2 */}
          <div className="bg-[#0E9F5D] rounded-3xl p-5 text-white space-y-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-white/85 font-medium">Total Estimated Cost</p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Includes Materials + Labour + 10% Buffer ({formatPKR(cost.buffer10Percent)})
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold tabular-nums whitespace-nowrap">
                {formatPKR(cost.grandTotal)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!hasFullBoq) {
                    onUpgradeRequest();
                    return;
                  }
                  onExportPDF();
                }}
                className="min-h-[48px] px-4 rounded-2xl bg-white text-[#0E9F5D] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F1FAF5] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadPdf}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsapp}
                className="min-h-[48px] px-4 rounded-2xl bg-[#097B47] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#07643A] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cost Breakdown List + BOQ Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#112A1E]">
              Cost Breakdown (PKR)
            </h2>
            <span className="text-xs font-semibold text-[#546E60]">
              Formula: 85% Covered ({cost.coveredArea.toLocaleString()} sq ft)
            </span>
          </div>

          {hasFullBoq ? (
            <>
              <div className="space-y-2.5">
                {breakdownItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#DCE8E1] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-[#E7F6EE] flex items-center justify-center text-[#0E9F5D] shrink-0">
                        {item.icon === 'cement' && <Layers className="w-5 h-5" />}
                        {item.icon === 'bricks' && <Grid3X3 className="w-5 h-5" />}
                        {item.icon === 'steel' && <Sparkles className="w-5 h-5" />}
                        {item.icon === 'sand' && <Layers className="w-5 h-5" />}
                        {item.icon === 'tiles' && <Grid3X3 className="w-5 h-5" />}
                        {item.icon === 'paint' && <PaintBucket className="w-5 h-5" />}
                        {item.icon === 'labour' && <Hammer className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-[#112A1E] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#546E60] truncate">{item.sub}</p>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base font-extrabold text-[#112A1E] tabular-nums shrink-0">
                      {formatPKR(item.amount)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Complete BOQ Table */}
              <div className="bg-white border border-[#DCE8E1] rounded-3xl p-4 sm:p-5 shadow-xs overflow-x-auto">
                <h3 className="text-sm font-extrabold text-[#112A1E] mb-3">
                  Bill of Quantities (BOQ Table)
                </h3>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2ECE6] text-[#546E60]">
                      <th className="py-2 pr-2 font-semibold">Item</th>
                      <th className="py-2 px-2 font-semibold text-right">Qty</th>
                      <th className="py-2 px-2 font-semibold text-right">Rate</th>
                      <th className="py-2 pl-2 font-semibold text-right">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F5F2] tabular-nums">
                    {breakdownItems.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2.5 pr-2 font-semibold text-[#112A1E]">{row.name}</td>
                        <td className="py-2.5 px-2 text-right text-[#405B4D]">
                          {row.qty} {row.unit}
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#405B4D]">
                          {row.rate.toLocaleString()}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-bold text-[#112A1E]">
                          {row.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#F6F9F7]">
                      <td colSpan={3} className="py-2.5 pr-2 font-semibold text-[#405B4D]">
                        Contingency Buffer (10%)
                      </td>
                      <td className="py-2.5 pl-2 text-right font-bold text-[#0E9F5D]">
                        {cost.buffer10Percent.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-[#E7F6EE]">
                      <td colSpan={3} className="py-3 pr-2 font-extrabold text-[#112A1E]">
                        Grand Total Estimated Cost
                      </td>
                      <td className="py-3 pl-2 text-right font-extrabold text-[#0E9F5D]">
                        {formatPKR(cost.grandTotal)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white border border-[#DCE8E1] rounded-3xl p-6 text-center space-y-3">
              <p className="text-base font-bold text-[#112A1E]">
                Estimated Summary for {project.plot.width}×{project.plot.length} ft Plot
              </p>
              <p className="text-sm text-[#546E60]">
                Total Material + Labour + 10% Buffer: <strong className="text-[#0E9F5D]">{formatPKR(cost.grandTotal)}</strong>
              </p>
              <button
                type="button"
                onClick={onUpgradeRequest}
                className="min-h-[44px] px-5 rounded-2xl bg-[#0E9F5D] text-white text-sm font-bold"
              >
                Upgrade to Pro for Full BOQ Table & City Rates
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inline City Rates Editor Modal */}
      {editingRates && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleSaveRates}
            className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#112A1E]">
                Edit {project.plot.city} Market Rates (PKR)
              </h3>
              <button
                type="button"
                onClick={() => setEditingRates(false)}
                className="w-9 h-9 rounded-full bg-[#F4F8F5] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {(
                [
                  ['cementPerBag', 'Cement / Bag'],
                  ['brickPerPc', 'Brick / Piece'],
                  ['steelPerKg', 'Steel / Kg'],
                  ['sandPerCft', 'Sand / Cft'],
                  ['bajriPerCft', 'Bajri / Cft'],
                  ['tilesPerSqFt', 'Tiles / Sq Ft'],
                  ['paintPerSqFt', 'Paint / Sq Ft'],
                  ['labourPerSqFt', 'Labour / Sq Ft'],
                ] as [keyof CityMaterialRates, string][]
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block font-semibold text-[#405B4D] mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={draftRates[field]}
                    onChange={(e) =>
                      setDraftRates((prev) => ({
                        ...prev,
                        [field]: Math.max(1, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#F4F8F5] border border-[#DCE8E1] font-bold tabular-nums"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#0E9F5D] hover:bg-[#0A7D49] text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save {project.plot.city} Rates</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
