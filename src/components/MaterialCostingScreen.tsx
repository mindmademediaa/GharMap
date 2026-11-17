import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  Edit3,
  Layers,
  Hammer,
  Grid3X3,
  PaintBucket,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { GLOBAL_REGIONS, TRANSLATIONS, getRegionConfig } from '../data/constants';
import {
  AllRegionRates,
  GlobalRegionCode,
  Language,
  Project,
  RegionalMaterialRates,
} from '../types/gharmap';
import { calculateMaterialCosting, formatCurrency } from '../utils/calculations';

interface MaterialCostingScreenProps {
  language: Language;
  project: Project;
  regionRates: AllRegionRates;
  onBack: () => void;
  onUpdateProjectRegion: (region: GlobalRegionCode) => void;
  onUpdateRegionRates: (region: GlobalRegionCode, rates: RegionalMaterialRates) => void;
  onExportPDF: () => void;
  onShowToast: (msg: string) => void;
}

export const MaterialCostingScreen: React.FC<MaterialCostingScreenProps> = ({
  language,
  project,
  regionRates,
  onBack,
  onUpdateProjectRegion,
  onUpdateRegionRates,
  onExportPDF,
  onShowToast,
}) => {
  const t = TRANSLATIONS[language];
  const [editingRates, setEditingRates] = useState(false);
  const currentRates = regionRates[project.plot.region];
  const [draftRates, setDraftRates] = useState<RegionalMaterialRates>(currentRates);
  const reg = getRegionConfig(project.plot.region);
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
      name: 'Bricks / Blocks',
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
      name: 'Structural Steel (Rebar)',
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
      name: 'Sand & Gravel Aggregate',
      sub: `${cost.sandCft.toLocaleString()} cft Sand · ${cost.bajriCft.toLocaleString()} cft Aggregate`,
      qty: `${cost.sandCft} / ${cost.bajriCft}`,
      unit: 'Cft',
      rate: Number(((currentRates.sandPerCft + currentRates.bajriPerCft) / 2).toFixed(2)),
      amount: cost.sandCost + cost.bajriCost,
      color: '#6CD2A0',
      icon: 'sand',
    },
    {
      id: 'tiles',
      name: 'Flooring & Tiles',
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
      name: 'Interior & Exterior Finish',
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
      sub: `${cost.coveredAreaSqFt.toLocaleString()} sq ft (${cost.floorsMultiplier}F) @ ${reg.currencySymbol}${currentRates.labourPerSqFt}/sq ft`,
      qty: cost.coveredAreaSqFt.toLocaleString(),
      unit: 'Sq Ft',
      rate: currentRates.labourPerSqFt,
      amount: cost.labourCost,
      color: '#194732',
      icon: 'labour',
    },
  ];

  const subtotalBase = Math.max(1, cost.materialsTotal + cost.labourCost);
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

  const handleShareSummary = () => {
    const text = [
      `*GharMap AI - Construction Estimate (${reg.countryName})*`,
      `Project: ${project.name} (${project.plot.category})`,
      `Plot Area: ${cost.totalAreaSqFt.toLocaleString()} sq ft (${cost.totalAreaSqM} m²) · Floors: ${cost.floorsMultiplier}`,
      `• Cement: ${cost.cementBags} bags (${formatCurrency(cost.cementCost, project.plot.region)})`,
      `• Bricks/Blocks: ${cost.bricksCount.toLocaleString()} pcs (${formatCurrency(cost.bricksCost, project.plot.region)})`,
      `• Steel Rebar: ${cost.steelKg.toLocaleString()} kg (${formatCurrency(cost.steelCost, project.plot.region)})`,
      `• Labour: ${formatCurrency(cost.labourCost, project.plot.region)}`,
      `*Grand Total (+10% Buffer): ${formatCurrency(cost.grandTotal, project.plot.region)}*`,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    onShowToast('Estimate formatted & copied to clipboard!');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRegionRates(project.plot.region, draftRates);
    setEditingRates(false);
    onShowToast(`Updated ${reg.currencyCode} material rates!`);
  };

  return (
    <div className="space-y-5">
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
          onClick={handleShareSummary}
          aria-label="Share Estimate"
          className="w-11 h-11 rounded-2xl bg-white border border-[#0E9F5D]/30 flex items-center justify-center text-[#0E9F5D] hover:bg-[#E7F6EE]"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Region / Currency & Covered Area Bar */}
      <div className="bg-white border border-[#DCE8E1] rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#405B4D]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#E7F6EE] text-[#0E9F5D] font-extrabold">
            BOQ
          </span>
          <span>
            {cost.coveredAreaSqFt.toLocaleString()} sq ft ({cost.coveredAreaSqM} m²) across {cost.floorsMultiplier}{' '}
            {cost.floorsMultiplier === 1 ? 'floor' : 'floors'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={project.plot.region}
            onChange={(e) => {
              const nextReg = e.target.value as GlobalRegionCode;
              onUpdateProjectRegion(nextReg);
              setDraftRates(regionRates[nextReg]);
            }}
            className="bg-[#F4F8F5] border border-[#DCE8E1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#112A1E]"
          >
            {GLOBAL_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.countryName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setDraftRates(currentRates);
              setEditingRates(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#E7F6EE] text-[#0E9F5D] font-bold flex items-center gap-1 hover:bg-[#D5EFE1]"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Rates</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#C9EAD7]/70 border border-[#0E9F5D]/15 rounded-3xl p-6 space-y-5">
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
          </div>

          <div className="bg-[#0E9F5D] rounded-3xl p-5 text-white space-y-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <p className="text-xs text-white/85 font-medium">
                  Total Estimated Cost ({reg.currencyCode})
                </p>
                <p className="text-[11px] text-white/75 mt-0.5">
                  Includes Materials + Labour + 10% Buffer ({formatCurrency(cost.buffer10Percent, project.plot.region)})
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold tabular-nums whitespace-nowrap">
                {formatCurrency(cost.grandTotal, project.plot.region)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onExportPDF}
                className="min-h-[48px] px-4 rounded-2xl bg-white text-[#0E9F5D] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#F1FAF5]"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadPdf}</span>
              </button>
              <button
                type="button"
                onClick={handleShareSummary}
                className="min-h-[48px] px-4 rounded-2xl bg-[#097B47] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#07643A]"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-extrabold text-[#112A1E]">
            Cost Breakdown ({reg.currencyCode})
          </h2>

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
                  {formatCurrency(item.amount, project.plot.region)}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#DCE8E1] rounded-3xl p-4 sm:p-5 shadow-xs overflow-x-auto">
            <h3 className="text-sm font-extrabold text-[#112A1E] mb-3">
              Bill of Quantities (BOQ Table)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2ECE6] text-[#546E60]">
                  <th className="py-2 pr-2 font-semibold">Item</th>
                  <th className="py-2 px-2 font-semibold text-right">Qty</th>
                  <th className="py-2 px-2 font-semibold text-right">Rate ({reg.currencyCode})</th>
                  <th className="py-2 pl-2 font-semibold text-right">Total</th>
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
                      {formatCurrency(row.amount, project.plot.region)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#F6F9F7]">
                  <td colSpan={3} className="py-2.5 pr-2 font-semibold text-[#405B4D]">
                    Contingency Buffer (10%)
                  </td>
                  <td className="py-2.5 pl-2 text-right font-bold text-[#0E9F5D]">
                    {formatCurrency(cost.buffer10Percent, project.plot.region)}
                  </td>
                </tr>
                <tr className="bg-[#E7F6EE]">
                  <td colSpan={3} className="py-3 pr-2 font-extrabold text-[#112A1E]">
                    Grand Total Estimated Cost
                  </td>
                  <td className="py-3 pl-2 text-right font-extrabold text-[#0E9F5D]">
                    {formatCurrency(cost.grandTotal, project.plot.region)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingRates && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <form
            onSubmit={handleSaveRates}
            className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#112A1E]">
                Edit {reg.countryName} Rates
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
                  ['bajriPerCft', 'Aggregate / Cft'],
                  ['tilesPerSqFt', 'Tiles / Sq Ft'],
                  ['paintPerSqFt', 'Paint / Sq Ft'],
                  ['labourPerSqFt', 'Labour / Sq Ft'],
                ] as [keyof RegionalMaterialRates, string][]
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="block font-semibold text-[#405B4D] mb-1">
                    {label} ({reg.currencyCode})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={draftRates[field]}
                    onChange={(e) =>
                      setDraftRates((prev) => ({
                        ...prev,
                        [field]: Math.max(0.05, Number(e.target.value) || 0),
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
              <span>Save Regional Rates</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
