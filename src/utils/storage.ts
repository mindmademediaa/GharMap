import {
  DEFAULT_CUSTOMIZATION,
  DEFAULT_REGION_RATES,
  SEEDED_CLIENT_LEADS,
} from '../data/constants';
import {
  AllRegionRates,
  ClientLead,
  Language,
  PlanTier,
  PlotSpecs,
  Project,
  UnitType,
  UserProfile,
} from '../types/gharmap';
import { generateDesignVariations } from './calculations';

const KEYS = {
  PROJECTS: 'gharmap_global_projects_v2',
  USER: 'gharmap_global_user_v2',
  PLAN: 'gharmap_global_plan_v2',
  RATES: 'gharmap_global_rates_v2',
  LANG: 'gharmap_global_lang_v2',
  UNIT: 'gharmap_global_unit_v2',
  LEADS: 'gharmap_global_leads_v2',
};

export function getSeededProjects(): Project[] {
  const plot1: PlotSpecs = {
    sides: { frontWidth: 34, backWidth: 30, leftLength: 52, rightLength: 48 },
    isIrregular: true,
    facing: 'North',
    region: 'US',
    category: 'Residential Home',
    budget: 'Standard',
    counts: {
      rooms: 3,
      washrooms: 2,
      kitchen: 1,
      lounge: 1,
      baramda: 1,
      garage: 1,
      sehan: 1,
      store: 1,
      mumty: 1,
    },
    infrastructure: {
      currentFloors: 2,
      plannedFutureFloors: 1,
      soilType: 'Firm Clay / Loam',
      seismicZone: 'Moderate (Zone 2)',
    },
  };

  const plot2: PlotSpecs = {
    sides: { frontWidth: 48, backWidth: 48, leftLength: 65, rightLength: 65 },
    isIrregular: false,
    facing: 'East',
    region: 'UAE',
    category: 'Commercial Market',
    budget: 'Luxury',
    counts: {
      rooms: 6,
      washrooms: 3,
      kitchen: 1,
      lounge: 1,
      baramda: 1,
      garage: 2,
      sehan: 1,
      store: 1,
      mumty: 1,
    },
    infrastructure: {
      currentFloors: 3,
      plannedFutureFloors: 2,
      soilType: 'Sandy / Alluvial',
      seismicZone: 'Moderate (Zone 2)',
    },
  };

  return [
    {
      id: 'proj-villa-irregular',
      name: 'Irregular Corner Modern Residence',
      createdAt: '2026-10-18',
      updatedAt: '2026-11-15',
      progress: 45,
      plot: plot1,
      style: 'Modern Contemporary',
      variations: generateDesignVariations(plot1, 'Modern Contemporary'),
      selectedVariationId: 'var-1',
      customization: { ...DEFAULT_CUSTOMIZATION },
    },
    {
      id: 'proj-plaza-market',
      name: '3-Story Commercial Market & Plaza',
      createdAt: '2026-11-04',
      updatedAt: '2026-11-16',
      progress: 70,
      plot: plot2,
      style: 'Commercial Glass',
      variations: generateDesignVariations(plot2, 'Commercial Glass'),
      selectedVariationId: 'var-4',
      customization: {
        ...DEFAULT_CUSTOMIZATION,
        wallColor: 'slate-charcoal',
        exteriorCladding: 'Glass Curtain',
        gateDesign: 'Commercial Glass & Steel',
      },
    },
  ];
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEYS.PROJECTS);
    if (!raw) {
      const seeded = getSeededProjects();
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getSeededProjects();
  } catch {
    return getSeededProjects();
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  } catch {
    // ignore storage errors
  }
}

export function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(KEYS.USER);
    } else {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
    }
  } catch {
    // ignore
  }
}

// Everything is 100% unlocked & free right now per user request
export function loadPlan(): PlanTier {
  return 'premium';
}

export function savePlan(plan: PlanTier): void {
  try {
    localStorage.setItem(KEYS.PLAN, plan);
  } catch {
    // ignore
  }
}

export function loadRegionRates(): AllRegionRates {
  try {
    const raw = localStorage.getItem(KEYS.RATES);
    if (!raw) return DEFAULT_REGION_RATES;
    return { ...DEFAULT_REGION_RATES, ...(JSON.parse(raw) as Partial<AllRegionRates>) };
  } catch {
    return DEFAULT_REGION_RATES;
  }
}

export function saveRegionRates(rates: AllRegionRates): void {
  try {
    localStorage.setItem(KEYS.RATES, JSON.stringify(rates));
  } catch {
    // ignore
  }
}

export function loadLanguage(): Language {
  try {
    return localStorage.getItem(KEYS.LANG) === 'ur' ? 'ur' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(KEYS.LANG, lang);
  } catch {
    // ignore
  }
}

export function loadUnit(): UnitType {
  try {
    const u = localStorage.getItem(KEYS.UNIT);
    return u === 'm' || u === 'sqft' || u === 'sqm' ? u : 'ft';
  } catch {
    return 'ft';
  }
}

export function saveUnit(unit: UnitType): void {
  try {
    localStorage.setItem(KEYS.UNIT, unit);
  } catch {
    // ignore
  }
}

export function loadLeads(): ClientLead[] {
  try {
    const raw = localStorage.getItem(KEYS.LEADS);
    if (!raw) return SEEDED_CLIENT_LEADS;
    return JSON.parse(raw) as ClientLead[];
  } catch {
    return SEEDED_CLIENT_LEADS;
  }
}

export function saveLeads(leads: ClientLead[]): void {
  try {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  } catch {
    // ignore
  }
}
