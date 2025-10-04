"use client";

import { useState, useEffect, useCallback } from "react";

interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

interface UseLoadingTimeoutReturn {
  isTimeoutReached: boolean;
  elapsedTime: number;
  resetTimeout: () => void;
  startTimeout: () => void;
  stopTimeout: () => void;
}

export function useLoadingTimeout(
  isLoading: boolean,
  options: UseLoadingTimeoutOptions = {},
): UseLoadingTimeoutReturn {
  const { timeoutMs = 30000, onTimeout } = options;

  const [isTimeoutReached, setIsTimeoutReached] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const resetTimeout = useCallback(() => {
    setIsTimeoutReached(false);
    setElapsedTime(0);
    setStartTime(null);
  }, []);

  const startTimeout = useCallback(() => {
    const now = Date.now();
    setStartTime(now);
    setElapsedTime(0);
    setIsTimeoutReached(false);
  }, []);

  const stopTimeout = useCallback(() => {
    setStartTime(null);
  }, []);

  // Start timeout when loading begins
  useEffect(() => {
    if (isLoading && !startTime) {
      startTimeout();
    } else if (!isLoading) {
      stopTimeout();
      resetTimeout();
    }
  }, [isLoading, startTime, startTimeout, stopTimeout, resetTimeout]);

  // Update elapsed time and check for timeout
  useEffect(() => {
    if (!startTime || !isLoading) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      if (elapsed >= timeoutMs && !isTimeoutReached) {
        setIsTimeoutReached(true);
        onTimeout?.();
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [startTime, timeoutMs, isTimeoutReached, onTimeout, isLoading]);

  return {
    isTimeoutReached,
    elapsedTime,
    resetTimeout,
    startTimeout,
    stopTimeout,
  };
}
