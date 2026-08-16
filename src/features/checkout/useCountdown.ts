import { useEffect, useState } from "react";

export function useCountdown(targetIso: string | null | undefined) {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [remainingMs, setRemainingMs] = useState(() => (target ? target - Date.now() : 0));

  useEffect(() => {
    if (!target) return;
    setRemainingMs(target - Date.now());
    const interval = setInterval(() => {
      setRemainingMs(target - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    label: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    expired: target != null && clamped === 0,
  };
}
