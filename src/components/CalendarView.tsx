import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useData } from '../context/DataContext';
import { WORK_SCHEDULE } from '../config/defaults';
import { CATEGORY_COLORS } from '../types';

export function CalendarView() {
  const { data, currentDate } = useData();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const changeWeek = (delta: number) => {
    setWeekStart(prev => addDays(prev, delta * 7));
  };

  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date()));
  };

  const isWorkHour = (hour: number, dayOfWeek: number) => {
    const isWorkDay = WORK_SCHEDULE.workDays.includes(dayOfWeek);
    if (!isWorkDay) return false;
    return hour >= WORK_SCHEDULE.startHour && hour < WORK_SCHEDULE.endHour;
  };

  const isWeekend = (dayOfWeek: number) => !WORK_SCHEDULE.workDays.includes(dayOfWeek);

  const parseTimeToHour = (timeStr?: string): number | null => {
    if (!timeStr) return null;
    const lower = timeStr.toLowerCase();
    
    if (lower.includes('all day') || lower.includes('throughout')) return null;
    if (lower.includes('am commute')) return 8;
    if (lower.includes('pm commute')) return 18;
    if (lower.includes('morning')) return 7;
    if (lower.includes('evening')) return 19;
    
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (match) {
      let hour = parseInt(match[1]);
      const isPM = match[3]?.toLowerCase() === 'pm';
      const isAM = match[3]?.toLowerCase() === 'am';
      
      if (isPM && hour !== 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      
      return hour;
    }
    return null;
  };

  const getEventsForHour = (date: Date, hour: number) => {
    const events: { name: string; type: string }[] = [];
    const dayOfWeek = date.getDay();
    
    // Add routine habits
    data.routineCategories.forEach(cat => {
      cat.habits.forEach(habit => {
        const habitHour = parseTimeToHour(habit.time);
        if (habitHour === hour) {
          events.push({ name: habit.name, type: cat.type });
        }
      });
    });
    
    // Add planned activities
    data.plannedCategories.forEach(cat => {
      cat.activities.forEach(act => {
        if (act.recurring) {
          const actHour = parseTimeToHour(act.time);
          if (actHour === hour) {
            events.push({ name: act.name, type: cat.type });
          }
        }
      });
    });
    
    // Add work block
    if (!isWeekend(dayOfWeek) && hour === WORK_SCHEDULE.startHour) {
      events.unshift({ name: '💼 Work', type: 'work' });
    }
    
    return events;
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = Array.from({ length: 19 }, (_, i) => i + 4); // 4 AM to 10 PM

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

      <div className="min-w-[800px]">
        {/* Header row */}
        <div className="grid grid-cols-8 gap-px bg-gray-200">
          <div className="bg-gray-100 p-2 text-center text-sm font-semibold">Time</div>
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(weekStart, i);
            const isToday = isSameDay(date, new Date());
            const isWeekendDay = isWeekend(date.getDay());
            
            return (
              <div
                key={i}
                className={`p-2 text-center text-sm font-semibold ${
                  isToday ? 'bg-green-100' : isWeekendDay ? 'bg-yellow-50' : 'bg-gray-100'
                }`}
              >
                {days[date.getDay()]}<br />
                <span className="font-normal">{format(date, 'd')}</span>
              </div>
            );
          })}
        </div>

        {/* Time rows */}
        {timeSlots.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-px bg-gray-200">
            <div className="bg-gray-50 p-1 text-center text-xs text-gray-500 flex items-center justify-center">
              {hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}
            </div>
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(weekStart, i);
              const dayOfWeek = date.getDay();
              const isToday = isSameDay(date, currentDate);
              const isWeekendDay = isWeekend(dayOfWeek);
              const isWorkHr = isWorkHour(hour, dayOfWeek);
              const events = getEventsForHour(date, hour);

              return (
                <div
                  key={i}
                  className={`min-h-[40px] p-0.5 text-xs ${
                    isToday
                      ? 'bg-green-50'
                      : isWeekendDay
                      ? 'bg-yellow-50'
                      : isWorkHr
                      ? 'bg-blue-50'
                      : 'bg-white'
                  }`}
                >
                  {events.map((evt, idx) => (
                    <div
                      key={idx}
                      className={`${
                        evt.type === 'work'
                          ? 'bg-gray-500'
                          : CATEGORY_COLORS[evt.type as keyof typeof CATEGORY_COLORS] || 'bg-gray-400'
                      } text-white px-1 py-0.5 rounded text-[10px] mb-0.5 truncate`}
                      title={evt.name}
                    >
                      {evt.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-50 border rounded"></div>
          <span>Work Hours (9-6:15)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-50 border rounded"></div>
          <span>Weekend</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border rounded"></div>
          <span>Today</span>
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
      </div>
    </div>
  );
}
