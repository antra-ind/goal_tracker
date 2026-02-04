import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Header, Stats, RoutineSection, PlannedSection, CalendarView } from './components';

function AppContent() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Header />
        <Stats />
        <RoutineSection />
        <PlannedSection />
        <CalendarView />
        
        <footer className="text-center text-white/70 py-4 text-sm">
          <p>Version 2.0.0 | 🎯 Habit Tracker by Rakhesh</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
