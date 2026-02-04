import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useData } from '../context/DataContext';
import { WORK_SCHEDULE } from '../config/defaults';
import { CATEGORY_COLORS } from '../types';

interface CalendarEvent {
  id: string;
  name: string;
  type: string;
  startSlot: number;
  durationSlots: number;
  column?: number;
  totalColumns?: number;
}

// Parse time string to slot index (15-min slots, starting from 4 AM)
const parseTimeToSlot = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const lower = timeStr.toLowerCase();
  
  if (lower.includes('all day') || lower.includes('throughout')) return null;
  if (lower.includes('am commute')) return 16; // 8 AM
  if (lower.includes('pm commute')) return 56; // 6 PM
  if (lower.includes('morning')) return 12; // 7 AM
  if (lower.includes('afternoon')) return 40; // 2 PM
  if (lower.includes('evening')) return 60; // 7 PM
  
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = parseInt(match[2] || '0');
    const isPM = match[3]?.toLowerCase() === 'pm';
    const isAM = match[3]?.toLowerCase() === 'am';
    
    if (isPM && hour !== 12) hour += 12;
    if (isAM && hour === 12) hour = 0;
    
    const slotIndex = (hour - 4) * 4 + Math.floor(minute / 15);
    return slotIndex >= 0 ? slotIndex : null;
  }
  return null;
};

// Parse duration string to number of 15-min slots
const parseDurationToSlots = (durationStr?: string): number => {
  if (!durationStr) return 1; // Default to 15 min
  
  const lower = durationStr.toLowerCase();
  
  // Match "X min" or "X mins" or "X minutes"
  const minMatch = lower.match(/(\d+)\s*min/);
  if (minMatch) {
    const mins = parseInt(minMatch[1]);
    return Math.max(1, Math.ceil(mins / 15));
  }
  
  // Match "X hour" or "X hours" or "X hr" or "X hrs"
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*h(?:ou)?r/);
  if (hourMatch) {
    const hours = parseFloat(hourMatch[1]);
    return Math.max(1, Math.round(hours * 4));
  }
  
  return 1;
};

// Calculate overlapping event columns (Google Calendar style)
const layoutEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  if (events.length === 0) return [];
  
  // Sort by start time, then by duration (longer first)
  const sorted = [...events].sort((a, b) => {
    if (a.startSlot !== b.startSlot) return a.startSlot - b.startSlot;
    return b.durationSlots - a.durationSlots;
  });
  
  // Find overlapping groups and assign columns
  const result: CalendarEvent[] = [];
  
  for (const event of sorted) {
    const eventEnd = event.startSlot + event.durationSlots;
    
    // Find which columns are occupied during this event's time
    const occupiedColumns = new Set<number>();
    for (const placed of result) {
      const placedEnd = placed.startSlot + placed.durationSlots;
      // Check if they overlap
      if (event.startSlot < placedEnd && eventEnd > placed.startSlot) {
        occupiedColumns.add(placed.column || 0);
      }
    }
    
    // Find first available column
    let column = 0;
    while (occupiedColumns.has(column)) column++;
    
    result.push({ ...event, column });
  }
  
  // Calculate total columns for each time slot and update events
  for (const event of result) {
    const eventEnd = event.startSlot + event.durationSlots;
    let maxColumn = event.column || 0;
    
    for (const other of result) {
      const otherEnd = other.startSlot + other.durationSlots;
      if (event.startSlot < otherEnd && eventEnd > other.startSlot) {
        maxColumn = Math.max(maxColumn, other.column || 0);
      }
    }
    
    event.totalColumns = maxColumn + 1;
  }
  
  return result;
};

export function CalendarView() {
  const { data, currentDate } = useData();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const changeWeek = (delta: number) => {
    setWeekStart(prev => addDays(prev, delta * 7));
  };

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date()));
  };

  const isWeekend = (dayOfWeek: number) => !WORK_SCHEDULE.workDays.includes(dayOfWeek);

  // Pre-compute all events for each day with duration
  const eventsByDay = useMemo(() => {
    const result: Record<number, CalendarEvent[]> = {};
    
    // Initialize for all 7 days
    for (let i = 0; i < 7; i++) {
      result[i] = [];
    }
    
    // Add routine habits (show every day)
    data.routineCategories.forEach(cat => {
      cat.habits.forEach(habit => {
        const startSlot = parseTimeToSlot(habit.time);
        if (startSlot !== null) {
          const durationSlots = parseDurationToSlots(habit.duration);
          // Add to all days
          for (let day = 0; day < 7; day++) {
            result[day].push({
              id: `habit-${habit.id}-${day}`,
              name: habit.name,
              type: cat.type,
              startSlot,
              durationSlots,
            });
          }
        }
      });
    });
    
    // Add recurring planned activities
    data.plannedCategories.forEach(cat => {
      cat.activities.forEach(act => {
        if (act.recurring || act.recurringType !== 'none') {
          const startSlot = parseTimeToSlot(act.time);
          if (startSlot !== null) {
            const durationSlots = parseDurationToSlots(act.duration);
            
            // Determine which days to show
            let days: number[] = [];
            if (act.recurringType === 'daily') {
              days = [0, 1, 2, 3, 4, 5, 6];
            } else if (act.recurringType === 'weekly' && act.recurringWeekday !== undefined) {
              days = [act.recurringWeekday];
            } else if (act.recurringType === 'custom' && act.recurringDays) {
              days = act.recurringDays;
            } else if (act.recurring) {
              days = [0, 1, 2, 3, 4, 5, 6]; // Legacy: recurring=true means daily
            }
            
            for (const day of days) {
              result[day].push({
                id: `activity-${act.id}-${day}`,
                name: act.name,
                type: cat.type,
                startSlot,
                durationSlots,
              });
            }
          }
        }
      });
    });
    
    // Add work block for weekdays
    for (let day = 0; day < 7; day++) {
      if (WORK_SCHEDULE.workDays.includes(day)) {
        const workStartSlot = (WORK_SCHEDULE.startHour - 4) * 4;
        const workEndSlot = (WORK_SCHEDULE.endHour - 4) * 4;
        result[day].push({
          id: `work-${day}`,
          name: '💼 Work',
          type: 'work',
          startSlot: workStartSlot,
          durationSlots: workEndSlot - workStartSlot,
        });
      }
    }
    
    // Layout events for each day (handle overlaps)
    for (let day = 0; day < 7; day++) {
      result[day] = layoutEvents(result[day]);
    }
    
    return result;
  }, [data.routineCategories, data.plannedCategories, data.lastUpdated]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = Array.from({ length: 75 }, (_, i) => i); // 4 AM to 10:30 PM (15-min slots)
  const slotHeight = 16; // pixels per 15-min slot

  return (
    <div className="bg-white rounded-xl p-4 my-6 overflow-x-auto">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold">📆 Weekly Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeek(-1)}
            className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-600 transition"
          >
            ◀ Prev
          </button>
          <span className="font-medium min-w-[150px] text-center">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
          </span>
          <button
            onClick={() => changeWeek(1)}
            className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-600 transition"
          >
            Next ▶
          </button>
          <button
            onClick={goToCurrentWeek}
            className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-600 transition"
          >
            Today
          </button>
        </div>
      </div>

      <div className="min-w-[900px]">
        {/* Header row */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-100 p-2 text-center text-sm font-semibold w-16">Time</div>
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const isToday = isSameDay(date, new Date());
            const isWeekendDay = isWeekend(date.getDay());
            
            return (
              <div
                key={i}
                className={`p-2 text-center text-sm font-semibold flex-1 ${
                  isToday ? 'bg-green-100' : isWeekendDay ? 'bg-yellow-50' : 'bg-gray-100'
                }`}
              >
                {days[date.getDay()]}<br />
                <span className="font-normal">{format(date, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar body with time slots and events */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          {/* Time column */}
          <div className="bg-gray-50 w-16">
            {timeSlots.map(slotIndex => {
              const totalMinutes = (4 * 60) + (slotIndex * 15);
              const hour = Math.floor(totalMinutes / 60);
              const minute = totalMinutes % 60;
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
              const timeLabel = `${displayHour}:${minute.toString().padStart(2, '0')}`;
              
              return (
                <div
                  key={slotIndex}
                  className="text-[10px] text-gray-500 text-right pr-1 border-t border-gray-100"
                  style={{ height: slotHeight }}
                >
                  {minute === 0 && <span>{timeLabel} {ampm}</span>}
                </div>
              );
            })}
          </div>

          {/* Day columns with events */}
          {Array.from({ length: 7 }, (_, dayIndex) => {
            const date = addDays(weekStart, dayIndex);
            const dayOfWeek = date.getDay();
            const isToday = isSameDay(date, currentDate);
            const isWeekendDay = isWeekend(dayOfWeek);
            const dayEvents = eventsByDay[dayOfWeek] || [];

            return (
              <div
                key={dayIndex}
                className={`relative flex-1 ${isToday ? 'bg-green-50' : isWeekendDay ? 'bg-yellow-50' : 'bg-white'}`}
                style={{ height: timeSlots.length * slotHeight }}
              >
                {/* Grid lines */}
                {timeSlots.map(slotIndex => (
                  <div
                    key={slotIndex}
                    className={`absolute w-full border-t ${
                      slotIndex % 4 === 0 ? 'border-gray-200' : 'border-gray-100'
                    }`}
                    style={{ top: slotIndex * slotHeight }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map(event => {
                  // Skip events that start after the calendar ends
                  if (event.startSlot >= timeSlots.length) return null;
                  
                  const top = event.startSlot * slotHeight;
                  // Clip duration to calendar bounds
                  const maxSlots = timeSlots.length - event.startSlot;
                  const clippedDuration = Math.min(event.durationSlots, maxSlots);
                  const height = clippedDuration * slotHeight - 2;
                  const totalCols = event.totalColumns || 1;
                  const col = event.column || 0;
                  const width = `${100 / totalCols}%`;
                  const left = `${(col / totalCols) * 100}%`;
                  
                  const bgColor = event.type === 'work'
                    ? 'bg-gray-400/70'
                    : CATEGORY_COLORS[event.type as keyof typeof CATEGORY_COLORS] || 'bg-gray-400';

                  return (
                    <div
                      key={event.id}
                      className={`absolute ${bgColor} text-white text-[10px] rounded px-1 overflow-hidden border-l-2 border-white/50 cursor-pointer hover:opacity-90 transition`}
                      style={{
                        top: top + 1,
                        height: Math.max(height, 18),
                        width,
                        left,
                      }}
                      title={`${event.name} (${event.durationSlots * 15} min)`}
                    >
                      <div className="font-medium truncate">{event.name}</div>
                      {event.durationSlots > 1 && (
                        <div className="text-[8px] opacity-75">{event.durationSlots * 15} min</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Work</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Spiritual</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Health</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span>Career</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-600 rounded"></div>
          <span>Finance</span>
        </div>
      </div>
    </div>
  );
}
