import {
  AllCityRates,
  BudgetTier,
  CityName,
  ClientLead,
  DesignStyle,
  HouseCustomization,
  Language,
  WallColorId,
} from '../types/gharmap';

export const CITIES: CityName[] = ['Lahore', 'Islamabad', 'Karachi', 'Peshawar', 'Quetta'];

export const DESIGN_STYLES: {
  id: DesignStyle;
  label: string;
  labelUr: string;
  desc: string;
  tag: string;
  freeAllowed: boolean;
}[] = [
  {
    id: 'Pakistani',
    label: 'Pakistani',
    labelUr: 'پاکستانی',
    desc: 'Traditional Sehan courtyard, Baramda & cross-ventilation',
    tag: 'Classic Local',
    freeAllowed: true,
  },
  {
    id: 'Modern',
    label: 'Modern',
    labelUr: 'جدید ماڈرن',
    desc: 'Cantilever slabs, corner glass & clean straight lines',
    tag: 'DHA / Bahria Popular',
    freeAllowed: false,
  },
  {
    id: 'Turkish',
    label: 'Turkish',
    labelUr: 'ترکش',
    desc: 'Warm stone cladding, arched windows & wooden pergolas',
    tag: 'Ornate Facade',
    freeAllowed: false,
  },
  {
    id: 'Arabic',
    label: 'Arabic',
    labelUr: 'عربی',
    desc: 'Mashrabiya Jali screens, central atrium & privacy wall',
    tag: 'Courtyard Luxury',
    freeAllowed: false,
  },
  {
    id: 'American',
    label: 'American',
    labelUr: 'امریکن',
    desc: 'Open-concept kitchen, pitched gable roof & front porch',
    tag: 'Open Concept',
    freeAllowed: false,
  },
];

export const WALL_COLOR_SWATCHES: {
  id: WallColorId;
  name: string;
  nameUr: string;
  hex: string;
  accentHex: string;
}[] = [
  {
    id: 'forest-green',
    name: 'Forest Green',
    nameUr: 'گہرا سبز',
    hex: '#2F6B4E',
    accentHex: '#0E9F5D',
  },
  {
    id: 'classic-white',
    name: 'Classic White',
    nameUr: 'کلاسک سفید',
    hex: '#F6F7F5',
    accentHex: '#D5DDD8',
  },
  {
    id: 'sage',
    name: 'Sage',
    nameUr: 'سیج گرین',
    hex: '#92AF94',
    accentHex: '#6F9272',
  },
  {
    id: 'concrete-grey',
    name: 'Concrete Grey',
    nameUr: 'کنکریٹ گرے',
    hex: '#C4C8C6',
    accentHex: '#8E9491',
  },
  {
    id: 'sand',
    name: 'Sand',
    nameUr: 'ریتلا سنہری',
    hex: '#B8A898',
    accentHex: '#927F6E',
  },
];

export const DEFAULT_CUSTOMIZATION: HouseCustomization = {
  wallColor: 'forest-green',
  trimJaliWhite: true,
  floorTiles: 'Marble White',
  gateDesign: 'Modern Slatted',
  roofStyle: 'Flat Modern Parapet',
  frontDoor: 'Forest Green Steel',
  jaliDesign: 'Geometric Moroccan',
  nightMode: false,
};

export const DEFAULT_CITY_RATES: AllCityRates = {
  Lahore: {
    cementPerBag: 1420,
    brickPerPc: 17.5,
    steelPerKg: 265,
    sandPerCft: 68,
    bajriPerCft: 145,
    tilesPerSqFt: 240,
    paintPerSqFt: 65,
    labourPerSqFt: 450,
  },
  Islamabad: {
    cementPerBag: 1440,
    brickPerPc: 18.5,
    steelPerKg: 270,
    sandPerCft: 72,
    bajriPerCft: 140,
    tilesPerSqFt: 260,
    paintPerSqFt: 70,
    labourPerSqFt: 450,
  },
  Karachi: {
    cementPerBag: 1390,
    brickPerPc: 19,
    steelPerKg: 262,
    sandPerCft: 78,
    bajriPerCft: 158,
    tilesPerSqFt: 250,
    paintPerSqFt: 68,
    labourPerSqFt: 450,
  },
  Peshawar: {
    cementPerBag: 1380,
    brickPerPc: 16.5,
    steelPerKg: 260,
    sandPerCft: 60,
    bajriPerCft: 128,
    tilesPerSqFt: 225,
    paintPerSqFt: 60,
    labourPerSqFt: 450,
  },
  Quetta: {
    cementPerBag: 1460,
    brickPerPc: 18,
    steelPerKg: 274,
    sandPerCft: 70,
    bajriPerCft: 150,
    tilesPerSqFt: 245,
    paintPerSqFt: 66,
    labourPerSqFt: 450,
  },
};

export const BUDGET_MULTIPLIER: Record<BudgetTier, number> = {
  Low: 0.9,
  Medium: 1.0,
  Premium: 1.25,
};

export const SEEDED_CLIENT_LEADS: ClientLead[] = [
  {
    id: 'lead-1',
    clientName: 'Engr. Tariq Mahmood',
    city: 'Lahore',
    plotSize: '10 Marla (35×65 ft)',
    status: 'Site Active',
    quotedPkr: 6850000,
  },
  {
    id: 'lead-2',
    clientName: 'Sadia Khan',
    city: 'Islamabad',
    plotSize: '5 Marla (25×45 ft)',
    status: 'In Design',
    quotedPkr: 3420000,
  },
  {
    id: 'lead-3',
    clientName: 'Haji Yousaf Afridi',
    city: 'Peshawar',
    plotSize: '7 Marla (30×52 ft)',
    status: 'Proposal Sent',
    quotedPkr: 4590000,
  },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'GharMap AI',
    tagline: 'Construction House Design • AI-Powered',
    goodMorning: 'Assalam-o-Alaikum,',
    readyPrompt: 'Ready to plan your next build?',
    homeDashboard: 'Home Dashboard',
    createNewMap: 'Create New Map',
    createNewMapSub: 'Start a new construction map with AI',
    estimateCost: 'Estimate Cost',
    estimateCostSub: 'Get AI-powered PKR cost breakdown',
    myProjects: 'My Projects',
    myProjectsSub: 'View and manage your projects',
    recentProjects: 'Recent Projects',
    seeAll: 'See all',
    activeProjects: 'Active Projects',
    ongoing: 'Ongoing',
    estCost: 'Est. Cost',
    home: 'Home',
    maps: 'Maps',
    ai: '3D View',
    settings: 'Settings',
    plotDetails: 'Plot Details',
    tellUsPlot: 'Tell us about your plot',
    plotSub: 'Enter your plot specifications for AI construction plan',
    plotDimensions: 'Plot Dimensions',
    propertyDetails: 'Property Details',
    generate2DPlan: 'Generate 2D Floor Plan',
    floorPlan2D: '2D Floor Plan',
    view3D: '3D House View',
    materialCosting: 'Material Costing',
    pricingPlans: 'Pricing Plans',
    downloadPdf: 'Download Estimate PDF',
    exportPdf: 'Export PDF',
    shareWhatsapp: 'Share on WhatsApp',
    applyChanges: 'Apply Changes',
    aiRecolor: 'AI Recolor Suggestion',
  },
  ur: {
    appName: 'گھر میپ اے آئی',
    tagline: 'تعمیراتی ہاؤس ڈیزائن • اے آئی پاورڈ',
    goodMorning: 'السلام علیکم،',
    readyPrompt: 'اپنے اگلے گھر کا نقشہ بنانے کے لیے تیار ہیں؟',
    homeDashboard: 'ہوم ڈیش بورڈ',
    createNewMap: 'نیا نقشہ بنائیں',
    createNewMapSub: 'اے آئی کے ساتھ گھر کا نیا تعمیراتی نقشہ شروع کریں',
    estimateCost: 'لاگت کا تخمینہ',
    estimateCostSub: 'پاکستانی روپے میں میٹریل لاگت کی مکمل تفصیل',
    myProjects: 'میرے پراجیکٹس',
    myProjectsSub: 'اپنے محفوظ کردہ نقشے اور پراجیکٹس دیکھیں',
    recentProjects: 'حالیہ پراجیکٹس',
    seeAll: 'سب دیکھیں',
    activeProjects: 'جاری پراجیکٹس',
    ongoing: 'زیرِ تعمیر',
    estCost: 'تخمینی لاگت',
    home: 'ہوم',
    maps: 'نقشے',
    ai: 'تھری ڈی',
    settings: 'سیٹنگز',
    plotDetails: 'پلاٹ کی تفصیلات',
    tellUsPlot: 'اپنے پلاٹ کے بارے میں بتائیں',
    plotSub: 'اے آئی تعمیراتی نقشے کے لیے پلاٹ کا سائز اور کمرے درج کریں',
    plotDimensions: 'پلاٹ کی پیمائش',
    propertyDetails: 'کمرے اور سہولیات',
    generate2DPlan: '2D فلور پلان بنائیں',
    floorPlan2D: '2D فلور پلان',
    view3D: '3D ہاؤس ویو',
    materialCosting: 'میٹریل لاگت',
    pricingPlans: 'پرائسنگ پلانز',
    downloadPdf: 'تخمینہ PDF ڈاؤن لوڈ کریں',
    exportPdf: 'PDF محفوظ کریں',
    shareWhatsapp: 'واٹس ایپ پر شیئر کریں',
    applyChanges: 'تبدیلیاں لاگو کریں',
    aiRecolor: 'اے آئی کلر تجویز',
  },
};
