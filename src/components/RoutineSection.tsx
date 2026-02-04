import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useData, getDateKey } from '../context/DataContext';
import type { RoutineCategory, Habit, CategoryType, DayOfWeek } from '../types';
import { CATEGORY_COLORS } from '../types';
import { Modal } from './Modal';
import { HabitForm } from './HabitForm';
import { CategoryForm } from './CategoryForm';

// Check if a habit should show on a given day
function shouldShowHabit(habit: Habit, dayOfWeek: DayOfWeek): boolean {
  const recurringType = habit.recurringType || 'daily';
  
  if (recurringType === 'daily') {
    return true;
  } else if (recurringType === 'weekly') {
    return habit.recurringWeekday === dayOfWeek;
  } else if (recurringType === 'custom' && habit.recurringDays) {
    return habit.recurringDays.includes(dayOfWeek);
  }
  
  return true; // Default to showing
}

export function RoutineSection() {
  const { data, currentDate, toggleHabit, setHabitValue, addRoutineCategory } = useData();
  const dayKey = getDateKey(currentDate);
  const dayData = data.days[dayKey];
  const dayOfWeek = currentDate.getDay() as DayOfWeek;

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAddCategory = (category: { name: string; time?: string; type: CategoryType }) => {
    addRoutineCategory(category);
    setShowCategoryModal(false);
  };

  return (
    <section className="my-6">
      <div className="flex justify-between items-center bg-white/15 rounded-xl px-4 py-3 mb-4">
        <h2 className="text-white text-xl font-bold">📋 DAILY ROUTINE</h2>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="bg-white/30 hover:bg-white/40 text-white px-3 py-1.5 rounded-lg text-sm transition"
        >
          + Add Section
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.routineCategories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            dayData={dayData}
            dayOfWeek={dayOfWeek}
            onToggle={toggleHabit}
            onSetValue={setHabitValue}
          />
        ))}
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Routine Category"
      >
        <CategoryForm
          isRoutine={true}
          onSave={handleAddCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>
    </section>
  );
}

interface CategoryCardProps {
  category: RoutineCategory;
  dayData: ReturnType<typeof useData>['data']['days'][string] | undefined;
  dayOfWeek: DayOfWeek;
  onToggle: (habitId: string) => void;
  onSetValue: (habitId: string, value: number) => void;
}

function CategoryCard({ category, dayData, dayOfWeek, onToggle, onSetValue }: CategoryCardProps) {
  const { addHabit, updateHabit, deleteHabit, updateRoutineCategory, deleteRoutineCategory } = useData();
  const bgColor = CATEGORY_COLORS[category.type] || CATEGORY_COLORS.other;

  // Check which habits are for today (but show all)
  const habitsWithStatus = useMemo(() => 
    category.habits.map(habit => ({
      ...habit,
      isForToday: shouldShowHabit(habit, dayOfWeek)
    })),
    [category.habits, dayOfWeek]
  );
  // Sort: today's habits first, then others
  const sortedHabits = useMemo(() => 
    [...habitsWithStatus].sort((a, b) => {
      if (a.isForToday && !b.isForToday) return -1;
      if (!a.isForToday && b.isForToday) return 1;
      return 0;
    }),
    [habitsWithStatus]
  );

  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const handleSaveHabit = (habitData: Omit<Habit, 'id'> & { id?: string }) => {
    if (habitData.id) {
      updateHabit(category.id, habitData.id, habitData);
    } else {
      addHabit(category.id, habitData);
    }
    setShowHabitModal(false);
    setEditingHabit(null);
  };

  const handleEditHabit = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHabit(habit);
    setShowHabitModal(true);
  };

  const handleDeleteHabit = (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabitToDelete(habitId);
  };

  const confirmDeleteHabit = () => {
    if (habitToDelete) {
      deleteHabit(category.id, habitToDelete);
      setHabitToDelete(null);
    }
  };

  const handleUpdateCategory = (updates: { name: string; time?: string; type: CategoryType }) => {
    updateRoutineCategory(category.id, updates);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = () => {
    deleteRoutineCategory(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className={`${bgColor} px-4 py-3 flex justify-between items-center`}>
        <div>
          <span className="text-white font-semibold">{category.name}</span>
          {category.time && (
            <span className="text-white/80 text-sm ml-2">{category.time}</span>
          )}
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setShowHabitModal(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
            title="Add habit"
          >
            <Plus size={14} />
          </button>
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
            title="Edit category"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
            title="Delete category"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {sortedHabits.length === 0 ? (
          <p className="text-gray-400 text-center py-4 text-sm">
            No habits yet. Click + to add.
          </p>
        ) : (
          sortedHabits.map(habit => {
            const isForToday = habit.isForToday;
            const routineValue = dayData?.routine?.[habit.id];
            const isNumeric = habit.trackingType === 'number';
            const numValue = typeof routineValue === 'number' ? routineValue : 0;
            const isDone = isNumeric 
              ? numValue >= (habit.target || 1)
              : !!routineValue;
            const progressPercent = isNumeric && habit.target 
              ? Math.min(100, (numValue / habit.target) * 100)
              : 0;

            if (isNumeric) {
              // Calculate smart step size based on target
              const target = habit.target || 10;
              const step = target >= 1000 ? 100 : target >= 100 ? 10 : 1;
              const minVal = habit.min || 0;
              const maxVal = habit.max || target * 2;
              
              // Numeric habit with slider and +/- controls
              return (
                <div
                  key={habit.id}
                  className={`p-3 my-2 rounded-lg transition border-l-4 group ${
                    !isForToday
                      ? 'bg-gray-100 border-gray-300 opacity-50'
                      : isDone
                      ? 'bg-green-50 border-green-500'
                      : numValue > 0
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${!isForToday ? 'text-gray-400' : isDone ? 'text-green-700' : ''}`}>
                        {habit.name}
                        {!isForToday && <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Not Today</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {habit.time && <span>⏰ {habit.time}</span>}
                        {habit.target && <span className="ml-2">🎯 Goal: {habit.target} {habit.unit}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleEditHabit(habit, e)}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                        title="Edit habit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHabit(habit.id, e)}
                        className="p-1.5 hover:bg-red-100 rounded text-red-500"
                        title="Delete habit"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Slider */}
                  <div className="mb-2">
                    <input
                      type="range"
                      min={minVal}
                      max={maxVal}
                      step={step}
                      value={numValue}
                      onChange={(e) => isForToday && onSetValue(habit.id, parseInt(e.target.value))}
                      disabled={!isForToday}
                      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none ${isForToday ? 'cursor-pointer accent-blue-500' : 'cursor-not-allowed accent-gray-400'}`}
                    />
                  </div>
                  
                  {/* Numeric controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => isForToday && onSetValue(habit.id, Math.max(minVal, numValue - step))}
                      disabled={!isForToday}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition text-sm font-bold ${isForToday ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 cursor-not-allowed text-gray-400'}`}
                      title={`-${step}`}
                    >
                      -{step > 1 ? step : ''}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1 text-lg font-bold">
                        <span className={isDone ? 'text-green-600' : ''}>{numValue}</span>
                        <span className="text-sm text-gray-400">/ {habit.target || '?'}</span>
                        <span className="text-sm text-gray-500">{habit.unit}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isDone ? 'bg-green-500' : 'bg-yellow-400'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => isForToday && onSetValue(habit.id, Math.min(maxVal, numValue + step))}
                      disabled={!isForToday}
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center transition text-sm font-bold ${isForToday ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                      title={`+${step}`}
                    >
                      +{step > 1 ? step : ''}
                    </button>
                  </div>
                </div>
              );
            }

            // Boolean habit with checkbox
            return (
              <div
                key={habit.id}
                onClick={() => isForToday && onToggle(habit.id)}
                className={`flex items-center p-3 my-2 rounded-lg transition border-l-4 group ${
                  !isForToday
                    ? 'bg-gray-100 border-gray-300 opacity-50'
                    : isDone
                    ? 'bg-green-50 border-green-500 cursor-pointer'
                    : 'bg-gray-50 hover:bg-gray-100 border-transparent cursor-pointer'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => isForToday && onToggle(habit.id)}
                  disabled={!isForToday}
                  className={`w-5 h-5 mr-3 shrink-0 ${isForToday ? 'accent-green-500' : 'accent-gray-400'}`}
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${!isForToday ? 'text-gray-400' : isDone ? 'line-through text-green-700' : ''}`}>
                    {habit.name}
                    {!isForToday && <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Not Today</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {habit.time && <span>⏰ {habit.time}</span>}
                    {habit.duration && <span className="ml-2">⏱️ {habit.duration}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  <button
                    onClick={(e) => handleEditHabit(habit, e)}
                    className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                    title="Edit habit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteHabit(habit.id, e)}
                    className="p-1.5 hover:bg-red-100 rounded text-red-500"
                    title="Delete habit"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Habit Modal */}
      <Modal
        isOpen={showHabitModal}
        onClose={() => { setShowHabitModal(false); setEditingHabit(null); }}
        title={editingHabit ? 'Edit Habit' : 'Add Habit'}
      >
        <HabitForm
          habit={editingHabit || undefined}
          onSave={handleSaveHabit}
          onCancel={() => { setShowHabitModal(false); setEditingHabit(null); }}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Edit Category"
      >
        <CategoryForm
          category={category}
          isRoutine={true}
          onSave={handleUpdateCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>

      {/* Delete Category Confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Category"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete "{category.name}" and all its habits? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteCategory}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </Modal>

      {/* Delete Habit Confirmation */}
      <Modal
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        title="Delete Habit"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this habit?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setHabitToDelete(null)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteHabit}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
