import { useState } from 'react';
import { Plus, Pencil, Trash2, Minus } from 'lucide-react';
import { useData, getDateKey } from '../context/DataContext';
import type { RoutineCategory, Habit, CategoryType } from '../types';
import { CATEGORY_COLORS } from '../types';
import { Modal } from './Modal';
import { HabitForm } from './HabitForm';
import { CategoryForm } from './CategoryForm';

export function RoutineSection() {
  const { data, currentDate, toggleHabit, setHabitValue, addRoutineCategory } = useData();
  const dayKey = getDateKey(currentDate);
  const dayData = data.days[dayKey];

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
  onToggle: (habitId: string) => void;
  onSetValue: (habitId: string, value: number) => void;
}

function CategoryCard({ category, dayData, onToggle, onSetValue }: CategoryCardProps) {
  const { addHabit, updateHabit, deleteHabit, updateRoutineCategory, deleteRoutineCategory } = useData();
  const bgColor = CATEGORY_COLORS[category.type] || CATEGORY_COLORS.other;

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
        {category.habits.length === 0 ? (
          <p className="text-gray-400 text-center py-4 text-sm">
            No habits yet. Click + to add.
          </p>
        ) : (
          category.habits.map(habit => {
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
              // Numeric habit with +/- controls
              return (
                <div
                  key={habit.id}
                  className={`p-3 my-2 rounded-lg transition border-l-4 group ${
                    isDone
                      ? 'bg-green-50 border-green-500'
                      : numValue > 0
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-gray-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isDone ? 'text-green-700' : ''}`}>
                        {habit.name}
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
                  
                  {/* Numeric controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSetValue(habit.id, Math.max(habit.min || 0, numValue - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                    >
                      <Minus size={16} />
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
                      onClick={() => onSetValue(habit.id, Math.min(habit.max || 100, numValue + 1))}
                      className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            }

            // Boolean habit with checkbox
            return (
              <div
                key={habit.id}
                onClick={() => onToggle(habit.id)}
                className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition border-l-4 group ${
                  isDone
                    ? 'bg-green-50 border-green-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle(habit.id)}
                  className="w-5 h-5 mr-3 accent-green-500 shrink-0"
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isDone ? 'line-through text-green-700' : ''}`}>
                    {habit.name}
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
