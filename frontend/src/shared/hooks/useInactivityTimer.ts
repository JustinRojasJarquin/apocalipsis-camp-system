import { useEffect, useRef, useState, useCallback } from "react";
import { storage } from "../utils/storage";

const SESSION_SECONDS = 20 * 60; // 20 minutes (matches backend JWT_EXPIRATION_SECONDS)

export function useInactivityTimer() {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isActive, setIsActive] = useState(true);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearCountdown();
    setIsActive(false);
    setSecondsLeft(0);
    storage.clearAuth();
    window.location.href = "/";
  }, [clearCountdown]);

  const startCountdown = useCallback(() => {
    clearCountdown();
    setSecondsLeft(SESSION_SECONDS);
    setIsActive(true);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown, logout]);

  const resetTimer = useCallback(() => {
    if (!storage.getToken()) return;
    startCountdown();
  }, [startCountdown]);

  useEffect(() => {
    if (!storage.getToken()) return;

    startCountdown();

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      clearCountdown();
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, startCountdown, clearCountdown]);

  return { secondsLeft, isActive, logout };
}