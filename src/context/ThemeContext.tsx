import { createContext } from "react";

export interface ThemeContextType {
  isDark: boolean;
  accentColor: string; // e.g., "theme-blue", "theme-green"
  toggleDark: () => void;
  setAccentColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
