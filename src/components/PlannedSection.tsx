import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useData, getDateKey } from '../context/DataContext';
import type { PlannedCategory, Activity, CategoryType, DayOfWeek } from '../types';
import { CATEGORY_COLORS } from '../types';
import { Modal } from './Modal';
import { ActivityForm } from './ActivityForm';
import { CategoryForm } from './CategoryForm';

// Helper to check if activity should show on a given date
function shouldShowActivity(activity: Activity, dateKey: string): boolean {
  const date = new Date(dateKey);
  const dayOfWeek = date.getDay() as DayOfWeek;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const recurringType = activity.recurringType || (activity.recurring ? 'daily' : 'none');
  
  switch (recurringType) {
    case 'daily':
      return true;
    case 'weekly':
      return activity.recurringWeekday === dayOfWeek;
    case 'custom':
      return activity.recurringDays?.includes(dayOfWeek) ?? false;
    case 'none':
    default:
      // One-time activity: show if no date, matches current date, or is future
      if (!activity.date) return true;
      const actDate = new Date(activity.date);
      actDate.setHours(0, 0, 0, 0);
      return activity.date === dateKey || actDate >= today;
  }
}

// Helper to get recurring badge text
function getRecurringBadge(activity: Activity): string | null {
  const recurringType = activity.recurringType || (activity.recurring ? 'daily' : 'none');
  
  switch (recurringType) {
    case 'daily':
      return '🔄 Daily';
    case 'weekly': {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `🔄 ${days[activity.recurringWeekday ?? 1]}`;
    }
    case 'custom': {
      const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const selectedDays = activity.recurringDays?.map(d => days[d]).join('') || '';
      return `🔄 ${selectedDays}`;
    }
    default:
      return null;
  }
}

export function PlannedSection() {
  const { data, currentDate, toggleActivity, addPlannedCategory } = useData();
  const dayKey = getDateKey(currentDate);
  const dayData = data.days[dayKey];

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAddCategory = (category: { name: string; type: CategoryType }) => {
    addPlannedCategory(category);
    setShowCategoryModal(false);
  };

  return (
    <section className="my-6">
      <div className="flex justify-between items-center bg-white/15 rounded-xl px-4 py-3 mb-4">
        <h2 className="text-white text-xl font-bold">🎯 PLANNED ACTIVITIES</h2>
        <button 
          onClick={() => setShowCategoryModal(true)}
          className="bg-white/30 hover:bg-white/40 text-white px-3 py-1.5 rounded-lg text-sm transition"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.plannedCategories.map(category => (
          <PlannedCard
            key={category.id}
            category={category}
            dayKey={dayKey}
            dayData={dayData}
            onToggle={toggleActivity}
          />
        ))}
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Add Planned Category"
      >
        <CategoryForm
          isRoutine={false}
          onSave={handleAddCategory}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>
    </section>
  );
}

interface PlannedCardProps {
  category: PlannedCategory;
  dayKey: string;
  dayData: ReturnType<typeof useData>['data']['days'][string] | undefined;
  onToggle: (activityId: string) => void;
}

function PlannedCard({ category, dayKey, dayData, onToggle }: PlannedCardProps) {
  const { addActivity, updateActivity, deleteActivity, updatePlannedCategory, deletePlannedCategory } = useData();
  const bgColor = CATEGORY_COLORS[category.type] || CATEGORY_COLORS.other;

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  // Check which activities are scheduled for today (but show all)
  const activitiesWithStatus = category.activities.map(act => ({
    ...act,
    isForToday: shouldShowActivity(act, dayKey)
  }));
  // Sort: today's activities first, then others
  const sortedActivities = [...activitiesWithStatus].sort((a, b) => {
    if (a.isForToday && !b.isForToday) return -1;
    if (!a.isForToday && b.isForToday) return 1;
    return 0;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getDateBadge = (activity: Activity) => {
    const recurringBadge = getRecurringBadge(activity);
    if (recurringBadge) {
      return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{recurringBadge}</span>;
    }
    
    if (!activity.date) return null;
    const actDate = new Date(activity.date);
    actDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activity.date === dayKey) {
      return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Today</span>;
    }
    if (actDate < today) {
      return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Overdue</span>;
    }
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{activity.date}</span>;
  };

  const handleSaveActivity = (activityData: Omit<Activity, 'id'> & { id?: string }) => {
    if (activityData.id) {
      updateActivity(category.id, activityData.id, activityData);
    } else {
      addActivity(category.id, activityData);
    }
    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleEditActivity = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleDeleteActivity = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivityToDelete(activityId);
  };

  const confirmDeleteActivity = () => {
    if (activityToDelete) {
      deleteActivity(category.id, activityToDelete);
      setActivityToDelete(null);
    }
  };

  const handleUpdateCategory = (updates: { name: string; type: CategoryType }) => {
    updatePlannedCategory(category.id, updates);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = () => {
    deletePlannedCategory(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className={`${bgColor} px-4 py-3 flex justify-between items-center`}>
        <span className="text-white font-semibold">{category.name}</span>
        <div className="flex gap-1">
          <button 
            onClick={() => setShowActivityModal(true)}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-white transition"
            title="Add activity"
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
        {sortedActivities.length === 0 ? (
          <p className="text-gray-400 text-center py-4 text-sm">
            No activities yet. Click + to add.
          </p>
        ) : (
          sortedActivities.map(activity => {
            const isDone = dayData?.planned?.[activity.id] || false;
            const isForToday = activity.isForToday;
            return (
              <div
                key={activity.id}
                onClick={() => isForToday && onToggle(activity.id)}
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
                  onChange={() => isForToday && onToggle(activity.id)}
                  disabled={!isForToday}
                  className={`w-5 h-5 mr-3 ${isForToday ? 'accent-green-500' : 'accent-gray-400'}`}
                  onClick={e => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${!isForToday ? 'text-gray-400' : isDone ? 'line-through text-green-700' : ''}`}>
                    {activity.name}
                    {!isForToday && <span className="ml-2 text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">Not Today</span>}
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-x-2 gap-y-1">
                    {activity.time && <span>⏰ {activity.time}</span>}
                    {activity.duration && <span>⏱️ {activity.duration}</span>}
                  </div>
                  {activity.description && (
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">{activity.description}</div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 ml-2 shrink-0">
                  <span className={`text-xs text-white px-1.5 py-0.5 rounded ${getPriorityColor(activity.priority)}`}>
                    {activity.priority[0].toUpperCase()}
                  </span>
                  {getDateBadge(activity)}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleEditActivity(activity, e)}
                      className="p-1.5 hover:bg-gray-200 rounded text-gray-500"
                      title="Edit activity"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteActivity(activity.id, e)}
                      className="p-1.5 hover:bg-red-100 rounded text-red-500"
                      title="Delete activity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => { setShowActivityModal(false); setEditingActivity(null); }}
        title={editingActivity ? 'Edit Activity' : 'Add Activity'}
      >
        <ActivityForm
          activity={editingActivity || undefined}
          onSave={handleSaveActivity}
          onCancel={() => { setShowActivityModal(false); setEditingActivity(null); }}
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
          isRoutine={false}
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
          Are you sure you want to delete "{category.name}" and all its activities? This cannot be undone.
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

      {/* Delete Activity Confirmation */}
      <Modal
        isOpen={!!activityToDelete}
        onClose={() => setActivityToDelete(null)}
        title="Delete Activity"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this activity?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setActivityToDelete(null)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteActivity}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
