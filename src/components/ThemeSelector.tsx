import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Zap, Paintbrush } from "lucide-react";

interface ThemeSelectorProps {
  className?: string;
}

type Theme = "dark" | "light" | "cyber" | "neon";

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = "",
}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark");

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("rps-battle-theme") as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("rps-battle-theme", theme);
  };

  return (
    <div className={`theme-selector flex items-center gap-2 ${className}`}>
      <span className="text-xs sm:text-sm text-gray-400">Theme:</span>
      <div className="flex gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme("dark")}
          className={`p-1.5 rounded-full ${
            currentTheme === "dark"
              ? "bg-blue-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
          title="Dark Theme"
        >
          <Moon size={14} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme("light")}
          className={`p-1.5 rounded-full ${
            currentTheme === "light"
              ? "bg-blue-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
          title="Light Theme"
        >
          <Sun size={14} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme("cyber")}
          className={`p-1.5 rounded-full ${
            currentTheme === "cyber"
              ? "bg-cyan-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
          title="Cyber Theme"
        >
          <Zap size={14} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme("neon")}
          className={`p-1.5 rounded-full ${
            currentTheme === "neon"
              ? "bg-pink-500 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10"
          }`}
          title="Neon Theme"
        >
          <Paintbrush size={14} />
        </motion.button>
      </div>
    </div>
  );
};
