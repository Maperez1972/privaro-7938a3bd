import { useCallback, useEffect, useState } from "react";

/**
 * Boolean state persisted in localStorage under a stable key.
 * Safe against SSR / blocked storage.
 */
export function usePersistentToggle(
  key: string,
  defaultValue = false
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? defaultValue : stored === "true";
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, String(value));
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }, [key, value]);

  const set = useCallback((next: boolean) => setValue(next), []);

  return [value, set];
}
