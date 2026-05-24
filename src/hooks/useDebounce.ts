import { useCallback, useEffect, useRef } from 'react';

export function useDebounce<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs: number) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
  }, []);

  const flush = useCallback(
    (...args: TArgs) => {
      cancel();
      callbackRef.current(...args);
    },
    [cancel],
  );

  const debounce = useCallback(
    (...args: TArgs) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        callbackRef.current(...args);
      }, delayMs);
    },
    [cancel, delayMs],
  );

  useEffect(() => cancel, [cancel]);

  return {
    cancel,
    debounce,
    flush,
  };
}
