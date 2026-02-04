import { useState, useEffect } from 'react';
import type { CategoryType, RoutineCategory, PlannedCategory } from '../types';
import { CATEGORY_ICONS } from '../types';

interface CategoryFormProps {
  category?: RoutineCategory | PlannedCategory;
  isRoutine: boolean;
  onSave: (category: { name: string; time?: string; type: CategoryType }) => void;
  onCancel: () => void;
}

const categoryTypes: CategoryType[] = ['spiritual', 'health', 'learning', 'career', 'finance', 'family', 'other'];

export function CategoryForm({ category, isRoutine, onSave, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [time, setTime] = useState((category as RoutineCategory)?.time || '');
  const [type, setType] = useState<CategoryType>(category?.type || 'other');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setTime((category as RoutineCategory)?.time || '');
      setType(category.type);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      time: isRoutine ? (time.trim() || undefined) : undefined,
      type,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning Routine"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
          required
        />
      </div>

      {isRoutine && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Range (optional)
          </label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g., 5:30 AM - 7:00 AM"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CategoryType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {categoryTypes.map(t => (
            <option key={t} value={t}>
              {CATEGORY_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
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
          {category ? 'Update' : 'Add'} Category
        </button>
      </div>
    </form>
  );
}
