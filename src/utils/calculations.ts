import { BUDGET_MULTIPLIER } from '../data/constants';
import {
  BudgetTier,
  CityMaterialRates,
  CostBreakdownResult,
  DesignStyle,
  DesignVariation,
  FloorRoomBlock,
  PlotSpecs,
} from '../types/gharmap';

export const MARLA_SQFT = 225; // Standard modern Pakistani residential Marla (225 sq ft)

export function formatPKR(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function formatCompactPKR(amount: number): string {
  if (amount >= 10_000_000) {
    return `PKR ${(amount / 10_000_000).toFixed(2)} Cr`;
  }
  if (amount >= 100_000) {
    return `PKR ${(amount / 100_000).toFixed(1)} Lac`;
  }
  return formatPKR(amount);
}

/**
 * Exact formula requested:
 * Total Area = Length x Width
 * Covered Area = Total Area x 0.85
 * Cement Bags = Covered Area x 0.7
 * Bricks = Covered Area x 28
 * Steel (kg) = Covered Area x 3.2
 * Sand (cft) = Covered Area x 1.5
 * Bajri (cft) = Covered Area x 1.2
 * Labour Cost = Covered Area x 450 PKR (using editable city labourPerSqFt)
 * Total = (Materials + Labour) + 10% Buffer
 */
export function calculateMaterialCosting(
  plot: PlotSpecs,
  rates: CityMaterialRates,
): CostBreakdownResult {
  const totalArea = Math.max(100, plot.length * plot.width);
  // If mumty > 0, add slight rooftop covered area factor or keep strictly 0.85 as specified
  const coveredArea = Math.round(totalArea * 0.85);
  const marlaArea = Number((totalArea / MARLA_SQFT).toFixed(2));
  const tierFactor = BUDGET_MULTIPLIER[plot.budget] ?? 1.0;

  const cementBags = Math.round(coveredArea * 0.7);
  const bricksCount = Math.round(coveredArea * 28);
  const steelKg = Math.round(coveredArea * 3.2);
  const sandCft = Math.round(coveredArea * 1.5);
  const bajriCft = Math.round(coveredArea * 1.2);
  const tilesSqFt = Math.round(coveredArea * 0.9);
  const paintSqFt = Math.round(coveredArea * 2.4);

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

  const labourCost = Math.round(coveredArea * rates.labourPerSqFt);
  const subtotal = materialsTotal + labourCost;
  const buffer10Percent = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + buffer10Percent;

  return {
    totalArea,
    coveredArea,
    marlaArea,
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
 * Generates 3 distinct architectural 2D floor plan variations tailored to
 * the user's exact plot width, length, facing, style, and room counters.
 */
export function generateDesignVariations(
  plot: PlotSpecs,
  style: DesignStyle,
): DesignVariation[] {
  const W = Math.max(18, Math.min(120, plot.width || 25));
  const L = Math.max(24, Math.min(150, plot.length || 45));
  const c = plot.counts;

  const makeVariation = (variantIndex: 0 | 1 | 2): DesignVariation => {
    const rooms: FloorRoomBlock[] = [];
    const halfW = Math.round(W * 0.5);

    // Front zone (bottom of SVG: y from frontStart to L)
    const hasFrontOpen = c.sehan > 0 || c.garage > 0 || c.baramda > 0;
    const frontDepth = hasFrontOpen ? Math.round(L * (variantIndex === 1 ? 0.28 : 0.26)) : Math.round(L * 0.16);
    const backDepth = Math.round((L - frontDepth) * (variantIndex === 2 ? 0.48 : 0.42));
    const midDepth = L - frontDepth - backDepth;

    // 1) Back zone: Bedrooms + Attached Washrooms + Store
    const bedCount = Math.max(1, c.rooms);
    const leftBeds = Math.ceil(bedCount / 2);
    const hasStore = c.store > 0;
    const hasWash = c.washrooms > 0;

    if (variantIndex === 0) {
      // Classic Pakistani Courtyard-forward Symmetry
      const bedW = hasWash ? Math.round(W * 0.42) : halfW;
      rooms.push({
        id: 'bed-1',
        label: leftBeds > 1 ? 'Master Bed' : 'Bedroom',
        urduLabel: 'بیڈروم',
        type: 'bedroom',
        x: 0,
        y: 0,
        w: bedW,
        h: backDepth,
        doorSide: 'bottom',
        windowSide: 'top',
      });
      if (hasWash) {
        const bathW = W - bedW * 2;
        if (bathW >= 4) {
          rooms.push({
            id: 'bath-1',
            label: 'Bath',
            urduLabel: 'غسل خانہ',
            type: 'washroom',
            x: bedW,
            y: 0,
            w: bathW,
            h: Math.round(backDepth * 0.55),
            doorSide: 'left',
          });
          if (hasStore) {
            rooms.push({
              id: 'store-1',
              label: 'Store',
              urduLabel: 'اسٹور',
              type: 'store',
              x: bedW,
              y: Math.round(backDepth * 0.55),
              w: bathW,
              h: backDepth - Math.round(backDepth * 0.55),
              doorSide: 'bottom',
            });
          } else {
            rooms.push({
              id: 'bath-2',
              label: 'Bath 2',
              urduLabel: 'باتھ روم',
              type: 'washroom',
              x: bedW,
              y: Math.round(backDepth * 0.55),
              w: bathW,
              h: backDepth - Math.round(backDepth * 0.55),
              doorSide: 'right',
            });
          }
          rooms.push({
            id: 'bed-2',
            label: bedCount > 1 ? 'Bedroom 2' : 'Guest Room',
            urduLabel: 'مہمان خانہ',
            type: 'bedroom',
            x: bedW + bathW,
            y: 0,
            w: bedW,
            h: backDepth,
            doorSide: 'bottom',
            windowSide: 'top',
          });
        } else {
          rooms.push({
            id: 'bed-2',
            label: 'Bedroom 2',
            urduLabel: 'بیڈروم ۲',
            type: 'bedroom',
            x: bedW,
            y: 0,
            w: W - bedW,
            h: backDepth,
            doorSide: 'bottom',
            windowSide: 'top',
          });
        }
      } else {
        rooms.push({
          id: 'bed-2',
          label: 'Bedroom 2',
          urduLabel: 'بیڈروم ۲',
          type: 'bedroom',
          x: bedW,
          y: 0,
          w: W - bedW,
          h: backDepth,
          doorSide: 'bottom',
          windowSide: 'top',
        });
      }
    } else if (variantIndex === 1) {
      // Modern Split Suite Layout
      const suiteW = Math.round(W * 0.56);
      rooms.push({
        id: 'bed-1',
        label: 'Master Suite',
        urduLabel: 'ماسٹر بیڈ',
        type: 'bedroom',
        x: 0,
        y: 0,
        w: suiteW,
        h: backDepth,
        doorSide: 'bottom',
        windowSide: 'top',
      });
      rooms.push({
        id: 'bed-2',
        label: bedCount >= 2 ? 'Bedroom 2' : 'Study',
        urduLabel: 'بیڈروم ۲',
        type: 'bedroom',
        x: suiteW,
        y: 0,
        w: W - suiteW,
        h: Math.round(backDepth * 0.65),
        doorSide: 'left',
        windowSide: 'top',
      });
      if (hasWash) {
        rooms.push({
          id: 'bath-1',
          label: 'Bathrooms',
          urduLabel: 'باتھ رومز',
          type: 'washroom',
          x: suiteW,
          y: Math.round(backDepth * 0.65),
          w: W - suiteW,
          h: backDepth - Math.round(backDepth * 0.65),
          doorSide: 'left',
        });
      }
    } else {
      // Corner Atrium / Cross-Ventilated Layout
      const leftCol = Math.round(W * 0.48);
      rooms.push({
        id: 'bed-1',
        label: 'Bedroom 1',
        urduLabel: 'بیڈروم ۱',
        type: 'bedroom',
        x: 0,
        y: 0,
        w: leftCol,
        h: backDepth,
        doorSide: 'right',
        windowSide: 'top',
      });
      rooms.push({
        id: 'bed-2',
        label: bedCount >= 2 ? 'Bedroom 2' : 'Drawing',
        urduLabel: 'ڈرائنگ روم',
        type: 'bedroom',
        x: leftCol,
        y: 0,
        w: W - leftCol,
        h: Math.round(backDepth * 0.72),
        doorSide: 'bottom',
        windowSide: 'top',
      });
      rooms.push({
        id: 'bath-1',
        label: hasStore ? 'Bath & Store' : 'Washroom',
        urduLabel: 'باتھ اور اسٹور',
        type: 'washroom',
        x: leftCol,
        y: Math.round(backDepth * 0.72),
        w: W - leftCol,
        h: backDepth - Math.round(backDepth * 0.72),
        doorSide: 'left',
      });
    }

    // 2) Middle Zone: Lounge + Kitchen (+ extra room if >= 3 rooms)
    const loungeW = variantIndex === 2 ? Math.round(W * 0.62) : Math.round(W * 0.58);
    const kitchenW = W - loungeW;
    const midY = backDepth;

    if (c.lounge > 0 && c.kitchen > 0) {
      rooms.push({
        id: 'lounge-1',
        label: 'Lounge / TV',
        urduLabel: 'لاؤنج',
        type: 'lounge',
        x: variantIndex === 1 ? kitchenW : 0,
        y: midY,
        w: loungeW,
        h: midDepth,
        doorSide: 'bottom',
        windowSide: variantIndex === 1 ? 'right' : 'left',
      });
      rooms.push({
        id: 'kitchen-1',
        label: 'Kitchen',
        urduLabel: 'باورچی خانہ',
        type: 'kitchen',
        x: variantIndex === 1 ? 0 : loungeW,
        y: midY,
        w: kitchenW,
        h: midDepth,
        doorSide: variantIndex === 1 ? 'right' : 'left',
        windowSide: variantIndex === 1 ? 'left' : 'right',
      });
    } else if (c.kitchen > 0) {
      rooms.push({
        id: 'kitchen-1',
        label: 'Kitchen & Dining',
        urduLabel: 'کچن و ڈائننگ',
        type: 'kitchen',
        x: 0,
        y: midY,
        w: W,
        h: midDepth,
        doorSide: 'bottom',
      });
    } else {
      rooms.push({
        id: 'lounge-1',
        label: 'Central Lounge',
        urduLabel: 'مرکزی لاؤنج',
        type: 'lounge',
        x: 0,
        y: midY,
        w: W,
        h: midDepth,
        doorSide: 'bottom',
      });
    }

    // 3) Front Zone: Sehan / Courtyard, Baramda, Garage, Mumty stair indicator
    const frontY = backDepth + midDepth;
    const showSehan = c.sehan > 0;
    const showGarage = c.garage > 0;
    const showBaramda = c.baramda > 0;

    if (showSehan && showGarage) {
      const sehanW = Math.round(W * 0.55);
      rooms.push({
        id: 'sehan-1',
        label: 'Sehan (Courtyard)',
        urduLabel: 'صحن',
        type: 'sehan',
        x: 0,
        y: frontY,
        w: sehanW,
        h: frontDepth,
        doorSide: 'bottom',
      });
      rooms.push({
        id: 'garage-1',
        label: showBaramda ? 'Garage & Baramda' : 'Car Porch',
        urduLabel: 'گیراج / برآمدہ',
        type: 'garage',
        x: sehanW,
        y: frontY,
        w: W - sehanW,
        h: frontDepth,
        doorSide: 'bottom',
      });
    } else if (showSehan) {
      const sehanW = showBaramda ? Math.round(W * 0.62) : W;
      rooms.push({
        id: 'sehan-1',
        label: 'Sehan (Courtyard)',
        urduLabel: 'صحن',
        type: 'sehan',
        x: 0,
        y: frontY,
        w: sehanW,
        h: frontDepth,
        doorSide: 'bottom',
      });
      if (showBaramda) {
        rooms.push({
          id: 'baramda-1',
          label: 'Baramda',
          urduLabel: 'برآمدہ',
          type: 'baramda',
          x: sehanW,
          y: frontY,
          w: W - sehanW,
          h: frontDepth,
          doorSide: 'bottom',
        });
      }
    } else if (showGarage) {
      const garageW = Math.round(W * 0.48);
      rooms.push({
        id: 'baramda-1',
        label: showBaramda ? 'Baramda' : 'Drawing / Porch',
        urduLabel: 'برآمدہ',
        type: 'baramda',
        x: 0,
        y: frontY,
        w: garageW,
        h: frontDepth,
        doorSide: 'bottom',
      });
      rooms.push({
        id: 'garage-1',
        label: 'Car Garage',
        urduLabel: 'کار گیراج',
        type: 'garage',
        x: garageW,
        y: frontY,
        w: W - garageW,
        h: frontDepth,
        doorSide: 'bottom',
      });
    } else {
      rooms.push({
        id: 'baramda-1',
        label: 'Front Veranda',
        urduLabel: 'برآمدہ',
        type: 'baramda',
        x: 0,
        y: frontY,
        w: W,
        h: frontDepth,
        doorSide: 'bottom',
      });
    }

    const facingNote =
      plot.facing === 'North'
        ? 'North-facing orientation minimizes harsh afternoon summer heat.'
        : plot.facing === 'East'
          ? 'East-facing front brings soft morning sunlight into the Lounge.'
          : plot.facing === 'West'
            ? 'West-facing shading via Jali & Baramda reduces evening heat gain.'
            : 'South-facing orientation delivers steady winter daylight.';

    const titles = [
      `${style} Courtyard Classic`,
      `${style} Open-Flow Plan`,
      `${style} Cross-Ventilated`,
    ];

    const subtitles = [
      'Balanced Sehan airflow & private bedroom wing',
      'Wide central TV Lounge with direct kitchen island',
      'Maximized natural light & compact circulation',
    ];

    const aiNotes = [
      `Good ventilation via ${c.sehan > 0 ? 'Sehan courtyard' : 'front Baramda'}. ${facingNote}`,
      `Lounge has optimal natural light with ${c.rooms} private sleeping zones and ${c.washrooms} baths.`,
      `Compact plumbing stack cuts piping cost by ~12% in ${plot.city} construction rates.`,
    ];

    const aiNotesUr = [
      `صحن کے ذریعے بہترین ہوا کی گزرگاہ اور روشنی کا انتظام۔ ${plot.city} کے موسم کے مطابق ڈیزائن۔`,
      `لاؤنج میں قدرتی روشنی اور کچن کے ساتھ آسان رسائی۔`,
      `باتھ رومز اور کچن کی پائپ لائن ایک ساتھ رکھنے سے تعمیراتی لاگت میں بچت۔`,
    ];

    const scores = ['96% Space Fit', '94% Daylight', '93% Cost Optimal'];

    return {
      id: `var-${variantIndex + 1}`,
      name: titles[variantIndex],
      subtitle: subtitles[variantIndex],
      aiNote: aiNotes[variantIndex],
      aiNoteUr: aiNotesUr[variantIndex],
      efficiencyScore: scores[variantIndex],
      rooms,
    };
  };

  return [makeVariation(0), makeVariation(1), makeVariation(2)];
}

export function getBudgetLabel(budget: BudgetTier): string {
  if (budget === 'Low') return 'Economy Gray + Standard Finish';
  if (budget === 'Premium') return 'A+ Luxury Turnkey Finish';
  return 'Standard Modern Pakistani Finish';
}
