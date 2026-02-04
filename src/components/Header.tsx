import { Github, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

export function Header() {
  const { isAuthenticated, user, login, logout, loading } = useAuth();
  const { currentDate, setCurrentDate, saving, lastSaved, syncWithGist } = useData();

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <header className="text-center text-white py-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold">🎯 2026 Habit Tracker</h1>
        
        <div className="flex items-center gap-4">
          {saving && <span className="text-sm opacity-75">Saving...</span>}
          {lastSaved && (
            <span className="text-sm opacity-75">
              Saved {format(lastSaved, 'HH:mm')}
            </span>
          )}
          
          {loading ? (
            <div className="animate-pulse bg-white/20 rounded-full w-8 h-8" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={syncWithGist}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition"
                disabled={saving}
              >
                💾 Sync
              </button>
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">{user.login}</span>
              <button
                onClick={logout}
                className="p-2 hover:bg-white/20 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <Github size={18} />
              Sign in with GitHub
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={() => changeDate(-1)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          ◀ Prev
        </button>
        <span className="text-lg font-semibold min-w-[200px]">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </span>
        <button
          onClick={() => changeDate(1)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          Next ▶
        </button>
        <button
          onClick={goToToday}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          📅 Today
        </button>
      </div>
    </header>
  );
}
