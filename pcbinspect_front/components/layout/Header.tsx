"use client";

import { CurrentUser } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  user: CurrentUser;
}

function Header({ user }: HeaderProps) {
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

  return (
    <header
      className={`
        flex
        items-center
        justify-between
        px-8
        py-4
        border-b
        transition-colors
        duration-500
        ${
          darkMode
            ? "bg-white border-border"
            : "bg-white border-border"
        }
      `}
    >
      {/* =========================================
          INFORMATIONS UTILISATEUR
      ========================================= */}

      <div>
        <p
          className={`
            text-sm
            font-bold
            uppercase
            tracking-wide
            transition-colors
            duration-300
            ${
              darkMode
                ? "text-text-primary"
                : "text-text-primary"
            }
          `}
        >
          {user.firstName} {user.lastName}
        </p>

        <p
          className={`
            text-sm
            font-semibold
            mt-1
            transition-colors
            duration-300
            ${
              darkMode
                ? "text-text-secondary"
                : "text-text-secondary"
            }
          `}
        >
          {user.role}
        </p>
      </div>

      {/* =========================================
          MODE JOUR / NUIT
      ========================================= */}

      {mounted && (
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
            w-[70px]
            h-[30px]
            rounded-full
            overflow-hidden
            flex
            items-center
            transition-all
            duration-500
            ease-in-out
            shadow-sm
            border
            ${
              darkMode
                ? "bg-[#155454] border-[#287878]"
                : "bg-[#dedfe1] border-gray-300"
            }
          `}
        >
          {/* =====================================
              CERCLE
          ===================================== */}

          <div
            className={`
              absolute
              top-[2px]
              w-[25px]
              h-[25px]
              rounded-full
              flex
              items-center
              justify-center
              transition-all
              duration-500
              ease-in-out
              shadow-sm
              ${
                darkMode
                  ? "left-[3px] bg-[#d5eeee] border-[#9acaca]"
                  : "right-[3px] bg-white border-gray-300"
              }
              border
            `}
          >
            {darkMode ? (
              <Moon
                size={17}
                strokeWidth={1.8}
                className="text-[#0d3333]"
              />
            ) : (
              <Sun
                size={18}
                strokeWidth={1.8}
                className="text-black"
              />
            )}
          </div>
        </button>
      )}
    </header>
  );
}

export default Header;