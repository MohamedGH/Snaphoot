import { BatteryMetric } from './types';
import { clamp, roundTo } from '../utils/fp';

// In-memory simulated battery state for devices/browsers without Battery API
let fallbackBatteryLevel = 88;
let fallbackIsCharging = true;

/**
 * Pure function to format battery metric
 */
export const computeBatteryMetric = (
  rawLevel: number, // 0.0 to 1.0 or 0 to 100
  charging: boolean,
  chargingTime: number | null,
  dischargingTime: number | null,
  isSupported: boolean
): BatteryMetric => {
  // Normalize level to 0-100
  const normalizedLevel = rawLevel <= 1 ? rawLevel * 100 : rawLevel;
  const level = clamp(0, 100)(roundTo(0)(normalizedLevel));

  return {
    level,
    charging,
    chargingTime: chargingTime && Number.isFinite(chargingTime) ? chargingTime : null,
    dischargingTime: dischargingTime && Number.isFinite(dischargingTime) ? dischargingTime : null,
    isSupported,
  };
};

/**
 * Update fallback battery simulation (used for testing or browsers where API is restricted)
 */
export const updateFallbackBattery = (deltaLevel: number, charging?: boolean): void => {
  fallbackBatteryLevel = clamp(5, 100)(fallbackBatteryLevel + deltaLevel);
  if (charging !== undefined) {
    fallbackIsCharging = charging;
  }
};

/**
 * Probe battery state
 */
export const probeBattery = async (): Promise<BatteryMetric> => {
  try {
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    if (nav && typeof nav.getBattery === 'function') {
      const battery = await nav.getBattery();
      return computeBatteryMetric(
        battery.level,
        battery.charging,
        battery.chargingTime,
        battery.dischargingTime,
        true
      );
    }
  } catch (err) {
    // Battery API restricted or rejected
  }

  // Graceful fallback for browsers where navigator.getBattery is restricted/deprecated for privacy
  return computeBatteryMetric(
    fallbackBatteryLevel,
    fallbackIsCharging,
    fallbackIsCharging ? 3600 : null,
    fallbackIsCharging ? null : 14400,
    false
  );
};
