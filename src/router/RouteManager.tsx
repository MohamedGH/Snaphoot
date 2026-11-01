import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppRoute, RouteState, buildRouteHash, parseRouteFromHash } from './routes';

interface RouteContextType {
  readonly currentRoute: AppRoute;
  readonly params: Record<string, string>;
  readonly navigate: (to: AppRoute, params?: Record<string, string>) => void;
}

const RouteContext = createContext<RouteContextType | null>(null);

export const RouteManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [routeState, setRouteState] = useState<RouteState>(() =>
    typeof window !== 'undefined'
      ? parseRouteFromHash(window.location.hash)
      : { route: 'dashboard', params: {}, rawHash: '' }
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(parseRouteFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    // Set initial hash if none exists
    if (!window.location.hash) {
      window.location.hash = '#/dashboard';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((to: AppRoute, params?: Record<string, string>) => {
    const nextHash = buildRouteHash(to, params);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
  }, []);

  return (
    <RouteContext.Provider
      value={{
        currentRoute: routeState.route,
        params: routeState.params,
        navigate,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
};

export const useRouter = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRouter must be used within RouteManagerProvider');
  }
  return context;
};

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};
