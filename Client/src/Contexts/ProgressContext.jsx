import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
} from "react";

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [active, setActive] = useState(false);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [currentPercent, setCurrentPercent] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [message, setMessage] = useState("");
  const totalRef = useRef(0);

  const percent = total
    ? Math.round(((completed + currentPercent / 100) / total) * 100)
    : 0;

  const start = useCallback((t, options = {}) => {
    totalRef.current = t;
    setTotal(t);
    setCompleted(0);
    setCurrentPercent(0);
    setCurrentFileName(options.currentFileName || "");
    setMessage(options.message || "");
    setActive(t > 0);
  }, []);

  const step = useCallback((count = 1) => {
    setCompleted((c) => {
      const next = c + count;
      const cap = totalRef.current > 0 ? totalRef.current : next;
      return next > cap ? cap : next;
    });
    setCurrentPercent(0);
    setCurrentFileName("");
    setMessage("");
  }, []);

  const updateCurrent = useCallback((progress = {}) => {
    if (typeof progress.percent === "number") {
      const nextPercent = Math.max(0, Math.min(100, progress.percent));
      setCurrentPercent((current) => Math.max(current, nextPercent));
    }
    if (progress.currentFileName !== undefined) {
      setCurrentFileName(progress.currentFileName || "");
    }
    if (progress.message !== undefined) {
      setMessage(progress.message || "");
    }
  }, []);

  const finish = useCallback(() => {
    setCompleted(() => totalRef.current);
    setCurrentPercent(100);
    setActive(false);
  }, []);

  const reset = useCallback(() => {
    setActive(false);
    setTotal(0);
    setCompleted(0);
    setCurrentPercent(0);
    setCurrentFileName("");
    setMessage("");
    totalRef.current = 0;
  }, []);

  const value = useMemo(
    () => ({
      active,
      total,
      completed,
      currentPercent,
      currentFileName,
      message,
      percent,
      start,
      step,
      updateCurrent,
      finish,
      reset,
    }),
    [
      active,
      total,
      completed,
      currentPercent,
      currentFileName,
      message,
      percent,
      start,
      step,
      updateCurrent,
      finish,
      reset,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useGlobalProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useGlobalProgress must be used within ProgressProvider");
  return ctx;
}
