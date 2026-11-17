import {
  AllRegionRates,
  BudgetTier,
  ClientLead,
  DesignStyle,
  GlobalRegionCode,
  HouseCustomization,
  Language,
  ProjectCategory,
  RegionConfig,
  WallColorId,
} from '../types/gharmap';

export const GLOBAL_REGIONS: RegionConfig[] = [
  { code: 'US', countryName: 'United States (USD)', currencyCode: 'USD', currencySymbol: '$', costMultiplierFromUSD: 1 },
  { code: 'UK', countryName: 'United Kingdom (GBP)', currencyCode: 'GBP', currencySymbol: '£', costMultiplierFromUSD: 0.85 },
  { code: 'EU', countryName: 'Europe / Eurozone (EUR)', currencyCode: 'EUR', currencySymbol: '€', costMultiplierFromUSD: 0.94 },
  { code: 'UAE', countryName: 'UAE / Dubai (AED)', currencyCode: 'AED', currencySymbol: 'AED ', costMultiplierFromUSD: 3.67 },
  { code: 'SA', countryName: 'Saudi Arabia (SAR)', currencyCode: 'SAR', currencySymbol: 'SAR ', costMultiplierFromUSD: 3.75 },
  { code: 'CA', countryName: 'Canada (CAD)', currencyCode: 'CAD', currencySymbol: 'C$', costMultiplierFromUSD: 1.36 },
  { code: 'AU', countryName: 'Australia (AUD)', currencyCode: 'AUD', currencySymbol: 'A$', costMultiplierFromUSD: 1.52 },
  { code: 'IN', countryName: 'India (INR)', currencyCode: 'INR', currencySymbol: '₹', costMultiplierFromUSD: 28 },
  { code: 'PK', countryName: 'Pakistan (PKR)', currencyCode: 'PKR', currencySymbol: 'PKR ', costMultiplierFromUSD: 95 },
];

export const PROJECT_CATEGORIES: {
  id: ProjectCategory;
  label: string;
  labelUr: string;
  desc: string;
}[] = [
  { id: 'Residential Home', label: 'Residential Home', labelUr: 'رہائشی گھر', desc: 'Single or multi-story villa & house' },
  { id: 'Commercial Market', label: 'Commercial Market', labelUr: 'کمرشل مارکیٹ / پلازہ', desc: 'Shops, retail bays & shopping plaza' },
  { id: 'Multi-Story Building', label: 'Multi-Story Building', labelUr: 'ملٹی اسٹوری بلڈنگ', desc: 'Apartments, offices & tower block' },
  { id: 'Warehouse / Industrial', label: 'Warehouse / Facility', labelUr: 'گودام / انڈسٹریل', desc: 'Wide-span depot & loading bays' },
  { id: 'Mixed-Use Infrastructure', label: 'Mixed-Use Infra', labelUr: 'مکسڈ یوز پراجیکٹ', desc: 'Ground retail + upper apartments' },
];

export const DESIGN_STYLES: {
  id: DesignStyle;
  label: string;
  labelUr: string;
  desc: string;
  tag: string;
}[] = [
  { id: 'Modern Contemporary', label: 'Modern Contemporary', labelUr: 'جدید ماڈرن', desc: 'Cantilever slabs, corner glass & clean lines', tag: 'Global Popular' },
  { id: 'Commercial Glass', label: 'Commercial Glass', labelUr: 'کمرشل گلاس', desc: 'Storefront glazing, signage fascia & high bays', tag: 'Markets & Plazas' },
  { id: 'Courtyard Heritage', label: 'Courtyard Heritage', labelUr: 'صحن والا ڈیزائن', desc: 'Central ventilated atrium & shaded veranda', tag: 'Passive Cooling' },
  { id: 'Classical Villa', label: 'Classical Villa', labelUr: 'کلاسیکل ولا', desc: 'Symmetrical facade, arches & grand entry', tag: 'Timeless Estate' },
  { id: 'Minimalist Nordic', label: 'Minimalist Nordic', labelUr: 'منیملسٹ اسٹائل', desc: 'Warm timber cladding & pitched daylight roof', tag: 'Eco Timber' },
  { id: 'Mediterranean', label: 'Mediterranean', labelUr: 'میڈیٹیرینین', desc: 'Stucco walls, terracotta roof & terrace pergola', tag: 'Resort Feel' },
];

export const WALL_COLOR_SWATCHES: {
  id: WallColorId;
  name: string;
  hex: string;
  secondaryHex: string;
}[] = [
  { id: 'emerald-sage', name: 'Emerald Sage', hex: '#2D6B4F', secondaryHex: '#DCE5DE' },
  { id: 'warm-ivory', name: 'Warm Ivory', hex: '#E8E0D2', secondaryHex: '#4A554E' },
  { id: 'terracotta-clay', name: 'Terracotta', hex: '#B55D43', secondaryHex: '#EFE8DF' },
  { id: 'slate-charcoal', name: 'Slate Charcoal', hex: '#374247', secondaryHex: '#D9DFE2' },
  { id: 'sandstone-gold', name: 'Sandstone', hex: '#B89B78', secondaryHex: '#F3EEE7' },
  { id: 'ocean-mist', name: 'Ocean Slate', hex: '#4B6E7D', secondaryHex: '#E5ECF0' },
];

export const DEFAULT_CUSTOMIZATION: HouseCustomization = {
  wallColor: 'emerald-sage',
  trimWhite: true,
  exteriorCladding: 'Travertine Stone',
  roofStyle: 'Flat Modern Parapet',
  gateDesign: 'Modern Slatted',
  balconyRailing: 'Tempered Glass',
  frontDoor: 'Walnut Timber',
  exteriorLighting: 'Warm Architectural LED',
  floorTiles: 'Italian Marble',
  furnitureStyle: 'Modern Minimal',
  interiorLighting: 'Warm 3000K Chandeliers',
  kitchenFinish: 'Walnut & Quartz',
  washroomDesign: 'Spa Marble & Glass',
  nightMode: false,
};

// Base USD unit rates scaled cleanly per global region
const BASE_USD_RATES = {
  cementPerBag: 13,
  brickPerPc: 0.45,
  steelPerKg: 1.65,
  sandPerCft: 1.2,
  bajriPerCft: 1.8,
  tilesPerSqFt: 4.5,
  paintPerSqFt: 1.4,
  labourPerSqFt: 22,
};

export const DEFAULT_REGION_RATES: AllRegionRates = GLOBAL_REGIONS.reduce((acc, reg) => {
  const m = reg.costMultiplierFromUSD;
  acc[reg.code] = {
    cementPerBag: Number((BASE_USD_RATES.cementPerBag * m).toFixed(2)),
    brickPerPc: Number((BASE_USD_RATES.brickPerPc * m).toFixed(2)),
    steelPerKg: Number((BASE_USD_RATES.steelPerKg * m).toFixed(2)),
    sandPerCft: Number((BASE_USD_RATES.sandPerCft * m).toFixed(2)),
    bajriPerCft: Number((BASE_USD_RATES.bajriPerCft * m).toFixed(2)),
    tilesPerSqFt: Number((BASE_USD_RATES.tilesPerSqFt * m).toFixed(2)),
    paintPerSqFt: Number((BASE_USD_RATES.paintPerSqFt * m).toFixed(2)),
    labourPerSqFt: Number((BASE_USD_RATES.labourPerSqFt * m).toFixed(2)),
  };
  return acc;
}, {} as AllRegionRates);

export const BUDGET_MULTIPLIER: Record<BudgetTier, number> = {
  Economy: 0.88,
  Standard: 1.0,
  Luxury: 1.32,
};

export const SEEDED_CLIENT_LEADS: ClientLead[] = [
  {
    id: 'lead-1',
    clientName: 'Apex Retail Development',
    location: 'London, UK',
    projectType: 'Commercial Market',
    plotSize: '45×60×42×58 ft (2,575 sq ft)',
    status: 'Site Active',
    quotedAmount: 245000,
    currencyCode: 'GBP',
  },
  {
    id: 'lead-2',
    clientName: 'Al-Manar Plaza Group',
    location: 'Dubai, UAE',
    projectType: 'Mixed-Use Infrastructure',
    plotSize: '50×80 ft (4,000 sq ft · 4 Floors)',
    status: 'In Design',
    quotedAmount: 1850000,
    currencyCode: 'AED',
  },
  {
    id: 'lead-3',
    clientName: 'Daniel & Sarah Brooks',
    location: 'Austin, USA',
    projectType: 'Residential Home',
    plotSize: '36×52 ft (1,872 sq ft)',
    status: 'Proposal Sent',
    quotedAmount: 192000,
    currencyCode: 'USD',
  },
];

export const getRegionConfig = (code: GlobalRegionCode): RegionConfig =>
  GLOBAL_REGIONS.find((r) => r.code === code) || GLOBAL_REGIONS[0];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'GharMap AI',
    tagline: 'Global Architecture, Buildings & Infrastructure • AI Studio',
    goodMorning: 'Welcome back,',
    readyPrompt: 'Ready to engineer your next home, market, or building?',
    homeDashboard: 'Design Studio',
    createNewMap: 'Create New Map',
    createNewMapSub: 'Irregular 4-side plots, homes, markets & buildings',
    estimateCost: 'Material & Cost BOQ',
    estimateCostSub: 'Global currency costing & editable market rates',
    myProjects: 'My Projects',
    myProjectsSub: 'Saved blueprints, developer quotes & duplicates',
    recentProjects: 'Recent Projects',
    seeAll: 'See all',
    activeProjects: 'Projects',
    ongoing: 'Saved locally',
    estCost: 'Portfolio Est.',
    home: 'Home',
    maps: '2D Blueprint',
    ai: '3D Studio',
    infra: 'Structure',
    settings: 'Settings',
    plotDetails: 'Site & Plot Specifications',
    tellUsPlot: 'Enter exact site dimensions',
    plotSub: 'Supports irregular 4-side plots, multi-story buildings, markets & homes worldwide',
    plotDimensions: 'Plot Sides & Geometry',
    propertyDetails: 'Spaces & Program',
    generate2DPlan: 'Generate Blueprint Variations',
    floorPlan2D: '2D Architectural Blueprint',
    view3D: '3D Architecture Studio',
    materialCosting: 'Global Material Costing',
    pricingPlans: 'Access & Capabilities',
    downloadPdf: 'Download Blueprint & BOQ PDF',
    exportPdf: 'Export PDF',
    shareWhatsapp: 'Share Summary',
    applyChanges: 'Apply Changes',
    aiRecolor: 'AI Palette & Finish Suggestion',
  },
  ur: {
    appName: 'گھر میپ اے آئی',
    tagline: 'گلوبل آرکیٹیکچر، بلڈنگز اور انفراسٹرکچر ڈیزائن',
    goodMorning: 'خوش آمدید،',
    readyPrompt: 'گھر، کمرشل مارکیٹ یا عمارت کا نیا نقشہ اور اسٹرکچر تیار کریں',
    homeDashboard: 'ڈیزائن اسٹوڈیو',
    createNewMap: 'نیا نقشہ بنائیں',
    createNewMapSub: 'چاروں اطراف کی پیمائش، گھر، مارکیٹ اور بلڈنگز',
    estimateCost: 'میٹریل اور لاگت BOQ',
    estimateCostSub: 'بین الاقوامی کرنسی میں مکمل لاگت کا تخمینہ',
    myProjects: 'میرے پراجیکٹس',
    myProjectsSub: 'محفوظ نقشے، کلائنٹ کوٹس اور ترمیم',
    recentProjects: 'حالیہ پراجیکٹس',
    seeAll: 'سب دیکھیں',
    activeProjects: 'پراجیکٹس',
    ongoing: 'محفوظ شدہ',
    estCost: 'کل تخمینہ',
    home: 'ہوم',
    maps: '2D نقشہ',
    ai: '3D اسٹوڈیو',
    infra: 'اسٹرکچر',
    settings: 'سیٹنگز',
    plotDetails: 'پلاٹ اور سائٹ کی تفصیلات',
    tellUsPlot: 'پلاٹ کی مکمل پیمائش درج کریں',
    plotSub: 'دنیا بھر کے لیے ٹیڑھے یا برابر چاروں اطراف کے پلاٹ، گھر، مارکیٹ اور ملٹی اسٹوری بلڈنگز',
    plotDimensions: 'چاروں اطراف کی لمبائی و چوڑائی',
    propertyDetails: 'کمرے، دکانیں اور یونٹس',
    generate2DPlan: 'متعدد نقشے تیار کریں',
    floorPlan2D: '2D تعمیراتی بلیو پرنٹ',
    view3D: '3D آرکیٹیکچر اسٹوڈیو',
    materialCosting: 'میٹریل اور لاگت BOQ',
    pricingPlans: 'مکمل فیچرز (100% مفت)',
    downloadPdf: 'مکمل بلیو پرنٹ PDF ڈاؤن لوڈ کریں',
    exportPdf: 'PDF محفوظ کریں',
    shareWhatsapp: 'شیئر کریں',
    applyChanges: 'تبدیلیاں لاگو کریں',
    aiRecolor: 'اے آئی ڈیزائن تجویز',
  },
};
