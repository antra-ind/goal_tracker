import type { AppData, RoutineCategory, PlannedCategory } from '../types';

export const APP_VERSION = '2.0.0';

export const DEFAULT_ROUTINE_CATEGORIES: RoutineCategory[] = [
  {
    id: 'spiritual_morning',
    name: '🙏 Spiritual - Morning Sadhana',
    time: '5:00 - 6:30 AM',
    type: 'spiritual',
    habits: [
      { id: 'kriya', name: 'Sudarshan Kriya', time: '5:00 AM', duration: '30 min' },
      { id: 'sanyam', name: 'Sanyam & Padmasadhana', time: '5:30 AM', duration: '30 min' },
      { id: 'sandhya', name: 'Sandhya Vandana', time: '6:00 AM', duration: '15 min' },
      { id: 'puja', name: 'Nitya Puja', time: '6:15 AM', duration: '15 min' },
    ],
  },
  {
    id: 'spiritual_study',
    name: '📖 Spiritual - Study & Chanting',
    time: '6:40 - 7:20 AM',
    type: 'spiritual',
    habits: [
      { id: 'scripture', name: 'Scripture Study (Gita/Yoga Sutra)', time: '6:40 AM', duration: '30 min' },
      { id: 'veda', name: 'Veda Chanting', time: '7:10 AM', duration: '10 min' },
    ],
  },
  {
    id: 'health_morning',
    name: '💪 Health - Morning Routine',
    time: '4:30 - 7:30 AM',
    type: 'health',
    habits: [
      { id: 'bath', name: 'Bath + Fresh up', time: '4:30 AM', duration: '30 min' },
      { id: 'eye', name: 'Eye Exercise (Panchakarma)', time: '6:30 AM', duration: '10 min' },
      { id: 'breakfast', name: 'Healthy Breakfast', time: '7:30 AM', duration: '30 min' },
    ],
  },
  {
    id: 'health_allday',
    name: '🥗 Health - All Day Habits',
    time: 'Throughout Day',
    type: 'health',
    habits: [
      { id: 'water', name: '3L Water (≥1L Alkaline)', time: 'All day', duration: '-' },
      { id: 'healthyFood', name: 'Healthy Food (No junk/sugar)', time: 'All meals', duration: '-' },
      { id: 'steps', name: '≥2000 Steps', time: 'All day', duration: '-' },
    ],
  },
  {
    id: 'health_evening',
    name: '🚴 Health - Evening & Sleep',
    time: '6:30 - 9:00 PM',
    type: 'health',
    habits: [
      { id: 'exercise', name: 'Physical Activity (Cycling/Walk)', time: '6:30 PM', duration: '45 min' },
      { id: 'dinner', name: 'Healthy Dinner', time: '7:30 PM', duration: '45 min' },
      { id: 'sleep', name: 'Sleep by 9 PM (7.5 hrs)', time: '9:00 PM', duration: '7.5 hrs' },
    ],
  },
];

export const DEFAULT_PLANNED_CATEGORIES: PlannedCategory[] = [
  {
    id: 'learning',
    name: '📚 Learning',
    type: 'learning',
    activities: [
      { id: 'mlLearning', name: 'ML/AI Learning', time: 'AM Commute', duration: '30 min', priority: 'high', recurring: true },
      { id: 'reading', name: 'Book Reading', time: '8:45 PM', duration: '20 min', priority: 'medium', recurring: true },
    ],
  },
  {
    id: 'career',
    name: '💻 Career',
    type: 'career',
    activities: [
      { id: 'project', name: 'Side Project (Antra/InfraMonitoring)', time: '8:15 PM', duration: '30 min', priority: 'high', recurring: true },
    ],
  },
  {
    id: 'finance',
    name: '💰 Finance',
    type: 'finance',
    activities: [
      { id: 'market', name: 'Market Tracking', time: '7:20 AM', duration: '10 min', priority: 'medium', recurring: true },
      { id: 'wisdomHatch', name: 'Wisdom Hatch Course', time: 'PM Commute', duration: '20 min', priority: 'high', recurring: true },
    ],
  },
];

export const METRICS = [
  { id: 'water_L', name: 'Water', unit: 'L', target: 3, icon: '💧' },
  { id: 'steps_count', name: 'Steps', unit: '', target: 2000, icon: '🚶' },
  { id: 'cycling_km', name: 'Cycling', unit: 'km', target: 6, icon: '🚴' },
  { id: 'workout_min', name: 'Workout', unit: 'min', target: 15, icon: '💪' },
  { id: 'pages_read', name: 'Pages', unit: '', target: 10, icon: '📚' },
  { id: 'sleep_hrs', name: 'Sleep', unit: 'hrs', target: 7.5, icon: '😴' },
];

export const WORK_SCHEDULE = {
  startHour: 9,
  endHour: 18,
  endMinute: 15,
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
};

export const createDefaultAppData = (): AppData => ({
  version: APP_VERSION,
  routineCategories: JSON.parse(JSON.stringify(DEFAULT_ROUTINE_CATEGORIES)),
  plannedCategories: JSON.parse(JSON.stringify(DEFAULT_PLANNED_CATEGORIES)),
  days: {},
  lastUpdated: null,
});
