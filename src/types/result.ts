/**
 * Functional Result<T, E> data type for safe error handling.
 */

export type Ok<T> = {
  readonly _tag: 'Ok';
  readonly value: T;
};

export type Err<E> = {
  readonly _tag: 'Err';
  readonly error: E;
};

export type Result<T, E = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({
  _tag: 'Ok',
  value,
});

export const err = <E>(error: E): Err<E> => ({
  _tag: 'Err',
  error,
});

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result._tag === 'Ok';

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result._tag === 'Err';

export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (val: T) => U
): Result<U, E> => {
  return isOk(result) ? ok(fn(result.value)) : result;
};

export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (errVal: E) => F
): Result<T, F> => {
  return isErr(result) ? err(fn(result.error)) : result;
};

export const flatMap = <T, U, E>(
  result: Result<T, E>,
  fn: (val: T) => Result<U, E>
): Result<U, E> => {
  return isOk(result) ? fn(result.value) : result;
};

export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return isOk(result) ? result.value : defaultValue;
};

export const matchResult = <T, E, R>(
  result: Result<T, E>,
  handlers: {
    onOk: (val: T) => R;
    onErr: (errVal: E) => R;
  }
): R => {
  return isOk(result) ? handlers.onOk(result.value) : handlers.onErr(result.error);
};

export const tryCatch = <T>(fn: () => T, fallbackError?: (e: unknown) => Error): Result<T, Error> => {
  try {
    return ok(fn());
  } catch (caught) {
    const error = fallbackError 
      ? fallbackError(caught) 
      : caught instanceof Error 
        ? caught 
        : new Error(String(caught));
    return err(error);
  }
};

export const tryCatchAsync = async <T>(
  fn: () => Promise<T>,
  fallbackError?: (e: unknown) => Error
): Promise<Result<T, Error>> => {
  try {
    const val = await fn();
    return ok(val);
  } catch (caught) {
    const error = fallbackError 
      ? fallbackError(caught) 
      : caught instanceof Error 
        ? caught 
        : new Error(String(caught));
    return err(error);
  }
};
