import { useMemo } from 'react';
import { useData, getDateKey } from '../context/DataContext';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from 'date-fns';
import { TrendingUp, AlertTriangle, Award } from 'lucide-react';
import type { Habit, DayData } from '../types';

interface WeekData {
  weekLabel: string;
  startDate: Date;
  days: {
    date: Date;
    dayKey: string;
    percentage: number;
    routineDone: number;
    routineTotal: number;
  }[];
  avgPercentage: number;
}

// Helper to check if habit is completed for a day
function checkHabitCompleted(habit: Habit, dayData: DayData | undefined): boolean {
  if (!dayData) return false;
  const value = dayData.routine?.[habit.id];
  if (habit.trackingType === 'number') {
    return typeof value === 'number' && value >= (habit.target || 1);
  }
  return !!value;
}

export function ProgressChart() {
  const { data } = useData();
  
  const allHabits = useMemo(
    () => data.routineCategories.flatMap(c => c.habits),
    [data.routineCategories]
  );

  // Calculate last 4 weeks of data
  const weeksData: WeekData[] = useMemo(() => {
    const weeks: WeekData[] = [];
    const today = new Date();
    
    for (let w = 0; w < 4; w++) {
      const weekStart = startOfWeek(subWeeks(today, w), { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(subWeeks(today, w), { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const days = daysInWeek.map(date => {
        const dayKey = getDateKey(date);
        const dayData = data.days[dayKey];
        const routineDone = allHabits.filter(h => checkHabitCompleted(h, dayData)).length;
        const routineTotal = allHabits.length;
        const percentage = routineTotal > 0 ? Math.round((routineDone / routineTotal) * 100) : 0;
        
        return { date, dayKey, percentage, routineDone, routineTotal };
      });
      
      const validDays = days.filter(d => d.percentage > 0 || data.days[d.dayKey]);
      const avgPercentage = validDays.length > 0 
        ? Math.round(validDays.reduce((sum, d) => sum + d.percentage, 0) / validDays.length)
        : 0;
      
      weeks.unshift({
        weekLabel: format(weekStart, 'MMM d'),
        startDate: weekStart,
        days,
        avgPercentage,
      });
    }
    
    return weeks;
  }, [data.days, allHabits]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayKey = getDateKey(date);
      const dayData = data.days[dayKey];
      const routineDone = allHabits.filter(h => checkHabitCompleted(h, dayData)).length;
      const routineTotal = allHabits.length;
      return {
        date,
        percentage: routineTotal > 0 ? Math.round((routineDone / routineTotal) * 100) : 0,
        hasData: !!dayData,
      };
    }).reverse();

    const daysWithData = last30Days.filter(d => d.hasData);
    const avgPercentage = daysWithData.length > 0
      ? Math.round(daysWithData.reduce((sum, d) => sum + d.percentage, 0) / daysWithData.length)
      : 0;
    
    const perfectDays = daysWithData.filter(d => d.percentage === 100).length;
    const activeDays = daysWithData.length;

    return { last30Days, avgPercentage, perfectDays, activeDays };
  }, [data.days, allHabits]);

  // Calculate habit performance (which habits are struggling)
  const habitPerformance = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => getDateKey(subDays(new Date(), i)));
    
    const habitStats = allHabits.map(habit => {
      const category = data.routineCategories.find(c => c.habits.some(h => h.id === habit.id));
      let completed = 0;
      let tracked = 0;
      
      last14Days.forEach(dayKey => {
        const dayData = data.days[dayKey];
        if (dayData) {
          tracked++;
          if (checkHabitCompleted(habit, dayData)) completed++;
        }
      });
      
      const rate = tracked > 0 ? Math.round((completed / tracked) * 100) : 0;
      
      return {
        id: habit.id,
        name: habit.name,
        category: category?.name || 'Unknown',
        categoryType: category?.type || 'other',
        completed,
        tracked,
        rate,
      };
    });
    
    // Sort by completion rate (lowest first for struggling)
    const sorted = [...habitStats].sort((a, b) => a.rate - b.rate);
    
    return {
      struggling: sorted.filter(h => h.rate < 50 && h.tracked > 0).slice(0, 5),
      strong: sorted.filter(h => h.rate >= 80 && h.tracked > 0).slice(-5).reverse(),
      all: habitStats,
    };
  }, [data.days, data.routineCategories, allHabits]);

  // Category performance
  const categoryPerformance = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => getDateKey(subDays(new Date(), i)));
    
    return data.routineCategories.map(category => {
      let totalCompleted = 0;
      let totalPossible = 0;
      
      last14Days.forEach(dayKey => {
        const dayData = data.days[dayKey];
        if (dayData) {
          category.habits.forEach(habit => {
            totalPossible++;
            if (checkHabitCompleted(habit, dayData)) totalCompleted++;
          });
        }
      });
      
      const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
      
      return {
        id: category.id,
        name: category.name,
        type: category.type,
        rate,
        totalCompleted,
        totalPossible,
      };
    }).sort((a, b) => a.rate - b.rate);
  }, [data.days, data.routineCategories]);

  // Get all recurring planned activities
  const allPlannedActivities = useMemo(
    () => data.plannedCategories.flatMap(c => c.activities.filter(a => a.recurring || a.recurringType !== 'none')),
    [data.plannedCategories]
  );

  // Planned activities performance
  const plannedActivityPerformance = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), i);
      return { date, dayKey: getDateKey(date) };
    });
    
    // Helper to check if activity should appear on a given day
    const shouldAppearOnDay = (activity: typeof allPlannedActivities[0], date: Date) => {
      const dayOfWeek = date.getDay();
      const recurringType = activity.recurringType || (activity.recurring ? 'daily' : 'none');
      
      switch (recurringType) {
        case 'daily': return true;
        case 'weekly': return activity.recurringWeekday === dayOfWeek;
        case 'custom': return activity.recurringDays?.includes(dayOfWeek as 0|1|2|3|4|5|6) ?? false;
        default: return false;
      }
    };
    
    const activityStats = allPlannedActivities.map(activity => {
      const category = data.plannedCategories.find(c => c.activities.some(a => a.id === activity.id));
      let completed = 0;
      let expected = 0;
      
      last14Days.forEach(({ date, dayKey }) => {
        if (shouldAppearOnDay(activity, date)) {
          expected++;
          const dayData = data.days[dayKey];
          if (dayData?.planned?.[activity.id]) completed++;
        }
      });
      
      const rate = expected > 0 ? Math.round((completed / expected) * 100) : 0;
      
      return {
        id: activity.id,
        name: activity.name,
        category: category?.name || 'Unknown',
        categoryType: category?.type || 'other',
        completed,
        expected,
        rate,
        recurringType: activity.recurringType || (activity.recurring ? 'daily' : 'none'),
      };
    });
    
    const sorted = [...activityStats].sort((a, b) => a.rate - b.rate);
    
    return {
      struggling: sorted.filter(a => a.rate < 50 && a.expected > 0).slice(0, 5),
      strong: sorted.filter(a => a.rate >= 80 && a.expected > 0).slice(-5).reverse(),
      all: activityStats,
    };
  }, [data.days, data.plannedCategories, allPlannedActivities]);

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  return (
    <section className="my-6">
      <div className="bg-white/15 rounded-xl px-4 py-3 mb-4">
        <h2 className="text-white text-xl font-bold">📊 Progress Overview</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Mini Chart */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Last 30 Days</h3>
          <div className="flex gap-[2px] h-16 items-end">
            {monthlyStats.last30Days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={`flex-1 rounded-t transition-all ${getBarColor(day.percentage)}`}
                style={{ height: `${Math.max(day.percentage, 4)}%` }}
                title={`${format(day.date, 'MMM d')}: ${day.percentage}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{format(subDays(new Date(), 29), 'MMM d')}</span>
            <span>Today</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xl font-bold text-gray-800">{monthlyStats.avgPercentage}%</div>
              <div className="text-xs text-gray-500">Avg Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xl font-bold text-green-600">{monthlyStats.perfectDays}</div>
              <div className="text-xs text-gray-500">Perfect Days</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xl font-bold text-blue-600">{monthlyStats.activeDays}</div>
              <div className="text-xs text-gray-500">Active Days</div>
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Weekly Breakdown</h3>
          <div className="space-y-3">
            {weeksData.map((week) => (
              <div key={week.weekLabel} className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-500 shrink-0">{week.weekLabel}</div>
                <div className="flex gap-1 flex-1">
                  {week.days.map((day) => {
                    const isToday = day.dayKey === getDateKey(new Date());
                    return (
                      <div
                        key={day.dayKey}
                        className={`flex-1 h-8 rounded ${getBarColor(day.percentage)} ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                        title={`${format(day.date, 'EEE, MMM d')}: ${day.percentage}%`}
                      />
                    );
                  })}
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {week.avgPercentage > 0 ? `${week.avgPercentage}%` : '-'}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> 80%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500"></span> 60%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500"></span> 40%+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400"></span> &lt;40%</span>
          </div>
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {/* Struggling Habits */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Needs Attention
          </h3>
          {habitPerformance.struggling.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              🎉 All habits doing well!
            </p>
          ) : (
            <div className="space-y-2">
              {habitPerformance.struggling.map(habit => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{habit.name}</div>
                    <div className="text-xs text-gray-400 truncate">{habit.category}</div>
                  </div>
                  <div className={`text-sm font-bold ${habit.rate < 30 ? 'text-red-500' : 'text-orange-500'}`}>
                    {habit.rate}%
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-3 text-center">Last 14 days</div>
        </div>

        {/* Strong Habits */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award size={18} className="text-green-500" />
            Going Strong
          </h3>
          {habitPerformance.strong.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Keep tracking to see your strengths!
            </p>
          ) : (
            <div className="space-y-2">
              {habitPerformance.strong.map(habit => (
                <div key={habit.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{habit.name}</div>
                    <div className="text-xs text-gray-400 truncate">{habit.category}</div>
                  </div>
                  <div className="text-sm font-bold text-green-500">
                    {habit.rate}%
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-400 mt-3 text-center">Last 14 days</div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            Category Performance
          </h3>
          <div className="space-y-2">
            {categoryPerformance.map(cat => (
              <div key={cat.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{cat.name}</div>
                </div>
                <div className="w-20 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getBarColor(cat.rate)}`}
                    style={{ width: `${cat.rate}%` }}
                  />
                </div>
                <div className={`text-sm font-medium w-10 text-right ${
                  cat.rate >= 80 ? 'text-green-600' : 
                  cat.rate >= 60 ? 'text-yellow-600' : 
                  cat.rate >= 40 ? 'text-orange-600' : 'text-red-500'
                }`}>
                  {cat.rate}%
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-3 text-center">Last 14 days</div>
        </div>
      </div>

      {/* Planned Activities Insights */}
      {allPlannedActivities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Struggling Planned Activities */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              Planned Activities - Needs Attention
            </h3>
            {plannedActivityPerformance.struggling.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                🎉 All recurring activities on track!
              </p>
            ) : (
              <div className="space-y-2">
                {plannedActivityPerformance.struggling.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{activity.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {activity.category} • {activity.recurringType}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${activity.rate < 30 ? 'text-red-500' : 'text-orange-500'}`}>
                      {activity.rate}%
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-3 text-center">Last 14 days (recurring only)</div>
          </div>

          {/* Strong Planned Activities */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={18} className="text-green-500" />
              Planned Activities - Going Strong
            </h3>
            {plannedActivityPerformance.strong.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Keep tracking to see your strengths!
              </p>
            ) : (
              <div className="space-y-2">
                {plannedActivityPerformance.strong.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{activity.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {activity.category} • {activity.recurringType}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-500">
                      {activity.rate}%
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-3 text-center">Last 14 days (recurring only)</div>
          </div>
        </div>
      )}
    </section>
  );
}
