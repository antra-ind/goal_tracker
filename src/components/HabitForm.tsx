import { useState, useEffect } from 'react';
import type { Habit, HabitTrackingType } from '../types';

const COMMON_UNITS = [
  // Liquids
  { value: 'glasses', label: '🥤 Glasses (water)' },
  { value: 'L', label: '💧 Liters' },
  { value: 'cups', label: '☕ Cups' },
  // Time
  { value: 'hours', label: '⏰ Hours' },
  { value: 'mins', label: '⏱️ Minutes' },
  // Fitness
  { value: 'steps', label: '👟 Steps' },
  { value: 'km', label: '🏃 Kilometers' },
  { value: 'miles', label: '🛣️ Miles' },
  { value: 'reps', label: '💪 Reps' },
  { value: 'sets', label: '🏋️ Sets' },
  { value: 'calories', label: '🔥 Calories' },
  // Weight
  { value: 'kg', label: '⚖️ Kilograms' },
  { value: 'lbs', label: '⚖️ Pounds' },
  // Learning
  { value: 'pages', label: '📖 Pages' },
  { value: 'chapters', label: '📚 Chapters' },
  { value: 'lessons', label: '🎓 Lessons' },
  // Health
  { value: 'servings', label: '🥗 Servings' },
  { value: 'mg', label: '💊 Milligrams (supplements)' },
  // Money
  { value: '₹', label: '💰 Rupees (₹)' },
  { value: '$', label: '💵 Dollars ($)' },
  // General
  { value: 'times', label: '🔢 Times' },
  { value: '%', label: '📊 Percent (%)' },
  { value: 'custom', label: '✏️ Custom...' },
];

// Generate time options (every 30 minutes from 4 AM to 11 PM)
const TIME_OPTIONS = [
  { value: '', label: 'Select time...' },
  { value: 'All day', label: '🌅 All day' },
  { value: 'Morning', label: '🌄 Morning' },
  { value: 'Afternoon', label: '☀️ Afternoon' },
  { value: 'Evening', label: '🌆 Evening' },
  { value: 'Throughout Day', label: '🔄 Throughout Day' },
  ...Array.from({ length: 38 }, (_, i) => {
    const totalMinutes = (4 * 60) + (i * 30); // Start from 4:00 AM
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    return { value: timeStr, label: `⏰ ${timeStr}` };
  }),
];

// Duration options
const DURATION_OPTIONS = [
  { value: '', label: 'Select duration...' },
  { value: '5 min', label: '5 min' },
  { value: '10 min', label: '10 min' },
  { value: '15 min', label: '15 min' },
  { value: '20 min', label: '20 min' },
  { value: '30 min', label: '30 min' },
  { value: '45 min', label: '45 min' },
  { value: '60 min', label: '60 min (1 hr)' },
  { value: '90 min', label: '90 min (1.5 hr)' },
  { value: '120 min', label: '120 min (2 hr)' },
  { value: '180 min', label: '180 min (3 hr)' },
];

interface HabitFormProps {
  habit?: Habit;
  onSave: (habit: Omit<Habit, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function HabitForm({ habit, onSave, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [time, setTime] = useState(habit?.time || '');
  const [duration, setDuration] = useState(habit?.duration || '');
  const [trackingType, setTrackingType] = useState<HabitTrackingType>(habit?.trackingType || 'boolean');
  const [unit, setUnit] = useState(habit?.unit || 'glasses');
  const [customUnit, setCustomUnit] = useState('');
  const [target, setTarget] = useState(habit?.target?.toString() || '8');
  const [min, setMin] = useState(habit?.min?.toString() || '0');
  const [max, setMax] = useState(habit?.max?.toString() || '10');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setTime(habit.time || '');
      setDuration(habit.duration || '');
      setTrackingType(habit.trackingType || 'boolean');
      
      // Check if unit is a custom value
      const isStandardUnit = COMMON_UNITS.some(u => u.value === habit.unit && u.value !== 'custom');
      if (habit.unit && !isStandardUnit) {
        setUnit('custom');
        setCustomUnit(habit.unit);
      } else {
        setUnit(habit.unit || 'glasses');
      }
      
      setTarget(habit.target?.toString() || '8');
      setMin(habit.min?.toString() || '0');
      setMax(habit.max?.toString() || '10');
    }
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalUnit = unit === 'custom' ? customUnit : unit;

    onSave({
      id: habit?.id,
      name: name.trim(),
      time: time.trim() || undefined,
      duration: duration.trim() || undefined,
      trackingType,
      unit: trackingType === 'number' ? finalUnit : undefined,
      target: trackingType === 'number' ? Number(target) : undefined,
      min: trackingType === 'number' ? Number(min) : undefined,
      max: trackingType === 'number' ? Number(max) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Habit Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning meditation"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
          required
        />
      </div>

      {/* Tracking Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tracking Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTrackingType('boolean')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
              trackingType === 'boolean'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Yes/No
          </button>
          <button
            type="button"
            onClick={() => setTrackingType('number')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
              trackingType === 'number'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Numeric
          </button>
        </div>
      </div>

      {/* Numeric Options */}
      {trackingType === 'number' && (
        <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {COMMON_UNITS.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            {unit === 'custom' && (
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Enter custom unit..."
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Min</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Target 🎯</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Max</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time (optional)
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (optional)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {DURATION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {habit ? 'Update' : 'Add'} Habit
        </button>
      </div>
    </form>
  );
}
