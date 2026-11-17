import React from 'react';
import { getRegionConfig } from '../data/constants';
import { AllRegionRates, Project, UserProfile } from '../types/gharmap';
import {
  calculateInfrastructureSpecs,
  calculateMaterialCosting,
  formatCurrency,
} from '../utils/calculations';

interface PrintReportProps {
  project: Project;
  regionRates: AllRegionRates;
  user: UserProfile;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  project,
  regionRates,
  user,
}) => {
  const rates = regionRates[project.plot.region];
  const reg = getRegionConfig(project.plot.region);
  const cost = calculateMaterialCosting(project.plot, rates);
  const infra = calculateInfrastructureSpecs(project.plot);
  const variation =
    project.variations.find((v) => v.id === project.selectedVariationId) ||
    project.variations[0];
  const { frontWidth, backWidth, leftLength, rightLength } = project.plot.sides;
  const maxW = Math.max(frontWidth, backWidth);
  const maxL = Math.max(leftLength, rightLength);

  const brandHeader =
    user.companyName || 'GharMap AI — Architectural & Structural Report';

  return (
    <div className="print-only p-6 text-[#112A1E]">
      <div className="flex items-center justify-between border-b-2 border-[#0E9F5D] pb-4 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">{brandHeader}</h1>
          <p className="text-sm text-[#405B4D]">
            {project.name} · {project.plot.category} · {reg.countryName}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-bold">
            Sides: F {frontWidth}&apos; / B {backWidth}&apos; / L {leftLength}&apos; / R {rightLength}&apos;
          </p>
          <p>
            Area: {cost.totalAreaSqFt.toLocaleString()} sq ft ({cost.totalAreaSqM} m²) · {cost.floorsMultiplier} Floors
          </p>
          <p>
            Pillars: {infra.columnWidthIn}&quot;×{infra.columnDepthIn}&quot; ({infra.totalPlannedStories} total stories load)
          </p>
        </div>
      </div>

      {/* 2D Floor Plan Blueprint */}
      <div className="mb-5 border border-[#DCE8E1] rounded-xl p-4">
        <h2 className="text-base font-bold mb-2">
          2D Blueprint — {variation.name} ({project.style})
        </h2>
        <svg viewBox={`-4 -4 ${maxW + 8} ${maxL + 8}`} className="w-full max-h-[300px]">
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
                y={rm.y + rm.h / 2 - 0.6}
                textAnchor="middle"
                fontSize="1.5"
                fontWeight="700"
                fill="#0E9F5D"
              >
                {rm.label}
              </text>
              <text
                x={rm.x + rm.w / 2}
                y={rm.y + rm.h / 2 + 1.2}
                textAnchor="middle"
                fontSize="1.15"
                fill="#405B4D"
              >
                {rm.w}&apos; × {rm.h}&apos; (Wall {rm.wallThicknessIn}&quot;)
              </text>
            </g>
          ))}
        </svg>
        <p className="text-xs text-[#405B4D] mt-2">
          <strong>Structural Summary:</strong> {infra.engineeringSummary}
        </p>
      </div>

      {/* Material BOQ Table */}
      <div>
        <h2 className="text-base font-bold mb-2">
          Material Costing &amp; BOQ ({reg.currencyCode})
        </h2>
        <table className="w-full text-xs border border-[#DCE8E1] border-collapse">
          <thead>
            <tr className="bg-[#E7F6EE]">
              <th className="p-2 border border-[#DCE8E1] text-left">Item</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Qty</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Rate ({reg.currencyCode})</th>
              <th className="p-2 border border-[#DCE8E1] text-right">Amount ({reg.currencyCode})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Cement (50kg Bags)</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.cementBags.toLocaleString()}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.cementPerBag}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.cementCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Bricks / Blocks</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.bricksCount.toLocaleString()}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.brickPerPc}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.bricksCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Structural Steel Rebar</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.steelKg.toLocaleString()} kg</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.steelPerKg}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.steelCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Sand &amp; Gravel Aggregate</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.sandCft} + {cost.bajriCft} cft</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.sandPerCft} / {rates.bajriPerCft}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.sandCost + cost.bajriCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Flooring &amp; Finishes</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.tilesSqFt} / {cost.paintSqFt} sq ft</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.tilesPerSqFt} / {rates.paintPerSqFt}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.tilesCost + cost.paintCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td className="p-2 border border-[#DCE8E1]">Construction Labour</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{cost.coveredAreaSqFt.toLocaleString()} sq ft</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{rates.labourPerSqFt}</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.labourCost, project.plot.region)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-2 border border-[#DCE8E1] font-semibold">10% Contingency Buffer</td>
              <td className="p-2 border border-[#DCE8E1] text-right font-semibold">{formatCurrency(cost.buffer10Percent, project.plot.region)}</td>
            </tr>
            <tr className="bg-[#E7F6EE] font-extrabold">
              <td colSpan={3} className="p-2 border border-[#DCE8E1]">Grand Total Estimated Cost</td>
              <td className="p-2 border border-[#DCE8E1] text-right">{formatCurrency(cost.grandTotal, project.plot.region)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
