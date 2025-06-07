import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { BattleArena } from "./BattleArena";
import { TopControlBar } from "./TopControlBar";
import { EntityCompositionPanel } from "./TeamSelector";
import { LiveMatchStats } from "./LiveMatchStats";
import { StatsDashboard } from "./StatsDashboard";
import { KillFeed } from "./KillFeed";
import { BettingPlatform } from "./BettingPlatform";
import { RulesExplainer } from "./RulesExplainer";

export const MainLayout: React.FC = () => {
  const { entities, isRunning, config } = useGameStore();
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"betting" | "rules">(
    "betting"
  );

  const aliveEntities = entities.filter((e) => e.isAlive);
  const hasEntities = aliveEntities.length > 0;

  const handleMouseDown = useCallback((side: "left" | "right") => {
    setIsResizing(side);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      if (isResizing === "left") {
        const newWidth = Math.max(250, Math.min(600, e.clientX));
        setLeftSidebarWidth(newWidth);
      } else if (isResizing === "right") {
        const newWidth = Math.max(
          250,
          Math.min(600, window.innerWidth - e.clientX)
        );
        setRightSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Top Control Bar - Always visible */}
      <TopControlBar className="p-3 border-b border-white/10 flex-shrink-0" />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Resizable */}
        <div
          className="resizable-sidebar border-r border-white/10 overflow-hidden bg-black/20 flex-shrink-0"
          style={{ width: `${leftSidebarWidth}px` }}
        >
          <div
            className="resize-handle right"
            onMouseDown={() => handleMouseDown("left")}
          />

          <AnimatePresence mode="wait">
            {isRunning ? (
              <LiveMatchStats className="h-full" key="live-stats" />
            ) : (
              <EntityCompositionPanel className="h-full" key="entity-setup" />
            )}
          </AnimatePresence>
        </div>

        {/* Main Battle Area - Center */}
        <div className="flex-1 relative min-w-0">
          <BattleArena className="w-full h-full" />

          {/* Kill Feed Overlay - Only show in life points mode */}
          {config.gameMode === "lifepoints" && (
            <div className="absolute top-4 right-4 w-80 opacity-90 z-10 pointer-events-none">
              <KillFeed className="pointer-events-auto" />
            </div>
          )}

          {/* Stats Overlay - Only Show When Battle Has Entities */}
          {hasEntities && (
            <motion.div
              className="absolute bottom-4 left-4 right-4 flex gap-3 opacity-90 z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card p-3 flex-1">
                <StatsDashboard className="inline-mini" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Resizable */}
        <div
          className="resizable-sidebar border-l border-white/10 overflow-hidden bg-black/20 flex-shrink-0"
          style={{ width: `${rightSidebarWidth}px` }}
        >
          <div
            className="resize-handle left"
            onMouseDown={() => handleMouseDown("right")}
          />

          <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/10">
              <button
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeRightTab === "betting"
                    ? "bg-white/10 text-blue-400"
                    : "text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setActiveRightTab("betting")}
              >
                Betting
              </button>
              <button
                className={`flex-1 py-2 px-3 text-sm font-medium ${
                  activeRightTab === "rules"
                    ? "bg-white/10 text-blue-400"
                    : "text-gray-400 hover:bg-white/5"
                }`}
                onClick={() => setActiveRightTab("rules")}
              >
                Rules
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeRightTab === "betting" ? (
                  <motion.div
                    key="betting"
                    className="h-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BettingPlatform className="h-full p-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="rules"
                    className="h-full"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RulesExplainer className="h-full p-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
