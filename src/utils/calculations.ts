import { BUDGET_MULTIPLIER, getRegionConfig } from '../data/constants';
import {
  CostBreakdownResult,
  DesignStyle,
  DesignVariation,
  FloorRoomBlock,
  GlobalRegionCode,
  PlotSides,
  PlotSpecs,
  RegionalMaterialRates,
  StructuralCalculationResult,
} from '../types/gharmap';

export function formatCurrency(amount: number, regionCode: GlobalRegionCode): string {
  const reg = getRegionConfig(regionCode);
  return `${reg.currencySymbol}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatCompactCurrency(amount: number, regionCode: GlobalRegionCode): string {
  const reg = getRegionConfig(regionCode);
  if (amount >= 1_000_000) {
    return `${reg.currencySymbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${reg.currencySymbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, regionCode);
}

export function calculatePlotAreaSqFt(sides: PlotSides): number {
  const avgW = (Math.max(10, sides.frontWidth) + Math.max(10, sides.backWidth)) / 2;
  const avgL = (Math.max(12, sides.leftLength) + Math.max(12, sides.rightLength)) / 2;
  return Math.round(avgW * avgL);
}

export function sqFtToSqM(sqFt: number): number {
  return Number((sqFt * 0.092903).toFixed(1));
}

export function ftToMeters(ft: number): number {
  return Number((ft * 0.3048).toFixed(2));
}

export function calculateInfrastructureSpecs(plot: PlotSpecs): StructuralCalculationResult {
  const infra = plot.infrastructure;
  const totalStories = Math.max(1, infra.currentFloors + infra.plannedFutureFloors);
  const avgW = (plot.sides.frontWidth + plot.sides.backWidth) / 2;
  const avgL = (plot.sides.leftLength + plot.sides.rightLength) / 2;

  const isCommercial =
    plot.category === 'Commercial Market' ||
    plot.category === 'Multi-Story Building' ||
    plot.category === 'Mixed-Use Infrastructure' ||
    plot.category === 'Warehouse / Industrial';

  const soilFactor =
    infra.soilType === 'Soft / Reclaimed'
      ? 1.35
      : infra.soilType === 'Sandy / Alluvial'
        ? 1.15
        : infra.soilType === 'Hard Rock'
          ? 0.85
          : 1.0;

  const seismicBump =
    infra.seismicZone === 'High (Zone 3-4)'
      ? 3
      : infra.seismicZone === 'Moderate (Zone 2)'
        ? 1.5
        : 0;

  // Compute recommended column size in inches
  let colW = 9 + Math.min(12, totalStories * 1.5) + (isCommercial ? 3 : 0);
  let colD = 12 + Math.min(14, totalStories * 2) + (isCommercial ? 3 : 0) + seismicBump;
  colW = Math.round(colW / 3) * 3;
  colD = Math.round(colD / 3) * 3;
  colW = Math.max(9, Math.min(24, colW));
  colD = Math.max(12, Math.min(30, colD));

  if (infra.customColumnWidthIn) colW = infra.customColumnWidthIn;
  if (infra.customColumnDepthIn) colD = infra.customColumnDepthIn;

  const gridSpacing = isCommercial ? 16 : 13.5;
  const colsX = Math.max(2, Math.ceil(avgW / gridSpacing) + 1);
  const colsY = Math.max(2, Math.ceil(avgL / gridSpacing) + 1);
  const estimatedColumnsCount = colsX * colsY;

  const barCount = Math.min(16, 4 + totalStories * 2 + (isCommercial ? 2 : 0));
  const barDiaMm = totalStories >= 4 ? 20 : totalStories >= 2 ? 16 : 12;
  const rebarSpec = `${barCount} × Ø${barDiaMm}mm Deformed Bars`;
  const tieSpec = `Ø10mm Stirrups @ ${infra.seismicZone === 'High (Zone 3-4)' ? '4"' : '6"'} c/c (Confined Zone 4")`;

  const footingType =
    totalStories >= 4 || infra.soilType === 'Soft / Reclaimed'
      ? 'Reinforced Mat / Raft Foundation'
      : 'Isolated RCC Pad Footings + Plinth Tie Beams';

  const padSide = Number(
    Math.min(11, Math.max(4, (3.5 + totalStories * 0.85) * soilFactor)).toFixed(1),
  );
  const footingSizeFt =
    totalStories >= 4 || infra.soilType === 'Soft / Reclaimed'
      ? `${Math.round(avgW)}' × ${Math.round(avgL)}' Full Mat (${Math.round(14 + totalStories * 2)}" thick)`
      : `${padSide}' × ${padSide}' Pad`;

  const footingDepthFt = Number(
    Math.min(12, Math.max(4, (3.5 + totalStories * 0.7) * soilFactor)).toFixed(1),
  );

  const beamW = colW >= 12 ? 12 : 9;
  const beamD = 12 + totalStories * 2 + (isCommercial ? 3 : 0);
  const beamSizeIn = `${beamW}" × ${Math.min(30, beamD)}"`;

  const slabThicknessIn = totalStories >= 3 || isCommercial ? 6.5 : 5.5;
  const exteriorWallIn = infra.customWallThicknessIn || (totalStories >= 3 ? 12 : 9);
  const partitionWallIn = 4.5;

  const concreteGrade =
    totalStories >= 5
      ? 'M30 (4500 PSI)'
      : totalStories >= 3
        ? 'M25 (3750 PSI)'
        : 'M20 (3000 PSI)';

  const steelGrade =
    infra.seismicZone === 'High (Zone 3-4)' || totalStories >= 3
      ? 'Grade 60 (ASTM A615 · 420 MPa)'
      : 'Grade 60 / BS4449 B500B';

  const engineeringSummary = `Designed for ${totalStories} total stor${totalStories === 1 ? 'y' : 'ies'} (${infra.currentFloors} built + ${infra.plannedFutureFloors} future expansion) on ${infra.soilType} soil (${infra.seismicZone}). Use ${colW}"×${colD}" RCC columns with ${rebarSpec} and ${footingType}.`;

  return {
    totalPlannedStories: totalStories,
    columnWidthIn: colW,
    columnDepthIn: colD,
    columnGridSpacingFt: Number((avgW / (colsX - 1)).toFixed(1)),
    estimatedColumnsCount,
    rebarSpec,
    tieSpec,
    footingType,
    footingSizeFt,
    footingDepthFt,
    beamSizeIn,
    slabThicknessIn,
    exteriorWallIn,
    partitionWallIn,
    concreteGrade,
    steelGrade,
    engineeringSummary,
  };
}

export function calculateMaterialCosting(
  plot: PlotSpecs,
  rates: RegionalMaterialRates,
): CostBreakdownResult {
  const totalAreaSqFt = Math.max(100, calculatePlotAreaSqFt(plot.sides));
  const totalAreaSqM = sqFtToSqM(totalAreaSqFt);
  const floorsMultiplier = Math.max(1, plot.infrastructure.currentFloors);
  const coveredPerFloor = Math.round(totalAreaSqFt * 0.85);
  const coveredAreaSqFt = coveredPerFloor * floorsMultiplier;
  const coveredAreaSqM = sqFtToSqM(coveredAreaSqFt);

  const tierFactor = BUDGET_MULTIPLIER[plot.budget] ?? 1.0;

  const cementBags = Math.round(coveredAreaSqFt * 0.7);
  const bricksCount = Math.round(coveredAreaSqFt * 28);
  const steelKg = Math.round(coveredAreaSqFt * (3.2 + plot.infrastructure.plannedFutureFloors * 0.45));
  const sandCft = Math.round(coveredAreaSqFt * 1.5);
  const bajriCft = Math.round(coveredAreaSqFt * 1.2);
  const tilesSqFt = Math.round(coveredAreaSqFt * 0.9);
  const paintSqFt = Math.round(coveredAreaSqFt * 2.4);

  const cementCost = Math.round(cementBags * rates.cementPerBag);
  const bricksCost = Math.round(bricksCount * rates.brickPerPc);
  const steelCost = Math.round(steelKg * rates.steelPerKg);
  const sandCost = Math.round(sandCft * rates.sandPerCft);
  const bajriCost = Math.round(bajriCft * rates.bajriPerCft);
  const tilesCost = Math.round(tilesSqFt * rates.tilesPerSqFt * tierFactor);
  const paintCost = Math.round(paintSqFt * rates.paintPerSqFt * tierFactor);

  const materialsTotal =
    cementCost +
    bricksCost +
    steelCost +
    sandCost +
    bajriCost +
    tilesCost +
    paintCost;

  const labourCost = Math.round(coveredAreaSqFt * rates.labourPerSqFt);
  const subtotal = materialsTotal + labourCost;
  const buffer10Percent = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + buffer10Percent;

  return {
    totalAreaSqFt,
    totalAreaSqM,
    coveredAreaSqFt,
    coveredAreaSqM,
    floorsMultiplier,
    cementBags,
    cementCost,
    bricksCount,
    bricksCost,
    steelKg,
    steelCost,
    sandCft,
    sandCost,
    bajriCft,
    bajriCost,
    tilesSqFt,
    tilesCost,
    paintSqFt,
    paintCost,
    materialsTotal,
    labourCost,
    buffer10Percent,
    grandTotal,
  };
}

/**
 * Generates 8+ distinct architectural blueprint variations tailored to irregular 4-sided plots,
 * global project categories (Home, Commercial Market, Multi-Story Building, Warehouse, Mixed-Use),
 * and explicit engineering wall thickness & opening dimensions.
 */
export function generateDesignVariations(
  plot: PlotSpecs,
  style: DesignStyle,
  batchOffset = 0,
): DesignVariation[] {
  const maxW = Math.max(plot.sides.frontWidth, plot.sides.backWidth, 20);
  const maxL = Math.max(plot.sides.leftLength, plot.sides.rightLength, 24);
  const c = plot.counts;
  const infra = calculateInfrastructureSpecs(plot);
  const extWall = infra.exteriorWallIn;
  const intWall = infra.partitionWallIn;

  const isCommercial =
    plot.category === 'Commercial Market' ||
    plot.category === 'Multi-Story Building' ||
    plot.category === 'Mixed-Use Infrastructure' ||
    plot.category === 'Warehouse / Industrial';

  const archetypes: {
    key: DesignVariation['layoutArchetype'];
    title: string;
    subtitle: string;
    score: string;
  }[] = [
    {
      key: 'courtyard-center',
      title: isCommercial ? 'Central Atrium Arcade' : 'Central Courtyard Plan',
      subtitle: 'Balanced natural ventilation core with perimeter rooms',
      score: '97% Space Fit',
    },
    {
      key: 'split-wing',
      title: isCommercial ? 'Twin Retail Wing & Corridor' : 'Split Master & Guest Wing',
      subtitle: 'Private rear zone separated from active front hall',
      score: '95% Privacy',
    },
    {
      key: 'open-atrium',
      title: isCommercial ? 'Open-Span Showroom Grid' : 'Open-Concept Great Room',
      subtitle: 'Wide unobstructed central span for daylight & circulation',
      score: '96% Daylight',
    },
    {
      key: 'corridor-arcade',
      title: isCommercial ? 'Double-Row Market Bazaar' : 'Gallery Spine Layout',
      subtitle: 'Direct central circulation spine serving all units',
      score: '94% Efficiency',
    },
    {
      key: 'double-frontage',
      title: isCommercial ? 'Corner Glass Frontage' : 'Dual-Entry Terrace Layout',
      subtitle: 'Maximized street-facing exposure and parking bay',
      score: '95% Street View',
    },
    {
      key: 'l-shaped-garden',
      title: isCommercial ? 'L-Plaza Courtyard Mall' : 'L-Shaped Garden Wrap',
      subtitle: 'Outdoor terrace & garden pocket along side elevation',
      score: '93% Airflow',
    },
    {
      key: 'compact-core',
      title: isCommercial ? 'Stacked Core Office Block' : 'Compact Plumbing Core',
      subtitle: 'Grouped wet walls & stair core minimizing MEP run lengths',
      score: '98% Cost Optimal',
    },
    {
      key: 'executive-suite',
      title: isCommercial ? 'Executive Anchor + Units' : 'Executive Front Drawing Suite',
      subtitle: 'Dedicated formal reception / anchor bay at front elevation',
      score: '94% Zoning',
    },
  ];

  const primaryUnitLabel = isCommercial ? 'Shop / Unit' : 'Bedroom';
  const primaryUnitLabelUr = isCommercial ? 'دکان / یونٹ' : 'بیڈروم';
  const primaryType = isCommercial ? 'shop' : 'bedroom';
  const loungeLabel = isCommercial ? 'Main Lobby / Hall' : 'Living Lounge';
  const loungeLabelUr = isCommercial ? 'مرکزی ہال / لابی' : 'لاؤنج';
  const kitchenLabel = isCommercial ? 'Pantry / Service' : 'Kitchen';
  const kitchenLabelUr = isCommercial ? 'پینٹری / سروس' : 'کچن';
  const sehanLabel = isCommercial ? 'Open Plaza / Atrium' : 'Courtyard / Patio';
  const sehanLabelUr = isCommercial ? 'اوپن پلازہ' : 'صحن / آنگن';
  const garageLabel = isCommercial ? 'Parking / Loading' : 'Garage / Porch';
  const garageLabelUr = isCommercial ? 'پارکنگ بے' : 'گیراج';

  return archetypes.map((arch, idx) => {
    const rooms: FloorRoomBlock[] = [];
    const variantSeed = (idx + batchOffset) % 8;

    // Normalize zones cleanly inside [0..maxW] x [0..maxL]
    const backH = Math.round(maxL * (variantSeed % 2 === 0 ? 0.36 : 0.4));
    const frontH = Math.round(
      maxL * (c.sehan > 0 || c.garage > 0 || c.baramda > 0 ? 0.26 : 0.18),
    );
    const midH = Math.max(8, maxL - backH - frontH);

    // 1. Back Zone (Units / Bedrooms + Baths + Store)
    const unitCount = Math.max(1, c.rooms);
    const hasBath = c.washrooms > 0;
    const hasStore = c.store > 0;

    if (arch.key === 'corridor-arcade' || arch.key === 'compact-core') {
      // 3-column rear split: Unit 1 | Bath/Core | Unit 2
      const sideW = Math.round(maxW * 0.38);
      const midW = Math.max(5, maxW - sideW * 2);
      rooms.push({
        id: `u1-${idx}`,
        label: `${primaryUnitLabel} 1`,
        urduLabel: `${primaryUnitLabelUr} ۱`,
        type: primaryType,
        x: 0,
        y: 0,
        w: sideW,
        h: backH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3.5\'×7\'',
        windowSizeLabel: '5\'×4\'',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `core-${idx}`,
        label: hasStore ? 'WC & Store' : 'Restroom Core',
        urduLabel: 'باتھ اور اسٹور',
        type: 'washroom',
        x: sideW,
        y: 0,
        w: midW,
        h: backH,
        wallThicknessIn: intWall,
        doorSizeLabel: '2.5\'×7\'',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `u2-${idx}`,
        label: unitCount > 1 ? `${primaryUnitLabel} 2` : isCommercial ? 'Office Suite' : 'Guest Suite',
        urduLabel: `${primaryUnitLabelUr} ۲`,
        type: primaryType,
        x: sideW + midW,
        y: 0,
        w: maxW - sideW - midW,
        h: backH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3.5\'×7\'',
        windowSizeLabel: '5\'×4\'',
        doorSide: 'bottom',
      });
    } else {
      const leftW = Math.round(maxW * (variantSeed === 1 ? 0.56 : 0.5));
      const rightW = maxW - leftW;
      const splitBathH = hasBath ? Math.max(5, Math.round(backH * 0.36)) : 0;

      rooms.push({
        id: `u1-${idx}`,
        label: isCommercial ? 'Anchor Unit A' : 'Master Suite',
        urduLabel: isCommercial ? 'یونٹ A' : 'ماسٹر بیڈروم',
        type: primaryType,
        x: 0,
        y: 0,
        w: leftW,
        h: backH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3.5\'×7\'',
        windowSizeLabel: '6\'×4.5\'',
        doorSide: 'bottom',
      });

      rooms.push({
        id: `u2-${idx}`,
        label: unitCount >= 2 ? `${primaryUnitLabel} 2` : isCommercial ? 'Back Office' : 'Bedroom 2',
        urduLabel: `${primaryUnitLabelUr} ۲`,
        type: primaryType,
        x: leftW,
        y: 0,
        w: rightW,
        h: backH - splitBathH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3.5\'×7\'',
        windowSizeLabel: '5\'×4\'',
        doorSide: 'left',
      });

      if (hasBath) {
        rooms.push({
          id: `bath-${idx}`,
          label: `${c.washrooms}× Bath`,
          urduLabel: 'باتھ رومز',
          type: 'washroom',
          x: leftW,
          y: backH - splitBathH,
          w: rightW,
          h: splitBathH,
          wallThicknessIn: intWall,
          doorSizeLabel: '2.5\'×7\'',
          doorSide: 'left',
        });
      }
    }

    // 2. Middle Zone (Lounge / Lobby + Kitchen / Extra Units)
    const midY = backH;
    const swapMid = variantSeed % 2 === 1;
    const loungeRatio = arch.key === 'open-atrium' ? 0.68 : 0.58;
    const loungeW = Math.round(maxW * loungeRatio);
    const kitchenW = maxW - loungeW;

    if (c.rooms >= 3 && arch.key === 'split-wing') {
      const thirdW = Math.round(maxW * 0.34);
      const midLoungeW = maxW - thirdW * 2;
      rooms.push({
        id: `u3-${idx}`,
        label: `${primaryUnitLabel} 3`,
        urduLabel: `${primaryUnitLabelUr} ۳`,
        type: primaryType,
        x: 0,
        y: midY,
        w: thirdW,
        h: midH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3.5\'×7\'',
        windowSizeLabel: '4\'×4\'',
        doorSide: 'right',
      });
      rooms.push({
        id: `lounge-${idx}`,
        label: loungeLabel,
        urduLabel: loungeLabelUr,
        type: isCommercial ? 'lobby' : 'lounge',
        x: thirdW,
        y: midY,
        w: midLoungeW,
        h: midH,
        wallThicknessIn: intWall,
        doorSizeLabel: '4\'×7\'',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `kitchen-${idx}`,
        label: kitchenLabel,
        urduLabel: kitchenLabelUr,
        type: 'kitchen',
        x: thirdW + midLoungeW,
        y: midY,
        w: maxW - thirdW - midLoungeW,
        h: midH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3\'×7\'',
        windowSizeLabel: '4\'×3.5\'',
        doorSide: 'left',
      });
    } else if (c.kitchen > 0) {
      rooms.push({
        id: `lounge-${idx}`,
        label: loungeLabel,
        urduLabel: loungeLabelUr,
        type: isCommercial ? 'lobby' : 'lounge',
        x: swapMid ? kitchenW : 0,
        y: midY,
        w: loungeW,
        h: midH,
        wallThicknessIn: intWall,
        doorSizeLabel: '4\'×7\'',
        windowSizeLabel: '6\'×4.5\'',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `kitchen-${idx}`,
        label: kitchenLabel,
        urduLabel: kitchenLabelUr,
        type: 'kitchen',
        x: swapMid ? 0 : loungeW,
        y: midY,
        w: kitchenW,
        h: midH,
        wallThicknessIn: extWall,
        doorSizeLabel: '3\'×7\'',
        windowSizeLabel: '4\'×3.5\'',
        doorSide: swapMid ? 'right' : 'left',
      });
    } else {
      rooms.push({
        id: `lounge-${idx}`,
        label: loungeLabel,
        urduLabel: loungeLabelUr,
        type: isCommercial ? 'lobby' : 'lounge',
        x: 0,
        y: midY,
        w: maxW,
        h: midH,
        wallThicknessIn: extWall,
        doorSizeLabel: '5\'×8\'',
        windowSizeLabel: '8\'×5\'',
        doorSide: 'bottom',
      });
    }

    // 3. Front Zone (Courtyard / Parking / Front Retail / Baramda)
    const frontY = backH + midH;
    const frontSplit = Math.round(maxW * (arch.key === 'l-shaped-garden' ? 0.42 : 0.54));

    if (c.sehan > 0 && c.garage > 0) {
      rooms.push({
        id: `sehan-${idx}`,
        label: sehanLabel,
        urduLabel: sehanLabelUr,
        type: 'sehan',
        x: swapMid ? maxW - frontSplit : 0,
        y: frontY,
        w: frontSplit,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '4\'×7\' Gate',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `garage-${idx}`,
        label: garageLabel,
        urduLabel: garageLabelUr,
        type: 'garage',
        x: swapMid ? 0 : frontSplit,
        y: frontY,
        w: maxW - frontSplit,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '10\'×8\' Gate',
        doorSide: 'bottom',
      });
    } else if (c.garage > 0) {
      rooms.push({
        id: `baramda-${idx}`,
        label: isCommercial ? 'Front Display Bay' : 'Entry Porch',
        urduLabel: isCommercial ? 'فرنٹ ڈسپلے' : 'برآمدہ',
        type: 'baramda',
        x: 0,
        y: frontY,
        w: frontSplit,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '4\'×7\'',
        doorSide: 'bottom',
      });
      rooms.push({
        id: `garage-${idx}`,
        label: garageLabel,
        urduLabel: garageLabelUr,
        type: 'garage',
        x: frontSplit,
        y: frontY,
        w: maxW - frontSplit,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '10\'×8\' Gate',
        doorSide: 'bottom',
      });
    } else if (c.sehan > 0) {
      rooms.push({
        id: `sehan-${idx}`,
        label: sehanLabel,
        urduLabel: sehanLabelUr,
        type: 'sehan',
        x: 0,
        y: frontY,
        w: maxW,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '6\'×7\' Main Gate',
        doorSide: 'bottom',
      });
    } else {
      rooms.push({
        id: `baramda-${idx}`,
        label: isCommercial ? 'Storefront Arcade' : 'Front Terrace',
        urduLabel: isCommercial ? 'شاپ فرنٹ' : 'فرنٹ ٹیرس',
        type: 'baramda',
        x: 0,
        y: frontY,
        w: maxW,
        h: frontH,
        wallThicknessIn: extWall,
        doorSizeLabel: '6\'×8\'',
        doorSide: 'bottom',
      });
    }

    const aiNote = `${arch.title} (${style}): ${infra.columnWidthIn}"×${infra.columnDepthIn}" RCC columns support ${infra.totalPlannedStories} total stories with ${extWall}" exterior & ${intWall}" interior walls.`;
    const aiNoteUr = `${arch.title}: ${infra.totalPlannedStories} منزلوں کے لیے ${infra.columnWidthIn}"×${infra.columnDepthIn}" پلرز اور ${extWall}" بیرونی دیواروں کے ساتھ ڈیزائن۔`;

    return {
      id: `var-${idx + 1 + batchOffset}`,
      name: arch.title,
      subtitle: arch.subtitle,
      aiNote,
      aiNoteUr,
      efficiencyScore: arch.score,
      layoutArchetype: arch.key,
      rooms,
    };
  });
}
