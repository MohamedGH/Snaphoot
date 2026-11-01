import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pipe,
  compose,
  clamp,
  roundTo,
  safeDiv,
  sum,
  mean,
  median,
  stdDev,
  movingAverage,
  sortBy,
  filterBy,
} from './fp';

test('FP: pipe and compose', () => {
  const add2 = (x: number) => x + 2;
  const multiply3 = (x: number) => x * 3;

  const piped = pipe(add2, multiply3)(5); // (5 + 2) * 3 = 21
  assert.equal(piped, 21);

  const composed = compose(multiply3, add2)(5); // (5 + 2) * 3 = 21
  assert.equal(composed, 21);
});

test('FP: clamp and roundTo', () => {
  assert.equal(clamp(0, 100)(150), 100);
  assert.equal(clamp(0, 100)(-10), 0);
  assert.equal(clamp(0, 100)(50), 50);

  assert.equal(roundTo(1)(45.678), 45.7);
  assert.equal(roundTo(2)(45.678), 45.68);
  assert.equal(roundTo(0)(45.678), 46);
});

test('FP: safeDiv', () => {
  assert.equal(safeDiv(10, 2), 5);
  assert.equal(safeDiv(10, 0, 999), 999);
});

test('FP: statistical functions (sum, mean, median, stdDev)', () => {
  const numbers = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(sum(numbers), 40);
  assert.equal(mean(numbers), 5);
  assert.equal(median(numbers), 4.5);
  assert.equal(roundTo(2)(stdDev(numbers)), 2.14);

  // Edge cases
  assert.equal(mean([]), 0);
  assert.equal(median([]), 0);
  assert.equal(stdDev([5]), 0);
});

test('FP: movingAverage', () => {
  const data = [10, 20, 30, 40, 50];
  const ma = movingAverage(2)(data);
  // [10, 15, 25, 35, 45]
  assert.deepEqual(ma, [10, 15, 25, 35, 45]);
});

test('FP: sortBy and filterBy', () => {
  const items = [{ val: 3 }, { val: 1 }, { val: 2 }];
  const sortedAsc = sortBy<{ val: number }>(i => i.val, 'asc')(items);
  assert.deepEqual(sortedAsc.map(i => i.val), [1, 2, 3]);

  const sortedDesc = sortBy<{ val: number }>(i => i.val, 'desc')(items);
  assert.deepEqual(sortedDesc.map(i => i.val), [3, 2, 1]);

  const filtered = filterBy<{ val: number }>(i => i.val >= 2)(items);
  assert.deepEqual(filtered.map(i => i.val), [3, 2]);
});
