export type Ok<T> = { ok: true; value: T };
export type Err<E extends Error = Error> = { ok: false; error: E };
export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E extends Error>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E extends Error>(result: Result<T, E>): result is Ok<T> {
  return result.ok;
}

export function isErr<T, E extends Error>(result: Result<T, E>): result is Err<E> {
  return !result.ok;
}

export function unwrapOk<T, E extends Error>(result: Result<T, E>): T {
  if (!result.ok) {
    throw result.error;
  }

  return result.value;
}

export function unwrapErr<T, E extends Error>(result: Result<T, E>): E {
  if (result.ok) {
    throw new Error('Expected result to be an error.');
  }

  return result.error;
}
