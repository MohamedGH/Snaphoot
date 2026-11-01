import React from 'react';
import { StoreProvider } from './state/store';
import { RouteManagerProvider, useRouter } from './router/RouteManager';
import { ErrorBoundary, ErrorManagerProvider } from './error/ErrorManager';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { SnapshotsView } from './views/SnapshotsView';
import { AnalyticsView } from './views/AnalyticsView';
import { StressTestView } from './views/StressTestView';
import { SettingsView } from './views/SettingsView';
import { SnapshotDetailModal } from './components/SnapshotDetailModal';

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {currentRoute === 'dashboard' && <DashboardView />}
        {currentRoute === 'snapshots' && <SnapshotsView />}
        {currentRoute === 'analytics' && <AnalyticsView />}
        {currentRoute === 'stresstest' && <StressTestView />}
        {currentRoute === 'settings' && <SettingsView />}
      </main>

      <SnapshotDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ErrorManagerProvider>
        <StoreProvider>
          <RouteManagerProvider>
            <AppContent />
          </RouteManagerProvider>
        </StoreProvider>
      </ErrorManagerProvider>
    </ErrorBoundary>
  );
}
