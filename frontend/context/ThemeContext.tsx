
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined,
  );

const THEME_STORAGE_KEY = "salonos_theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<Theme>("light");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY,
      ) as Theme | null;

    let initialTheme: Theme;

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      initialTheme = savedTheme;
    } else {
      initialTheme =
        window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches
          ? "dark"
          : "light";
    }

    setTheme(initialTheme);

    document.documentElement.dataset.theme =
      initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "light"
        ? "dark"
        : "light";

    setTheme(nextTheme);

    // Save selected theme permanently
    localStorage.setItem(
      THEME_STORAGE_KEY,
      nextTheme,
    );

    // Apply theme immediately
    document.documentElement.dataset.theme =
      nextTheme;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}



