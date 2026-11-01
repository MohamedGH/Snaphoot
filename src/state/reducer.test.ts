import test from 'node:test';
import assert from 'node:assert/strict';
import { appReducer, INITIAL_STATE } from './reducer';
import {
  addSnapshot,
  setIntervalSeconds,
  toggleMonitoring,
  tickTimer,
  resetTimer,
  updateThresholds,
  setMaxRetention,
  selectSnapshot,
  setComparison,
  setFilter,
  clearSnapshots,
  addTagOrNote,
  setStressState,
} from './actions';
import { PerformanceSnapshot } from '../metrics/types';

const mockSnapshot: PerformanceSnapshot = {
  id: 'snap-1',
  timestamp: Date.now(),
  formattedTime: '12:00:00 PM',
  memory: {
    usedMB: 50,
    totalMB: 100,
    limitMB: 2000,
    percentage: 2.5,
    isSupported: true,
    source: 'performance.memory',
  },
  battery: {
    level: 90,
    charging: true,
    chargingTime: null,
    dischargingTime: null,
    isSupported: true,
  },
  cpu: {
    loadPercentage: 20,
    eventLoopLagMs: 1,
    coreCount: 8,
    status: 'optimal',
  },
  systemHealthScore: 100,
  triggeredAlerts: [],
  tags: ['auto'],
};

test('State Manager: ADD_SNAPSHOT respects max retention', () => {
  let state = { ...INITIAL_STATE, maxRetention: 2 };
  state = appReducer(state, addSnapshot({ ...mockSnapshot, id: 's1' }));
  state = appReducer(state, addSnapshot({ ...mockSnapshot, id: 's2' }));
  state = appReducer(state, addSnapshot({ ...mockSnapshot, id: 's3' }));

  assert.equal(state.snapshots.length, 2);
  assert.equal(state.snapshots[0].id, 's2');
  assert.equal(state.snapshots[1].id, 's3');
});

test('State Manager: SET_INTERVAL adjusts interval and bounds', () => {
  let state = appReducer(INITIAL_STATE, setIntervalSeconds(10));
  assert.equal(state.intervalSeconds, 10);

  // Clamps to at least 1s
  state = appReducer(state, setIntervalSeconds(-5));
  assert.equal(state.intervalSeconds, 1);
});

test('State Manager: TOGGLE_MONITORING toggles and resets countdown', () => {
  let state = appReducer(INITIAL_STATE, toggleMonitoring(false));
  assert.equal(state.isMonitoring, false);

  state = appReducer(state, toggleMonitoring(true));
  assert.equal(state.isMonitoring, true);
  assert.equal(state.secondsRemaining, state.intervalSeconds);
});

test('State Manager: TICK_TIMER counts down', () => {
  let state = { ...INITIAL_STATE, secondsRemaining: 3 };
  state = appReducer(state, tickTimer());
  assert.equal(state.secondsRemaining, 2);
});

test('State Manager: SELECT_SNAPSHOT and SET_COMPARISON', () => {
  let state = appReducer(INITIAL_STATE, selectSnapshot('snap-1'));
  assert.equal(state.selectedSnapshotId, 'snap-1');

  state = appReducer(state, setComparison(0, 'snap-1'));
  state = appReducer(state, setComparison(1, 'snap-2'));
  assert.deepEqual(state.comparisonIds, ['snap-1', 'snap-2']);
});

test('State Manager: ADD_TAG_OR_NOTE updates snapshot immutably', () => {
  let state = appReducer(INITIAL_STATE, addSnapshot({ ...mockSnapshot, id: 'target-1', tags: ['init'] }));
  state = appReducer(state, addTagOrNote('target-1', 'benchmarked', 'High priority run'));

  const updated = state.snapshots.find(s => s.id === 'target-1');
  assert.ok(updated);
  assert.ok(updated?.tags.includes('benchmarked'));
  assert.equal(updated?.notes, 'High priority run');
});

test('State Manager: CLEAR_SNAPSHOTS resets snapshots', () => {
  let state = appReducer(INITIAL_STATE, addSnapshot(mockSnapshot));
  state = appReducer(state, clearSnapshots());
  assert.equal(state.snapshots.length, 0);
  assert.equal(state.selectedSnapshotId, null);
});
