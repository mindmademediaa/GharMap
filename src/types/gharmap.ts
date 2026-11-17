export type Language = 'en' | 'ur';

export type UnitType = 'ft' | 'm' | 'sqft' | 'sqm';

export type PlotFacing = 'North' | 'South' | 'East' | 'West';

export type ProjectCategory =
  | 'Residential Home'
  | 'Commercial Market'
  | 'Multi-Story Building'
  | 'Warehouse / Industrial'
  | 'Mixed-Use Infrastructure';

export type GlobalRegionCode =
  | 'US'
  | 'UK'
  | 'EU'
  | 'UAE'
  | 'SA'
  | 'PK'
  | 'IN'
  | 'CA'
  | 'AU';

export interface RegionConfig {
  code: GlobalRegionCode;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  costMultiplierFromUSD: number;
}

export type BudgetTier = 'Economy' | 'Standard' | 'Luxury';

export type DesignStyle =
  | 'Modern Contemporary'
  | 'Classical Villa'
  | 'Commercial Glass'
  | 'Courtyard Heritage'
  | 'Minimalist Nordic'
  | 'Mediterranean';

export type SoilType = 'Firm Clay / Loam' | 'Sandy / Alluvial' | 'Hard Rock' | 'Soft / Reclaimed';
export type SeismicZone = 'Low (Zone 1)' | 'Moderate (Zone 2)' | 'High (Zone 3-4)';

export interface InfrastructureConfig {
  currentFloors: number;
  plannedFutureFloors: number;
  soilType: SoilType;
  seismicZone: SeismicZone;
  customColumnWidthIn?: number;
  customColumnDepthIn?: number;
  customWallThicknessIn?: number;
}

export interface StructuralCalculationResult {
  totalPlannedStories: number;
  columnWidthIn: number;
  columnDepthIn: number;
  columnGridSpacingFt: number;
  estimatedColumnsCount: number;
  rebarSpec: string;
  tieSpec: string;
  footingType: string;
  footingSizeFt: string;
  footingDepthFt: number;
  beamSizeIn: string;
  slabThicknessIn: number;
  exteriorWallIn: number;
  partitionWallIn: number;
  concreteGrade: string;
  steelGrade: string;
  engineeringSummary: string;
}

export type PlanTier = 'free' | 'pro' | 'premium';

export type AppScreen =
  | 'splash'
  | 'auth'
  | 'dashboard'
  | 'plot-details'
  | 'floor-plan'
  | 'view-3d'
  | 'infrastructure'
  | 'costing'
  | 'projects'
  | 'pricing'
  | 'settings';

export interface RoomCounts {
  rooms: number;      // Bedrooms or Shops/Units
  washrooms: number;  // Bathrooms / Restrooms
  kitchen: number;    // Kitchen or Pantry/Cafeteria
  lounge: number;     // Living Lounge or Main Hall/Lobby
  baramda: number;    // Veranda / Corridor / Arcade
  garage: number;     // Garage / Parking Bays
  sehan: number;      // Courtyard / Open Atrium
  store: number;      // Storage / Utility Room
  mumty: number;      // Rooftop Stair / Elevator Shaft
}

export interface PlotSides {
  frontWidth: number; // feet (street side)
  backWidth: number;  // feet (rear side)
  leftLength: number; // feet (left side)
  rightLength: number;// feet (right side)
}

export interface PlotSpecs {
  sides: PlotSides;
  isIrregular: boolean;
  facing: PlotFacing;
  region: GlobalRegionCode;
  category: ProjectCategory;
  budget: BudgetTier;
  counts: RoomCounts;
  infrastructure: InfrastructureConfig;
}

export type WallColorId =
  | 'emerald-sage'
  | 'warm-ivory'
  | 'terracotta-clay'
  | 'slate-charcoal'
  | 'sandstone-gold'
  | 'ocean-mist';

export interface HouseCustomization {
  wallColor: WallColorId;
  trimWhite: boolean;
  exteriorCladding: 'Smooth Stucco' | 'Architectural Brick' | 'Travertine Stone' | 'Timber Louvers' | 'Glass Curtain';
  roofStyle: 'Flat Modern Parapet' | 'Pitched Architectural' | 'Pergola Terrace' | 'Skylight Atrium';
  gateDesign: 'Modern Slatted' | 'Royal Iron Arch' | 'Commercial Glass & Steel' | 'Minimal Laser-Cut';
  balconyRailing: 'Tempered Glass' | 'Matte Black Steel' | 'Perforated Screen';
  frontDoor: 'Walnut Timber' | 'Emerald Steel' | 'Double Glass Pivot';
  exteriorLighting: 'Warm Architectural LED' | 'Classic Lanterns' | 'Flood & Bollards';
  // Interior A-Z
  floorTiles: 'Italian Marble' | 'Warm Oak Wood' | 'Travertine Beige' | 'Charcoal Slate' | 'Terrazzo Mint';
  furnitureStyle: 'Modern Minimal' | 'Classic Luxury' | 'Commercial Retail' | 'Executive Office';
  interiorLighting: 'Warm 3000K Chandeliers' | 'Cool 5000K Recessed' | 'Studio Track Lights';
  kitchenFinish: 'Walnut & Quartz' | 'Matte Emerald' | 'White Carrara';
  washroomDesign: 'Spa Marble & Glass' | 'Dark Slate & Brass' | 'Minimal Ceramic';
  nightMode: boolean;
}

export interface FloorRoomBlock {
  id: string;
  label: string;
  urduLabel: string;
  type:
    | 'bedroom'
    | 'lounge'
    | 'kitchen'
    | 'sehan'
    | 'washroom'
    | 'garage'
    | 'baramda'
    | 'store'
    | 'mumty'
    | 'shop'
    | 'lobby'
    | 'office';
  x: number; // in feet from plot top-left bounding box
  y: number; // in feet from back
  w: number; // width in feet
  h: number; // length/depth in feet
  wallThicknessIn: number;
  doorSizeLabel: string;
  windowSizeLabel?: string;
  doorSide?: 'top' | 'bottom' | 'left' | 'right';
}

export interface DesignVariation {
  id: string;
  name: string;
  subtitle: string;
  aiNote: string;
  aiNoteUr: string;
  efficiencyScore: string;
  layoutArchetype:
    | 'courtyard-center'
    | 'split-wing'
    | 'open-atrium'
    | 'corridor-arcade'
    | 'double-frontage'
    | 'l-shaped-garden'
    | 'compact-core'
    | 'executive-suite';
  rooms: FloorRoomBlock[];
}

export interface RegionalMaterialRates {
  cementPerBag: number;
  brickPerPc: number;
  steelPerKg: number;
  sandPerCft: number;
  bajriPerCft: number;
  tilesPerSqFt: number;
  paintPerSqFt: number;
  labourPerSqFt: number;
}

export type AllRegionRates = Record<GlobalRegionCode, RegionalMaterialRates>;

export interface CostBreakdownResult {
  totalAreaSqFt: number;
  totalAreaSqM: number;
  coveredAreaSqFt: number;
  coveredAreaSqM: number;
  floorsMultiplier: number;
  cementBags: number;
  cementCost: number;
  bricksCount: number;
  bricksCost: number;
  steelKg: number;
  steelCost: number;
  sandCft: number;
  sandCost: number;
  bajriCft: number;
  bajriCost: number;
  tilesSqFt: number;
  tilesCost: number;
  paintSqFt: number;
  paintCost: number;
  materialsTotal: number;
  labourCost: number;
  buffer10Percent: number;
  grandTotal: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  plot: PlotSpecs;
  style: DesignStyle;
  variations: DesignVariation[];
  selectedVariationId: string;
  customization: HouseCustomization;
  unlockedSingleMap?: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  phone?: string;
  authMethod: 'google' | 'phone' | 'guest';
  companyName?: string;
  companyTagline?: string;
}

export interface ClientLead {
  id: string;
  clientName: string;
  location: string;
  projectType: ProjectCategory;
  plotSize: string;
  status: 'Proposal Sent' | 'In Design' | 'Site Active' | 'Completed';
  quotedAmount: number;
  currencyCode: string;
}
