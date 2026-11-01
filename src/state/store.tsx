import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { AppAction, AppState } from './types';
import { INITIAL_STATE, appReducer } from './reducer';
import { addSnapshot, tickTimer } from './actions';
import { captureSnapshot } from '../metrics/snapshotEngine';
import { isOk } from '../types/result';

const STORAGE_KEY = 'pulse_metrics_state_v1';

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const StoreContext = createContext<StoreContextType | null>(null);

/**
 * Synthesizes a soft warning beep via Web Audio API when alerts trigger
 */
const playAlertBeep = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio context may be restricted before user interaction
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with stored preferences if available
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE, (defaultInit) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultInit,
          intervalSeconds: parsed.intervalSeconds || defaultInit.intervalSeconds,
          secondsRemaining: parsed.intervalSeconds || defaultInit.secondsRemaining,
          thresholds: parsed.thresholds || defaultInit.thresholds,
          maxRetention: parsed.maxRetention || defaultInit.maxRetention,
          soundAlerts: !!parsed.soundAlerts,
        };
      }
    } catch {
      // Fallback
    }
    return defaultInit;
  });

  // Persist critical settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          intervalSeconds: state.intervalSeconds,
          thresholds: state.thresholds,
          maxRetention: state.maxRetention,
          soundAlerts: state.soundAlerts,
        })
      );
    } catch {
      // Storage quota or private mode
    }
  }, [state.intervalSeconds, state.thresholds, state.maxRetention, state.soundAlerts]);

  // Keep state ref updated for timer callbacks to avoid stale closures
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initial snapshot on mount
  useEffect(() => {
    const takeInitialSnapshot = async () => {
      const res = await captureSnapshot(stateRef.current.thresholds, ['init']);
      if (isOk(res)) {
        dispatch(addSnapshot(res.value));
      }
    };
    takeInitialSnapshot();
  }, []);

  // Periodic Snapshot Runner (every 1 second timer tick)
  useEffect(() => {
    if (!state.isMonitoring) return;

    const timer = window.setInterval(async () => {
      const current = stateRef.current;
      if (!current.isMonitoring) return;

      if (current.secondsRemaining <= 1) {
        // Trigger snapshot
        const res = await captureSnapshot(
          current.thresholds,
          current.stressTest.activeCpuStress ? ['stress-active'] : ['auto']
        );
        if (isOk(res)) {
          dispatch(addSnapshot(res.value));
          if (current.soundAlerts && res.value.triggeredAlerts.length > 0) {
            playAlertBeep();
          }
        }
      } else {
        dispatch(tickTimer());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isMonitoring]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

/**
 * Hook to access the dispatch function
 */
export const useAppDispatch = (): React.Dispatch<AppAction> => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within StoreProvider');
  }
  return context.dispatch;
};

/**
 * Hook to select slices of state with functional selector pattern
 */
export const useAppSelector = <T,>(selector: (state: AppState) => T): T => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAppSelector must be used within StoreProvider');
  }
  return selector(context.state);
};
