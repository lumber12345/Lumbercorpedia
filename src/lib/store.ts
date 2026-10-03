/**
 * Client state. Everything persisted here lives in the player's own browser
 * (localStorage) — including the Torn API key, which never touches a database
 * and is only ever forwarded one request at a time by the server bridge.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Stats {
  strength: number;
  speed: number;
  defense: number;
  dexterity: number;
}

export interface TrainingPrefs {
  stats: Stats;
  happy: number;
  energyPerTrain: number;
  dailyEnergy: number;
  modifierPercent: number;
  gymId: string;
}

export interface TornProfile {
  name: string;
  playerId: number;
  level: number;
  /** Unix seconds — when we last pulled this payload. */
  fetchedAt: number;
  payload: unknown;
}

interface AppState {
  apiKey: string;
  setApiKey: (key: string) => void;

  profile: TornProfile | null;
  setProfile: (profile: TornProfile | null) => void;

  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  unlockedGyms: string[];
  toggleGym: (id: string) => void;
  setUnlockedGyms: (ids: string[]) => void;

  training: TrainingPrefs;
  setTraining: (patch: Partial<TrainingPrefs>) => void;
  setStats: (patch: Partial<Stats>) => void;

  planner: {
    meritEducation: number;
    wsu: boolean;
    principal: boolean;
    studyHoursPerDay: number;
  };
  setPlanner: (patch: Partial<AppState['planner']>) => void;
}

const DEFAULT_TRAINING: TrainingPrefs = {
  stats: { strength: 100_000, speed: 100_000, defense: 100_000, dexterity: 100_000 },
  happy: 5_000,
  energyPerTrain: 10,
  dailyEnergy: 1_500,
  modifierPercent: 0,
  gymId: 'georges',
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key.trim() }),

      profile: null,
      setProfile: (profile) => set({ profile }),

      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
      isFavorite: (id) => get().favorites.includes(id),

      unlockedGyms: [],
      toggleGym: (id) =>
        set((state) => ({
          unlockedGyms: state.unlockedGyms.includes(id)
            ? state.unlockedGyms.filter((g) => g !== id)
            : [...state.unlockedGyms, id],
        })),
      setUnlockedGyms: (ids) => set({ unlockedGyms: ids }),

      training: DEFAULT_TRAINING,
      setTraining: (patch) => set((state) => ({ training: { ...state.training, ...patch } })),
      setStats: (patch) =>
        set((state) => ({ training: { ...state.training, stats: { ...state.training.stats, ...patch } } })),

      planner: { meritEducation: 0, wsu: false, principal: false, studyHoursPerDay: 24 },
      setPlanner: (patch) => set((state) => ({ planner: { ...state.planner, ...patch } })),
    }),
    {
      name: 'lumbercorpedia-v1',
      partialize: (state) => ({
        apiKey: state.apiKey,
        favorites: state.favorites,
        unlockedGyms: state.unlockedGyms,
        training: state.training,
        planner: state.planner,
      }),
    },
  ),
);
