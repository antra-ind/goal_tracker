import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Header, Stats, RoutineSection, PlannedSection, CalendarView } from './components';
import { ProgressChart } from './components/ProgressChart';
import { APP_VERSION } from './config/defaults';

function AppContent() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Header />
        <Stats />
        <RoutineSection />
        <PlannedSection />
        <ProgressChart />
        <CalendarView />
        
        <footer className="text-center text-white/70 py-4 text-sm">
          <p>🎯 Goal Tracker v{APP_VERSION} | <a href="https://github.com/antra-ind/goal_tracker" className="underline hover:text-white">Open Source</a></p>
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
