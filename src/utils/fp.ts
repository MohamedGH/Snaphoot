/**
 * Pure functional programming utilities
 */

export const pipe = <T>(...fns: Array<(arg: any) => any>) => (initial: T): any =>
  fns.reduce((acc, fn) => fn(acc), initial);

export const compose = <T>(...fns: Array<(arg: any) => any>) => (initial: T): any =>
  fns.reduceRight((acc, fn) => fn(acc), initial);

export const clamp = (min: number, max: number) => (val: number): number =>
  Math.min(Math.max(val, min), max);

export const roundTo = (decimals: number) => (val: number): number => {
  const factor = 10 ** decimals;
  return Math.round(val * factor) / factor;
};

export const safeDiv = (numerator: number, denominator: number, fallback = 0): number =>
  denominator === 0 ? fallback : numerator / denominator;

export const sum = (arr: readonly number[]): number =>
  arr.reduce((acc, curr) => acc + curr, 0);

export const mean = (arr: readonly number[]): number =>
  arr.length === 0 ? 0 : sum(arr) / arr.length;

export const median = (arr: readonly number[]): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const stdDev = (arr: readonly number[]): number => {
  if (arr.length <= 1) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(value => (value - avg) ** 2);
  const avgSquareDiff = sum(squareDiffs) / (arr.length - 1);
  return Math.sqrt(avgSquareDiff);
};

export const movingAverage = (windowSize: number) => (arr: readonly number[]): number[] => {
  if (windowSize <= 0 || arr.length === 0) return [];
  return arr.map((_, index, original) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = original.slice(start, index + 1);
    return mean(slice);
  });
};

export const sortBy = <T>(fn: (item: T) => number | string, direction: 'asc' | 'desc' = 'asc') =>
  (list: readonly T[]): T[] => {
    return [...list].sort((a, b) => {
      const valA = fn(a);
      const valB = fn(b);
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

export const filterBy = <T>(predicate: (item: T) => boolean) => (list: readonly T[]): T[] =>
  list.filter(predicate);
