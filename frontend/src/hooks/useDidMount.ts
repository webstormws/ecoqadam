import { useEffect, useRef } from "react";

/** Run side-effect once on mount (StrictMode-safe). */
export function useDidMount(fn: () => void) {
  const run = useRef(false);
  useEffect(() => {
    if (run.current) return;
    run.current = true;
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}