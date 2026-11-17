import {
  DEFAULT_CITY_RATES,
  DEFAULT_CUSTOMIZATION,
  SEEDED_CLIENT_LEADS,
} from '../data/constants';
import {
  AllCityRates,
  ClientLead,
  Language,
  PlanTier,
  Project,
  UnitType,
  UserProfile,
} from '../types/gharmap';
import { generateDesignVariations } from './calculations';

const KEYS = {
  PROJECTS: 'gharmap_projects_v1',
  USER: 'gharmap_user_v1',
  PLAN: 'gharmap_plan_v1',
  RATES: 'gharmap_city_rates_v1',
  LANG: 'gharmap_lang_v1',
  UNIT: 'gharmap_unit_v1',
  LEADS: 'gharmap_client_leads_v1',
};

export function getSeededProjects(): Project[] {
  const plot1 = {
    length: 45,
    width: 25,
    facing: 'North' as const,
    city: 'Lahore' as const,
    budget: 'Medium' as const,
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
  };

  const plot2 = {
    length: 65,
    width: 35,
    facing: 'East' as const,
    city: 'Peshawar' as const,
    budget: 'Premium' as const,
    counts: {
      rooms: 4,
      washrooms: 3,
      kitchen: 1,
      lounge: 1,
      baramda: 1,
      garage: 1,
      sehan: 1,
      store: 1,
      mumty: 1,
    },
  };

  return [
    {
      id: 'proj-lahore-5marla',
      name: '5 Marla Residence - Lahore',
      createdAt: '2026-10-12',
      updatedAt: '2026-11-15',
      progress: 40,
      plot: plot1,
      style: 'Pakistani',
      variations: generateDesignVariations(plot1, 'Pakistani'),
      selectedVariationId: 'var-1',
      customization: { ...DEFAULT_CUSTOMIZATION },
    },
    {
      id: 'proj-peshawar-10marla',
      name: '10 Marla Courtyard Villa - Peshawar',
      createdAt: '2026-11-01',
      updatedAt: '2026-11-16',
      progress: 75,
      plot: plot2,
      style: 'Pakistani',
      variations: generateDesignVariations(plot2, 'Pakistani'),
      selectedVariationId: 'var-1',
      customization: {
        ...DEFAULT_CUSTOMIZATION,
        wallColor: 'sand',
        frontDoor: 'Walnut Timber',
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
    // ignore storage quota errors
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

export function loadPlan(): PlanTier {
  try {
    const raw = localStorage.getItem(KEYS.PLAN);
    if (raw === 'free' || raw === 'pro' || raw === 'premium') return raw;
    return 'free';
  } catch {
    return 'free';
  }
}

export function savePlan(plan: PlanTier): void {
  try {
    localStorage.setItem(KEYS.PLAN, plan);
  } catch {
    // ignore
  }
}

export function loadCityRates(): AllCityRates {
  try {
    const raw = localStorage.getItem(KEYS.RATES);
    if (!raw) return DEFAULT_CITY_RATES;
    return { ...DEFAULT_CITY_RATES, ...(JSON.parse(raw) as Partial<AllCityRates>) };
  } catch {
    return DEFAULT_CITY_RATES;
  }
}

export function saveCityRates(rates: AllCityRates): void {
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
    return u === 'marla' || u === 'sqft' ? u : 'ft';
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
