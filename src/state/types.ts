import { AlertThresholds, PerformanceSnapshot } from '../metrics/types';

export interface SnapshotFilter {
  readonly tag: string;
  readonly search: string;
  readonly onlyAlerts: boolean;
}

export interface StressTestState {
  readonly activeCpuStress: boolean;
  readonly allocatedMB: number;
}

export interface AppState {
  readonly snapshots: readonly PerformanceSnapshot[];
  readonly intervalSeconds: number; // Interval X
  readonly isMonitoring: boolean;
  readonly secondsRemaining: number;
  readonly thresholds: AlertThresholds;
  readonly maxRetention: number;
  readonly selectedSnapshotId: string | null;
  readonly comparisonIds: readonly [string | null, string | null];
  readonly filter: SnapshotFilter;
  readonly stressTest: StressTestState;
  readonly soundAlerts: boolean;
}

export type AppAction =
  | { readonly type: 'ADD_SNAPSHOT'; readonly payload: PerformanceSnapshot }
  | { readonly type: 'SET_INTERVAL'; readonly payload: number }
  | { readonly type: 'TOGGLE_MONITORING'; readonly payload?: boolean }
  | { readonly type: 'TICK_TIMER' }
  | { readonly type: 'RESET_TIMER' }
  | { readonly type: 'UPDATE_THRESHOLDS'; readonly payload: AlertThresholds }
  | { readonly type: 'SET_MAX_RETENTION'; readonly payload: number }
  | { readonly type: 'SELECT_SNAPSHOT'; readonly payload: string | null }
  | { readonly type: 'SET_COMPARISON'; readonly payload: { readonly slot: 0 | 1; readonly id: string | null } }
  | { readonly type: 'SET_FILTER'; readonly payload: Partial<SnapshotFilter> }
  | { readonly type: 'CLEAR_SNAPSHOTS' }
  | { readonly type: 'ADD_TAG_OR_NOTE'; readonly payload: { readonly id: string; readonly tag?: string; readonly note?: string } }
  | { readonly type: 'SET_STRESS_STATE'; readonly payload: Partial<StressTestState> }
  | { readonly type: 'TOGGLE_SOUND_ALERTS'; readonly payload?: boolean }
  | { readonly type: 'LOAD_SAVED_STATE'; readonly payload: Partial<AppState> };
