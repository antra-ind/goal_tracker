import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Octokit } from '@octokit/rest';
import type { AppData, DayData, Habit, Activity, CategoryType, RoutineCategory, PlannedCategory } from '../types';
import { createDefaultAppData, APP_VERSION } from '../config/defaults';
import { STORAGE_KEYS } from '../config/github';
import { useAuth } from './AuthContext';

interface DataContextType {
  data: AppData;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  updateData: (newData: Partial<AppData>) => void;
  saveDayData: (dayKey: string, dayData: Partial<DayData>) => void;
  toggleHabit: (habitId: string) => void;
  toggleActivity: (activityId: string) => void;
  // CRUD for habits
  addHabit: (categoryId: string, habit: Omit<Habit, 'id'>) => void;
  updateHabit: (categoryId: string, habitId: string, habit: Partial<Habit>) => void;
  deleteHabit: (categoryId: string, habitId: string) => void;
  // CRUD for activities
  addActivity: (categoryId: string, activity: Omit<Activity, 'id'>) => void;
  updateActivity: (categoryId: string, activityId: string, activity: Partial<Activity>) => void;
  deleteActivity: (categoryId: string, activityId: string) => void;
  // CRUD for categories
  addRoutineCategory: (category: { name: string; time?: string; type: CategoryType }) => void;
  updateRoutineCategory: (categoryId: string, updates: { name?: string; time?: string; type?: CategoryType }) => void;
  deleteRoutineCategory: (categoryId: string) => void;
  addPlannedCategory: (category: { name: string; type: CategoryType }) => void;
  updatePlannedCategory: (categoryId: string, updates: { name?: string; type?: CategoryType }) => void;
  deletePlannedCategory: (categoryId: string) => void;
  saving: boolean;
  lastSaved: Date | null;
  syncWithGist: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

export function DataProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<AppData>(createDefaultAppData());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [gistId, setGistId] = useState<string | null>(localStorage.getItem(STORAGE_KEYS.gistId));

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // Try localStorage first
      const localData = localStorage.getItem(STORAGE_KEYS.localData);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setData({ ...createDefaultAppData(), ...parsed });
        } catch {
          console.error('Failed to parse local data');
        }
      }

      // If authenticated, try to load from Gist
      if (isAuthenticated && token && gistId) {
        try {
          const octokit = new Octokit({ auth: token });
          const { data: gist } = await octokit.gists.get({ gist_id: gistId });
          const content = gist.files?.['habit-tracker-data.json']?.content;
          if (content) {
            const gistData = JSON.parse(content);
            setData({ ...createDefaultAppData(), ...gistData });
          }
        } catch (error) {
          console.error('Failed to load from Gist:', error);
        }
      }
    };

    loadData();
  }, [isAuthenticated, token, gistId]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.localData, JSON.stringify(data));
  }, [data]);

  const syncWithGist = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setSaving(true);
    try {
      const octokit = new Octokit({ auth: token });
      const content = JSON.stringify(data, null, 2);

      if (gistId) {
        // Update existing gist
        await octokit.gists.update({
          gist_id: gistId,
          files: {
            'habit-tracker-data.json': { content },
          },
        });
      } else {
        // Create new gist
        const { data: newGist } = await octokit.gists.create({
          description: '🎯 Habit Tracker Data - Auto-synced',
          public: false,
          files: {
            'habit-tracker-data.json': { content },
          },
        });
        if (newGist.id) {
          setGistId(newGist.id);
          localStorage.setItem(STORAGE_KEYS.gistId, newGist.id);
        }
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save to Gist:', error);
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, token, gistId, data]);

  const updateData = useCallback((newData: Partial<AppData>) => {
    setData(prev => ({
      ...prev,
      ...newData,
      lastUpdated: new Date().toISOString(),
      version: APP_VERSION,
    }));
  }, []);

  const saveDayData = useCallback((dayKey: string, newDayData: Partial<DayData>) => {
    setData(prev => {
      const existingDay = prev.days[dayKey] || {
        routine: {},
        planned: {},
        metrics: {},
        reflection: { wentWell: '', improve: '', gratitude: '' },
      };
      return {
        ...prev,
        days: {
          ...prev.days,
          [dayKey]: {
            ...existingDay,
            ...newDayData,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const toggleHabit = useCallback((habitId: string) => {
    const dayKey = getDateKey(currentDate);
    setData(prev => {
      const currentDay = prev.days[dayKey] || {
        routine: {},
        planned: {},
        metrics: {},
        reflection: { wentWell: '', improve: '', gratitude: '' },
      };
      return {
        ...prev,
        days: {
          ...prev.days,
          [dayKey]: {
            ...currentDay,
            routine: {
              ...currentDay.routine,
              [habitId]: !currentDay.routine[habitId],
            },
          },
        },
      };
    });
  }, [currentDate]);

  const toggleActivity = useCallback((activityId: string) => {
    const dayKey = getDateKey(currentDate);
    setData(prev => {
      const currentDay = prev.days[dayKey] || {
        routine: {},
        planned: {},
        metrics: {},
        reflection: { wentWell: '', improve: '', gratitude: '' },
      };
      return {
        ...prev,
        days: {
          ...prev.days,
          [dayKey]: {
            ...currentDay,
            planned: {
              ...currentDay.planned,
              [activityId]: !currentDay.planned[activityId],
            },
          },
        },
      };
    });
  }, [currentDate]);

  // CRUD for Habits
  const addHabit = useCallback((categoryId: string, habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = { ...habit, id: `habit_${Date.now()}` };
    setData(prev => ({
      ...prev,
      routineCategories: prev.routineCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, habits: [...cat.habits, newHabit] }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateHabit = useCallback((categoryId: string, habitId: string, updates: Partial<Habit>) => {
    setData(prev => ({
      ...prev,
      routineCategories: prev.routineCategories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              habits: cat.habits.map(h =>
                h.id === habitId ? { ...h, ...updates } : h
              ),
            }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteHabit = useCallback((categoryId: string, habitId: string) => {
    setData(prev => ({
      ...prev,
      routineCategories: prev.routineCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, habits: cat.habits.filter(h => h.id !== habitId) }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // CRUD for Activities
  const addActivity = useCallback((categoryId: string, activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = { ...activity, id: `activity_${Date.now()}` };
    setData(prev => ({
      ...prev,
      plannedCategories: prev.plannedCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, activities: [...cat.activities, newActivity] }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateActivity = useCallback((categoryId: string, activityId: string, updates: Partial<Activity>) => {
    setData(prev => ({
      ...prev,
      plannedCategories: prev.plannedCategories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              activities: cat.activities.map(a =>
                a.id === activityId ? { ...a, ...updates } : a
              ),
            }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteActivity = useCallback((categoryId: string, activityId: string) => {
    setData(prev => ({
      ...prev,
      plannedCategories: prev.plannedCategories.map(cat =>
        cat.id === categoryId
          ? { ...cat, activities: cat.activities.filter(a => a.id !== activityId) }
          : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // CRUD for Routine Categories
  const addRoutineCategory = useCallback((category: { name: string; time?: string; type: CategoryType }) => {
    const newCategory: RoutineCategory = {
      id: `routine_${Date.now()}`,
      name: category.name,
      time: category.time,
      type: category.type,
      habits: [],
    };
    setData(prev => ({
      ...prev,
      routineCategories: [...prev.routineCategories, newCategory],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updateRoutineCategory = useCallback((categoryId: string, updates: { name?: string; time?: string; type?: CategoryType }) => {
    setData(prev => ({
      ...prev,
      routineCategories: prev.routineCategories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteRoutineCategory = useCallback((categoryId: string) => {
    setData(prev => ({
      ...prev,
      routineCategories: prev.routineCategories.filter(cat => cat.id !== categoryId),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // CRUD for Planned Categories
  const addPlannedCategory = useCallback((category: { name: string; type: CategoryType }) => {
    const newCategory: PlannedCategory = {
      id: `planned_${Date.now()}`,
      name: category.name,
      type: category.type,
      activities: [],
    };
    setData(prev => ({
      ...prev,
      plannedCategories: [...prev.plannedCategories, newCategory],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const updatePlannedCategory = useCallback((categoryId: string, updates: { name?: string; type?: CategoryType }) => {
    setData(prev => ({
      ...prev,
      plannedCategories: prev.plannedCategories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deletePlannedCategory = useCallback((categoryId: string) => {
    setData(prev => ({
      ...prev,
      plannedCategories: prev.plannedCategories.filter(cat => cat.id !== categoryId),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        currentDate,
        setCurrentDate,
        updateData,
        saveDayData,
        toggleHabit,
        toggleActivity,
        addHabit,
        updateHabit,
        deleteHabit,
        addActivity,
        updateActivity,
        deleteActivity,
        addRoutineCategory,
        updateRoutineCategory,
        deleteRoutineCategory,
        addPlannedCategory,
        updatePlannedCategory,
        deletePlannedCategory,
        saving,
        lastSaved,
        syncWithGist,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

export { getDateKey };
