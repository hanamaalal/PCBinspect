"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;

    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-[230px] h-[86px] rounded-full bg-gray-200" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        darkMode
          ? "Passer au mode clair"
          : "Passer au mode sombre"
      }
      className={`
        relative
        w-[230px]
        h-[86px]
        rounded-full
        overflow-hidden
        flex
        items-center
        transition-all
        duration-500
        ease-in-out
        shadow-sm
        ${
          darkMode
            ? "bg-black"
            : "bg-[#dedfe1]"
        }
      `}
    >
      {/* CERCLE */}

      <div
        className={`
          absolute
          top-[3px]
          w-[80px]
          h-[80px]
          rounded-full
          bg-white
          border
          border-gray-300
          flex
          items-center
          justify-center
          transition-all
          duration-500
          ease-in-out
          shadow-sm
          ${
            darkMode
              ? "left-[3px]"
              : "right-[3px]"
          }
        `}
      >
        {darkMode ? (
          <Moon
            size={43}
            strokeWidth={1.5}
            className="text-black"
          />
        ) : (
          <Sun
            size={43}
            strokeWidth={1.5}
            className="text-black"
          />
        )}
      </div>

      {/* TEXTE */}

      <span
        className={`
          absolute
          text-[17px]
          font-bold
          tracking-wide
          transition-all
          duration-500
          ${
            darkMode
              ? "left-[95px] text-white"
              : "left-[29px] text-black"
          }
        `}
      >
        {darkMode
          ? "NIGHT MODE"
          : "DAY MODE"}
      </span>
    </button>
  );
}