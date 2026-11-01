import { AlertThresholds, PerformanceSnapshot } from '../metrics/types';
import { AppAction, SnapshotFilter, StressTestState } from './types';

export const addSnapshot = (snapshot: PerformanceSnapshot): AppAction => ({
  type: 'ADD_SNAPSHOT',
  payload: snapshot,
});

export const setIntervalSeconds = (seconds: number): AppAction => ({
  type: 'SET_INTERVAL',
  payload: seconds,
});

export const toggleMonitoring = (status?: boolean): AppAction => ({
  type: 'TOGGLE_MONITORING',
  payload: status,
});

export const tickTimer = (): AppAction => ({
  type: 'TICK_TIMER',
});

export const resetTimer = (): AppAction => ({
  type: 'RESET_TIMER',
});

export const updateThresholds = (thresholds: AlertThresholds): AppAction => ({
  type: 'UPDATE_THRESHOLDS',
  payload: thresholds,
});

export const setMaxRetention = (retention: number): AppAction => ({
  type: 'SET_MAX_RETENTION',
  payload: retention,
});

export const selectSnapshot = (id: string | null): AppAction => ({
  type: 'SELECT_SNAPSHOT',
  payload: id,
});

export const setComparison = (slot: 0 | 1, id: string | null): AppAction => ({
  type: 'SET_COMPARISON',
  payload: { slot, id },
});

export const setFilter = (filter: Partial<SnapshotFilter>): AppAction => ({
  type: 'SET_FILTER',
  payload: filter,
});

export const clearSnapshots = (): AppAction => ({
  type: 'CLEAR_SNAPSHOTS',
});

export const addTagOrNote = (id: string, tag?: string, note?: string): AppAction => ({
  type: 'ADD_TAG_OR_NOTE',
  payload: { id, tag, note },
});

export const setStressState = (stress: Partial<StressTestState>): AppAction => ({
  type: 'SET_STRESS_STATE',
  payload: stress,
});

export const toggleSoundAlerts = (status?: boolean): AppAction => ({
  type: 'TOGGLE_SOUND_ALERTS',
  payload: status,
});
