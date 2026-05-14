import { useState, useEffect, type ReactNode } from "react";
import { ThemeContext } from "@/context/ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem("accentColor") ?? "";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.add("disable-transitions");

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.classList.remove("theme-blue", "theme-green", "theme-red");
    if (accentColor) {
      root.classList.add(accentColor);
    }

    localStorage.setItem("theme", isDark ? "dark" : "light");
    if (accentColor) {
      localStorage.setItem("accentColor", accentColor);
    }

    // Two-step: rAF waits for the next frame to be scheduled,
    // setTimeout(0) inside it waits for the paint to actually commit.
    // Together they guarantee transitions are re-enabled after the
    // theme swap is visible — preventing the color-flash jank.
    let timeoutId: ReturnType<typeof setTimeout>;
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
        root.classList.remove("disable-transitions");
      }, 0);
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [isDark, accentColor]);

  const toggleDark = () => setIsDark((prev) => !prev);

  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        accentColor,
        toggleDark,
        setAccentColor: handleSetAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
