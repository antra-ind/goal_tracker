// Core types for the habit tracker

export interface Habit {
  id: string;
  name: string;
  time?: string;
  duration?: string;
}

export interface Activity {
  id: string;
  name: string;
  time?: string;
  duration?: string;
  date?: string;
  priority: 'high' | 'medium' | 'low';
  description?: string;
  recurring: boolean;
}

export interface RoutineCategory {
  id: string;
  name: string;
  time?: string;
  type: CategoryType;
  habits: Habit[];
}

export interface PlannedCategory {
  id: string;
  name: string;
  type: CategoryType;
  activities: Activity[];
}

export type CategoryType = 'spiritual' | 'health' | 'learning' | 'career' | 'finance' | 'family' | 'other';

export interface DayData {
  routine: Record<string, boolean>;
  planned: Record<string, boolean>;
  metrics: Record<string, number>;
  reflection: {
    wentWell: string;
    improve: string;
    gratitude: string;
  };
}

export interface AppData {
  version: string;
  routineCategories: RoutineCategory[];
  plannedCategories: PlannedCategory[];
  days: Record<string, DayData>;
  lastUpdated: string | null;
}

export interface User {
  login: string;
  avatar_url: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
}

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  spiritual: 'bg-purple-500',
  health: 'bg-green-500',
  learning: 'bg-blue-500',
  career: 'bg-orange-500',
  finance: 'bg-teal-500',
  family: 'bg-red-500',
  other: 'bg-gray-500',
};

export const CATEGORY_ICONS: Record<CategoryType, string> = {
  spiritual: '🙏',
  health: '💪',
  learning: '📚',
  career: '💻',
  finance: '💰',
  family: '👨‍👩‍👧',
  other: '📋',
};
