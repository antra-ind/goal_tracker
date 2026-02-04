import { useState, useRef, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const QUICK_OPTIONS = [
  { value: '', label: 'Select time...' },
  { value: 'All day', label: '🌅 All day' },
  { value: 'Morning', label: '🌄 Morning' },
  { value: 'Afternoon', label: '☀️ Afternoon' },
  { value: 'Evening', label: '🌆 Evening' },
  { value: 'Throughout Day', label: '🔄 Throughout Day' },
];

export function TimePicker({ value, onChange, placeholder = 'Select time...' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isPM, setIsPM] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value
  useEffect(() => {
    if (value && !QUICK_OPTIONS.some(opt => opt.value === value)) {
      const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const pm = match[3].toUpperCase() === 'PM';
        
        setSelectedHour(hour);
        setSelectedMinute(minute);
        setIsPM(pm);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = () => {
    const displayHour = selectedHour;
    const displayMinute = selectedMinute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${isPM ? 'PM' : 'AM'}`;
  };

  const handleConfirm = () => {
    onChange(formatTime());
    setIsOpen(false);
  };

  const handleQuickOption = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Hours for clock face (1-12)
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // Minutes (0, 15, 30, 45 on outer ring, all 5-min intervals available)
  const minuteMarkers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index * (360 / total) - 90) * (Math.PI / 180);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex items-center gap-2 hover:border-gray-400 transition bg-white"
      >
        <Clock className="w-4 h-4 text-gray-400" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        {value && (
          <X
            className="w-4 h-4 ml-auto text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </button>

      {/* Picker popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-72">
          {/* Quick options */}
          <div className="mb-3 flex flex-wrap gap-1">
            {QUICK_OPTIONS.filter(opt => opt.value).map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleQuickOption(opt.value)}
                className={`px-2 py-1 text-xs rounded-md transition ${
                  value === opt.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="border-t pt-3">
            {/* Time display */}
            <div className="flex justify-center items-center gap-1 mb-4">
              <button
                type="button"
                onClick={() => setMode('hour')}
                className={`text-3xl font-light px-2 py-1 rounded transition ${
                  mode === 'hour' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {selectedHour}
              </button>
              <span className="text-3xl font-light text-gray-400">:</span>
              <button
                type="button"
                onClick={() => setMode('minute')}
                className={`text-3xl font-light px-2 py-1 rounded transition ${
                  mode === 'minute' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {selectedMinute.toString().padStart(2, '0')}
              </button>
              <div className="flex flex-col ml-2">
                <button
                  type="button"
                  onClick={() => setIsPM(false)}
                  className={`text-xs px-2 py-0.5 rounded-t transition ${
                    !isPM ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setIsPM(true)}
                  className={`text-xs px-2 py-0.5 rounded-b transition ${
                    isPM ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Clock face */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              {/* Clock circle */}
              <div className="absolute inset-0 rounded-full bg-gray-50 border-2 border-gray-200"></div>
              
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>

              {mode === 'hour' ? (
                /* Hour numbers */
                hours.map((hour, index) => {
                  const pos = getPosition(index, 12, 72);
                  const isSelected = selectedHour === hour;
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => {
                        setSelectedHour(hour);
                        setMode('minute');
                      }}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition -translate-x-1/2 -translate-y-1/2 ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{
                        left: `calc(50% + ${pos.x}px)`,
                        top: `calc(50% + ${pos.y}px)`,
                      }}
                    >
                      {hour}
                    </button>
                  );
                })
              ) : (
                /* Minute numbers */
                minuteMarkers.map((minute, index) => {
                  const pos = getPosition(index, 12, 72);
                  const isSelected = selectedMinute === minute;
                  return (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => setSelectedMinute(minute)}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition -translate-x-1/2 -translate-y-1/2 ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{
                        left: `calc(50% + ${pos.x}px)`,
                        top: `calc(50% + ${pos.y}px)`,
                      }}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  );
                })
              )}

              {/* Hand line */}
              {mode === 'hour' && (
                <div
                  className="absolute top-1/2 left-1/2 w-0.5 bg-blue-500 origin-bottom rounded-full"
                  style={{
                    height: '60px',
                    transform: `translate(-50%, -100%) rotate(${(hours.indexOf(selectedHour) * 30) - 0}deg)`,
                  }}
                />
              )}
              {mode === 'minute' && (
                <div
                  className="absolute top-1/2 left-1/2 w-0.5 bg-blue-500 origin-bottom rounded-full"
                  style={{
                    height: '60px',
                    transform: `translate(-50%, -100%) rotate(${(selectedMinute / 5) * 30}deg)`,
                  }}
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
