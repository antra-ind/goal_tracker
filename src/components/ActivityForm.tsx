import { useState, useEffect } from 'react';
import type { Activity, RecurringType, DayOfWeek } from '../types';

const DAYS_OF_WEEK = [
  { value: 0 as DayOfWeek, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1 as DayOfWeek, label: 'Mon', fullLabel: 'Monday' },
  { value: 2 as DayOfWeek, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3 as DayOfWeek, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4 as DayOfWeek, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5 as DayOfWeek, label: 'Fri', fullLabel: 'Friday' },
  { value: 6 as DayOfWeek, label: 'Sat', fullLabel: 'Saturday' },
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

interface ActivityFormProps {
  activity?: Activity;
  onSave: (activity: Omit<Activity, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function ActivityForm({ activity, onSave, onCancel }: ActivityFormProps) {
  const [name, setName] = useState(activity?.name || '');
  const [time, setTime] = useState(activity?.time || '');
  const [duration, setDuration] = useState(activity?.duration || '');
  const [date, setDate] = useState(activity?.date || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(activity?.priority || 'medium');
  const [description, setDescription] = useState(activity?.description || '');
  
  // Recurring state - migrate old boolean to new type
  const getInitialRecurringType = (): RecurringType => {
    if (activity?.recurringType) return activity.recurringType;
    if (activity?.recurring) return 'daily'; // backward compat: old recurring=true means daily
    return 'none';
  };
  
  const [recurringType, setRecurringType] = useState<RecurringType>(getInitialRecurringType());
  const [recurringWeekday, setRecurringWeekday] = useState<DayOfWeek>(activity?.recurringWeekday ?? 1);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>(activity?.recurringDays || [1, 2, 3, 4, 5]);

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setTime(activity.time || '');
      setDuration(activity.duration || '');
      setDate(activity.date || '');
      setPriority(activity.priority);
      setDescription(activity.description || '');
      setRecurringType(getInitialRecurringType());
      setRecurringWeekday(activity.recurringWeekday ?? 1);
      setRecurringDays(activity.recurringDays || [1, 2, 3, 4, 5]);
    }
  }, [activity]);

  const toggleDay = (day: DayOfWeek) => {
    setRecurringDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: activity?.id,
      name: name.trim(),
      time: time.trim() || undefined,
      duration: duration.trim() || undefined,
      date: recurringType === 'none' ? (date || undefined) : undefined,
      priority,
      description: description.trim() || undefined,
      recurring: recurringType !== 'none', // backward compat
      recurringType,
      recurringDays: recurringType === 'custom' ? recurringDays : undefined,
      recurringWeekday: recurringType === 'weekly' ? recurringWeekday : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Activity Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Complete React tutorial"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
          required
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Recurring Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Repeat
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'none' as RecurringType, label: 'One-time' },
            { value: 'daily' as RecurringType, label: 'Every Day' },
            { value: 'weekly' as RecurringType, label: 'Weekly' },
            { value: 'custom' as RecurringType, label: 'Custom Days' },
          ].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRecurringType(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                recurringType === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Weekly: Pick specific day */}
        {recurringType === 'weekly' && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Every:</label>
            <select
              value={recurringWeekday}
              onChange={(e) => setRecurringWeekday(Number(e.target.value) as DayOfWeek)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>
                  {day.fullLabel}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom: Pick multiple days */}
        {recurringType === 'custom' && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Select days:</label>
            <div className="flex gap-1">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    recurringDays.includes(day.value)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* One-time: Show date picker */}
        {recurringType === 'none' && (
          <div className="mt-2">
            <label className="block text-xs text-gray-500 mb-1">Due Date (optional):</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
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
          {activity ? 'Update' : 'Add'} Activity
        </button>
      </div>
    </form>
  );
}
