import { AppAction, AppState } from './types';
import { clamp } from '../utils/fp';

export const INITIAL_STATE: AppState = {
  snapshots: [],
  intervalSeconds: 5, // Default snapshot every 5 seconds
  isMonitoring: true, // Default running
  secondsRemaining: 5,
  thresholds: {
    cpuThreshold: 75,
    memoryThreshold: 80,
    batteryThreshold: 20,
  },
  maxRetention: 150,
  selectedSnapshotId: null,
  comparisonIds: [null, null],
  filter: {
    tag: 'all',
    search: '',
    onlyAlerts: false,
  },
  stressTest: {
    activeCpuStress: false,
    allocatedMB: 0,
  },
  soundAlerts: false,
};

/**
 * Pure functional state reducer
 */
export const appReducer = (state: AppState = INITIAL_STATE, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_SNAPSHOT': {
      const newSnapshots = [...state.snapshots, action.payload];
      // Enforce max retention immutably
      const trimmed = newSnapshots.length > state.maxRetention
        ? newSnapshots.slice(newSnapshots.length - state.maxRetention)
        : newSnapshots;

      return {
        ...state,
        snapshots: trimmed,
        secondsRemaining: state.intervalSeconds,
      };
    }

    case 'SET_INTERVAL': {
      const validInterval = Math.max(1, clamp(1, 3600)(action.payload));
      return {
        ...state,
        intervalSeconds: validInterval,
        secondsRemaining: Math.min(state.secondsRemaining, validInterval),
      };
    }

    case 'TOGGLE_MONITORING': {
      const nextVal = action.payload !== undefined ? action.payload : !state.isMonitoring;
      return {
        ...state,
        isMonitoring: nextVal,
        secondsRemaining: nextVal ? state.intervalSeconds : state.secondsRemaining,
      };
    }

    case 'TICK_TIMER': {
      if (!state.isMonitoring) return state;
      const nextRemaining = state.secondsRemaining - 1;
      return {
        ...state,
        secondsRemaining: nextRemaining < 0 ? state.intervalSeconds : nextRemaining,
      };
    }

    case 'RESET_TIMER': {
      return {
        ...state,
        secondsRemaining: state.intervalSeconds,
      };
    }

    case 'UPDATE_THRESHOLDS': {
      return {
        ...state,
        thresholds: {
          cpuThreshold: clamp(10, 95)(action.payload.cpuThreshold),
          memoryThreshold: clamp(10, 95)(action.payload.memoryThreshold),
          batteryThreshold: clamp(5, 50)(action.payload.batteryThreshold),
        },
      };
    }

    case 'SET_MAX_RETENTION': {
      const retention = clamp(10, 1000)(action.payload);
      return {
        ...state,
        maxRetention: retention,
        snapshots: state.snapshots.slice(-retention),
      };
    }

    case 'SELECT_SNAPSHOT': {
      return {
        ...state,
        selectedSnapshotId: action.payload,
      };
    }

    case 'SET_COMPARISON': {
      const newComparisons = [...state.comparisonIds] as [string | null, string | null];
      newComparisons[action.payload.slot] = action.payload.id;
      return {
        ...state,
        comparisonIds: newComparisons,
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };
    }

    case 'CLEAR_SNAPSHOTS': {
      return {
        ...state,
        snapshots: [],
        selectedSnapshotId: null,
        comparisonIds: [null, null],
      };
    }

    case 'ADD_TAG_OR_NOTE': {
      const { id, tag, note } = action.payload;
      return {
        ...state,
        snapshots: state.snapshots.map(s => {
          if (s.id !== id) return s;
          const nextTags = tag && !s.tags.includes(tag) ? [...s.tags, tag] : s.tags;
          return {
            ...s,
            tags: nextTags,
            notes: note !== undefined ? note : s.notes,
          };
        }),
      };
    }

    case 'SET_STRESS_STATE': {
      return {
        ...state,
        stressTest: {
          ...state.stressTest,
          ...action.payload,
        },
      };
    }

    case 'TOGGLE_SOUND_ALERTS': {
      return {
        ...state,
        soundAlerts: action.payload !== undefined ? action.payload : !state.soundAlerts,
      };
    }

    case 'LOAD_SAVED_STATE': {
      return {
        ...state,
        ...action.payload,
      };
    }

    default:
      return state;
  }
};
