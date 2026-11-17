import React from 'react';
import {
  AllCityRates,
  PlanTier,
  Project,
  UserProfile,
} from '../types/gharmap';
import { calculateMaterialCosting, formatPKR } from '../utils/calculations';

interface PrintReportProps {
  project: Project;
  cityRates: AllCityRates;
  plan: PlanTier;
  user: UserProfile;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  project,
  cityRates,
  plan,
  user,
}) => {
  const rates = cityRates[project.plot.city];
  const cost = calculateMaterialCosting(project.plot, rates);
  const variation =
    project.variations.find((v) => v.id === project.selectedVariationId) ||
    project.variations[0];
  const W = project.plot.width;
  const L = project.plot.length;

  const brandHeader =
    plan === 'premium' && user.companyName
      ? user.companyName
      : 'GharMap AI — Construction Blueprint & BOQ';

  return (
    <div className="print-only p-6 text-[#112A1E]">
      <div className="flex items-center justify-between border-b-2 border-[#0E9F5D] pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">{brandHeader}</h1>
          <p className="text-sm text-[#405B4D]">
            Project: {project.name} · City: {project.plot.city} · Facing: {project.plot.facing}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold">
            Plot: {W}&apos; × {L}&apos; ({cost.marlaArea} Marla)
          </p>
          <p>Covered Area: {cost.coveredArea.toLocaleString()} sq ft</p>
          <p>Style: {project.style}</p>
        </div>
      </div>

      {/* 2D Floor Plan Blueprint */}
      <div className="mb-6 border border-[#DCE8E1] rounded-xl p-4">
        <h2 className="text-base font-bold mb-2">
          2D Architectural Floor Plan — {variation.name}
        </h2>
        <svg viewBox={`-3 -3 ${W + 6} ${L + 6}`} className="w-full max-h-[340px]">
          {variation.rooms.map((rm) => (
            <g key={rm.id}>
              <rect
                x={rm.x}
                y={rm.y}
                width={rm.w}
                height={rm.h}
                fill={rm.type === 'sehan' ? '#EEF9F2' : '#FFFFFF'}
                stroke="#112A1E"
                strokeWidth="0.45"
                strokeDasharray={rm.type === 'sehan' ? '0.8 0.5' : undefined}
              />
              <text
                x={rm.x + rm.w / 2}
                y={rm.y + rm.h / 2 - 0.5}
                textAnchor="middle"
                fontSize="1.6"
                fontWeight="700"
                fill="#0E9F5D"
              >
                {rm.label}
              </text>
              <text
                x={rm.x + rm.w / 2}
                y={rm.y + rm.h / 2 + 1.4}
                textAnchor="middle"
                fontSize="1.2"
                fill="#405B4D"
              >
                {rm.w}&apos; × {rm.h}&apos;
              </text>
            </g>
          ))}
        </svg>
        <p className="text-xs text-[#405B4D] mt-2">
          <strong>AI Note:</strong> {variation.aiNote}
        </p>
      </div>

      {/* Material BOQ Table */}
      <div>
        <h2 className="text-base font-bold mb-2">
          Bill of Quantities & Material Costing ({project.plot.city})
        </h2>
        <table className="w-full text-xs border border-[#DCE8E1] border-collapse">
          <thead>
            <tr className="bg-[#E7F6EE]">
              <th className="p-2 border border-[#DCE8E1] text-left">Material / Item</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Quantity</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Rate (PKR)</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Cement (50kg Bags)</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.cementBags.toLocaleString()}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.cementPerBag}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatPKR(cost.cementCost)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Bricks (Awwal)</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.bricksCount.toLocaleString()}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.brickPerPc}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatPKR(cost.bricksCost)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Steel (Grade 60)</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.steelKg.toLocaleString()} kg</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.steelPerKg}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatPKR(cost.steelCost)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Sand & Bajri (Aggregate)</td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {cost.sandCft} + {cost.bajriCft} cft
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {rates.sandPerCft} / {rates.bajriPerCft}
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {formatPKR(cost.sandCost + cost.bajriCost)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Tiles & Paint</td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {cost.tilesSqFt} / {cost.paintSqFt} sq ft
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {rates.tilesPerSqFt} / {rates.paintPerSqFt}
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {formatPKR(cost.tilesCost + cost.paintCost)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Construction Labour</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.coveredArea.toLocaleString()} sq ft</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.labourPerSqFt}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatPKR(cost.labourCost)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-2 border border-[#DCE8E1] font-semibold">
                10% Contingency Buffer
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right font-semibold">
                {formatPKR(cost.buffer10Percent)}
              </td>
            </tr>
            <tr className="bg-[#E7F6EE] font-extrabold">
              <td colSpan={3} className="p-2 border border-[#DCE8E1]">
                Grand Total Estimated Cost
              </td>
              <td className="p-2 border border-[#DCE8E1] text-right">
                {formatPKR(cost.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
