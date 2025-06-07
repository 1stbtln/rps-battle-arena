import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "lucide-react";
import { BattleArena } from "./BattleArena";
import { BettingPlatform } from "./BettingPlatform";
import { EntityDistribution } from "./EntityDistribution";
import { BattleTimeline } from "./BattleTimeline";
import { EntityDetailView } from "./EntityDetailView";

interface ModularDashboardProps {
  className?: string;
}

export const ModularDashboard: React.FC<ModularDashboardProps> = ({
  className = "",
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<
    "timeline" | "betting" | "distribution" | "details"
  >("timeline");

  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("rps-battle-theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  return (
    <div className={`modular-dashboard h-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 h-full gap-2 p-2">
        {/* Main Arena */}
        <div className="lg:col-span-3 relative">
          <BattleArena className="w-full h-full" />

          <motion.button
            className="absolute top-2 right-2 p-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60"
            onClick={toggleEditMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={16} />
          </motion.button>
        </div>

        {/* Info Panels Column */}
        <div className="flex flex-col gap-2">
          {/* Panel Selector Tabs */}
          <div className="flex rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-1 text-xs ${
                activeInfoPanel === "timeline" ? "bg-blue-500" : "bg-black/40"
              }`}
              onClick={() => setActiveInfoPanel("timeline")}
            >
              Timeline
            </button>
            <button
              className={`flex-1 py-1 text-xs ${
                activeInfoPanel === "betting" ? "bg-blue-500" : "bg-black/40"
              }`}
              onClick={() => setActiveInfoPanel("betting")}
            >
              Betting
            </button>
            <button
              className={`flex-1 py-1 text-xs ${
                activeInfoPanel === "distribution"
                  ? "bg-blue-500"
                  : "bg-black/40"
              }`}
              onClick={() => setActiveInfoPanel("distribution")}
            >
              Types
            </button>
            <button
              className={`flex-1 py-1 text-xs ${
                activeInfoPanel === "details" ? "bg-blue-500" : "bg-black/40"
              }`}
              onClick={() => setActiveInfoPanel("details")}
            >
              Details
            </button>
          </div>

          {/* Active Panel */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              {activeInfoPanel === "timeline" && (
                <motion.div
                  key="timeline"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BattleTimeline className="p-2 h-full" />
                </motion.div>
              )}
              {activeInfoPanel === "betting" && (
                <motion.div
                  key="betting"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BettingPlatform className="p-2 h-full flex flex-col" />
                </motion.div>
              )}
              {activeInfoPanel === "distribution" && (
                <motion.div
                  key="distribution"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EntityDistribution className="p-2 h-full" />
                </motion.div>
              )}
              {activeInfoPanel === "details" && (
                <motion.div
                  key="details"
                  className="h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <EntityDetailView className="p-2 h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
