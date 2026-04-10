import type { ReactNode } from "react";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

interface ScreenProps {
  children: ReactNode;
  className?: string;
  edges?: Edge[];
}

export const Screen = ({ children, className = "", edges = ["top"] }: ScreenProps) => {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-background ${className}`}>
      {children}
    </SafeAreaView>
  );
};