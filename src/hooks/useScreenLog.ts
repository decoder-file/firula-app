import { useFocusEffect, usePathname } from "expo-router";
import { useCallback } from "react";

/**
 * Hook que faz log do nome da tela no console quando ela entra em foco.
 * Útil para facilitar o desenvolvimento e debugging.
 */
export function useScreenLog() {
  const pathname = usePathname();

  useFocusEffect(
    useCallback(() => {
      console.log(`🎯 Screen: ${pathname}`);
      return undefined;
    }, [pathname])
  );
}
