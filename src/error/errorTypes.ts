/**
 * Error Manager domain types
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';

export interface AppErrorLog {
  readonly id: string;
  readonly timestamp: number;
  readonly severity: ErrorSeverity;
  readonly code: string;
  readonly message: string;
  readonly details?: string;
  readonly dismissed: boolean;
}

export interface ToastMessage {
  readonly id: string;
  readonly severity: ErrorSeverity;
  readonly message: string;
}
