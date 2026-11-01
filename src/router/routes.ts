/**
 * Functional Route Definitions & URL Parsing
 */

export type AppRoute = 'dashboard' | 'snapshots' | 'analytics' | 'stresstest' | 'settings';

export interface RouteState {
  readonly route: AppRoute;
  readonly params: Record<string, string>;
  readonly rawHash: string;
}

export const VALID_ROUTES: readonly AppRoute[] = [
  'dashboard',
  'snapshots',
  'analytics',
  'stresstest',
  'settings',
];

/**
 * Pure function to parse hash route and query params from location hash
 */
export const parseRouteFromHash = (hash: string): RouteState => {
  // Strip leading '#' or '#/'
  const cleaned = hash.replace(/^#[/]?/, '').trim();
  const [pathPart, queryPart] = cleaned.split('?');
  const routeCandidate = (pathPart || 'dashboard').toLowerCase() as AppRoute;

  const route: AppRoute = VALID_ROUTES.includes(routeCandidate) ? routeCandidate : 'dashboard';

  const params: Record<string, string> = {};
  if (queryPart) {
    const pairs = queryPart.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
  }

  return {
    route,
    params,
    rawHash: hash,
  };
};

/**
 * Pure function to format a route and parameters into a valid URL hash
 */
export const buildRouteHash = (route: AppRoute, params?: Record<string, string>): string => {
  if (!params || Object.keys(params).length === 0) {
    return `#/${route}`;
  }
  const queryString = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  return queryString ? `#/${route}?${queryString}` : `#/${route}`;
};
