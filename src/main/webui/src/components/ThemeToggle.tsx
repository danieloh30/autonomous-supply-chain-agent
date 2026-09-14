import { useLayoutEffect, useState } from "react";
import "./ThemeToggle.css";

type Theme = "dark" | "light";
const storageKey = "supply-chain-theme";

function savedTheme(): Theme {
  try {
    return window.localStorage.getItem(storageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(savedTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      // The selector still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <div className="theme-switch" role="group" aria-label="Color theme">
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => setTheme("dark")}
      >
        <span aria-hidden="true">☾</span> Dark
      </button>
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => setTheme("light")}
      >
        <span aria-hidden="true">☀</span> Light
      </button>
    </div>
  );
}
