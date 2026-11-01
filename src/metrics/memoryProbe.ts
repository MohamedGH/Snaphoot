import { MemoryMetric } from './types';
import { clamp, roundTo, safeDiv } from '../utils/fp';

const BYTES_IN_MB = 1024 * 1024;

/**
 * Pure function to format and compute memory metric
 */
export const computeMemoryMetric = (
  usedBytes: number,
  totalBytes: number,
  limitBytes: number,
  source: 'performance.memory' | 'deviceMemory' | 'synthetic-benchmark',
  isSupported: boolean
): MemoryMetric => {
  const usedMB = roundTo(1)(usedBytes / BYTES_IN_MB);
  const totalMB = roundTo(1)(totalBytes / BYTES_IN_MB);
  const limitMB = roundTo(1)(limitBytes / BYTES_IN_MB);
  const rawPercentage = safeDiv(usedMB, limitMB > 0 ? limitMB : totalMB, 0) * 100;
  const percentage = pipeClamp(roundTo(1)(rawPercentage));

  return {
    usedMB,
    totalMB: totalMB > 0 ? totalMB : usedMB * 1.5,
    limitMB: limitMB > 0 ? limitMB : 4096,
    percentage,
    isSupported,
    source,
  };
};

const pipeClamp = (val: number): number => clamp(0, 100)(val);

/**
 * Probe memory usage in the browser environment safely
 */
export const probeMemory = (): MemoryMetric => {
  const perf = typeof window !== 'undefined' ? (window.performance as any) : null;

  if (perf && perf.memory) {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = perf.memory;
    return computeMemoryMetric(
      usedJSHeapSize,
      totalJSHeapSize,
      jsHeapSizeLimit,
      'performance.memory',
      true
    );
  }

  // Fallback 1: navigator.deviceMemory if available
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
  const deviceMemoryGB = nav?.deviceMemory || 4;
  const domNodeCount = typeof document !== 'undefined' ? document.querySelectorAll('*').length : 100;
  
  // Approximate dynamic memory based on DOM nodes + base JS runtime
  const estimatedUsedBytes = (35 + (domNodeCount * 0.05)) * BYTES_IN_MB;
  const estimatedTotalBytes = (80 + (domNodeCount * 0.08)) * BYTES_IN_MB;
  const estimatedLimitBytes = (deviceMemoryGB * 1024) * BYTES_IN_MB;

  return computeMemoryMetric(
    estimatedUsedBytes,
    estimatedTotalBytes,
    estimatedLimitBytes,
    nav?.deviceMemory ? 'deviceMemory' : 'synthetic-benchmark',
    false
  );
};
