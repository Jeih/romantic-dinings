import { useCallback, useRef } from "react";

export function useDebounce<Args extends unknown[], R extends Promise<void> | void> (
  callback: (...args: Args) => R,
  delay: number
): (...args: Args) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        void callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}