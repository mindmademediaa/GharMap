export type Language = 'en' | 'ur';

export type UnitType = 'ft' | 'marla' | 'sqft';

export type PlotFacing = 'North' | 'South' | 'East' | 'West';

export type CityName = 'Lahore' | 'Islamabad' | 'Karachi' | 'Peshawar' | 'Quetta';

export type BudgetTier = 'Low' | 'Medium' | 'Premium';

export type DesignStyle = 'Pakistani' | 'Modern' | 'Turkish' | 'Arabic' | 'American';

export type PlanTier = 'free' | 'pro' | 'premium';

export type AppScreen =
  | 'splash'
  | 'auth'
  | 'dashboard'
  | 'plot-details'
  | 'floor-plan'
  | 'view-3d'
  | 'costing'
  | 'projects'
  | 'pricing'
  | 'settings';

export interface RoomCounts {
  rooms: number;
  washrooms: number;
  kitchen: number;
  lounge: number;
  baramda: number;
  garage: number;
  sehan: number;
  store: number;
  mumty: number;
}

export interface PlotSpecs {
  length: number; // feet
  width: number;  // feet
  facing: PlotFacing;
  city: CityName;
  budget: BudgetTier;
  counts: RoomCounts;
}

export type WallColorId = 'forest-green' | 'classic-white' | 'sage' | 'concrete-grey' | 'sand';

export interface HouseCustomization {
  wallColor: WallColorId;
  trimJaliWhite: boolean;
  floorTiles: 'Marble White' | 'Travertine Beige' | 'Charcoal Slate' | 'Terrazzo Mint';
  gateDesign: 'Modern Slatted' | 'Royal Arch Iron' | 'Minimal Laser-Cut';
  roofStyle: 'Flat Modern Parapet' | 'Terracotta Slope' | 'Pergola Terrace';
  frontDoor: 'Forest Green Steel' | 'Walnut Timber' | 'Glass Pivot';
  jaliDesign: 'Geometric Moroccan' | 'Floral Lattice' | 'Vertical Louvers';
  nightMode: boolean;
}

export interface FloorRoomBlock {
  id: string;
  label: string;
  urduLabel: string;
  type: 'bedroom' | 'lounge' | 'kitchen' | 'sehan' | 'washroom' | 'garage' | 'baramda' | 'store' | 'mumty';
  x: number; // in feet from left
  y: number; // in feet from top (back)
  w: number; // width in feet
  h: number; // height in feet
  doorSide?: 'top' | 'bottom' | 'left' | 'right';
  windowSide?: 'top' | 'bottom' | 'left' | 'right';
}

export interface DesignVariation {
  id: string;
  name: string;
  subtitle: string;
  aiNote: string;
  aiNoteUr: string;
  efficiencyScore: string;
  rooms: FloorRoomBlock[];
}

export interface CityMaterialRates {
  cementPerBag: number;   // PKR per 50kg bag
  brickPerPc: number;     // PKR per brick
  steelPerKg: number;     // PKR per kg
  sandPerCft: number;     // PKR per cft
  bajriPerCft: number;    // PKR per cft
  tilesPerSqFt: number;   // PKR per sq ft
  paintPerSqFt: number;   // PKR per sq ft
  labourPerSqFt: number;  // PKR per sq ft (default 450)
}

export type AllCityRates = Record<CityName, CityMaterialRates>;

export interface CostBreakdownResult {
  totalArea: number;
  coveredArea: number;
  marlaArea: number;
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
  progress: number; // 0 to 100
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
  city: CityName;
  plotSize: string;
  status: 'Proposal Sent' | 'In Design' | 'Site Active' | 'Completed';
  quotedPkr: number;
}
