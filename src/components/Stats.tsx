import { useData, getDateKey } from '../context/DataContext';

export function Stats() {
  const { data, currentDate } = useData();
  const dayKey = getDateKey(currentDate);
  const dayData = data.days[dayKey];

  // Calculate routine stats
  const allHabits = data.routineCategories.flatMap(c => c.habits);
  const routineDone = allHabits.filter(h => dayData?.routine?.[h.id]).length;
  const routineTotal = allHabits.length;
  const percentage = routineTotal > 0 ? Math.round((routineDone / routineTotal) * 100) : 0;

  // Calculate planned stats
  const allActivities = data.plannedCategories.flatMap(c => c.activities);
  const plannedDone = allActivities.filter(a => dayData?.planned?.[a.id]).length;

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1);
    const threshold = Math.max(1, allHabits.length * 0.7);

    while (streak < 365) {
      const key = getDateKey(checkDate);
      const day = data.days[key];
      if (day?.routine) {
        const done = allHabits.filter(h => day.routine[h.id]).length;
        if (done >= threshold) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      } else break;
    }
    return streak;
  };

  const streak = calculateStreak();

  return (
    <div className="flex justify-center gap-3 my-4 flex-wrap">
      <StatCard value={routineDone} label="Routine" />
      <StatCard value={routineTotal} label="Total" />
      <StatCard value={`${percentage}%`} label="Score" />
      <StatCard value={`${streak}🔥`} label="Streak" />
      <StatCard value={plannedDone} label="Planned" />
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-white/95 rounded-xl px-4 py-3 text-center min-w-[80px] shadow-lg">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
    </div>
  );
}
