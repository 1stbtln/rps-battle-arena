import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Save, Settings } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { SaveGamePanel } from "./SaveGamePanel";

interface ControlPanelProps {
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  className = "",
}) => {
  const {
    isRunning,
    isPaused,
    speed,
    entities,
    startBattle,
    pauseBattle,
    stopBattle,
    setSpeed,
    resetBattle,
    clearKillFeed,
    performanceSettings,
    setPerformanceSettings,
    performanceStats,
  } = useGameStore();

  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);

  const aliveEntities = entities.filter((e) => e.isAlive);
  const canStart = aliveEntities.length >= 2;

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };
  return (
    <motion.div
      className={`controls-panel ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4 text-center">Battle Controls</h3>

      {/* Performance indicator */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Performance</span>
          <motion.button
            className="p-1 hover:bg-white/10 rounded"
            onClick={() => setShowPerformanceSettings(!showPerformanceSettings)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={14} />
          </motion.button>
        </div>

        <div className="flex justify-between text-xs">
          <span>FPS:</span>
          <span
            className={`font-mono ${
              performanceStats.fps >= 50
                ? "text-green-400"
                : performanceStats.fps >= 30
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {Math.round(performanceStats.fps)}
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span>Entities:</span>
          <span className="font-mono">{performanceStats.entityCount}</span>
        </div>
      </div>

      {/* Performance Settings */}
      {showPerformanceSettings && (
        <motion.div
          className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="text-sm font-medium mb-3">Performance Settings</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Max FPS:</label>
              <select
                value={performanceSettings.maxFPS}
                onChange={(e) =>
                  setPerformanceSettings({ maxFPS: Number(e.target.value) })
                }
                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs"
              >
                <option value={30}>30 FPS (Performance)</option>
                <option value={45}>45 FPS (Balanced)</option>
                <option value={60}>60 FPS (Quality)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1">Render Quality:</label>
              <select
                value={performanceSettings.renderQuality}
                onChange={(e) =>
                  setPerformanceSettings({
                    renderQuality: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-xs"
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Detailed)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Effects:</span>
              <input
                type="checkbox"
                checked={performanceSettings.enableEffects}
                onChange={(e) =>
                  setPerformanceSettings({ enableEffects: e.target.checked })
                }
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Collision Optimization:</span>
              <input
                type="checkbox"
                checked={performanceSettings.enableCollisionOptimization}
                onChange={(e) =>
                  setPerformanceSettings({
                    enableCollisionOptimization: e.target.checked,
                  })
                }
                className="rounded"
              />
            </div>
          </div>

          <motion.button
            className="w-full mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
            onClick={() => {
              const optimal = useGameStore.getState().getOptimalSettings();
              setPerformanceSettings(optimal);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Auto-Optimize
          </motion.button>
        </motion.div>
      )}

      {/* Main Controls */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.button
          className={`cyber-button flex items-center justify-center gap-2 ${
            !canStart ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={isRunning ? pauseBattle : startBattle}
          disabled={!canStart}
          whileHover={{ scale: canStart ? 1.05 : 1 }}
          whileTap={{ scale: canStart ? 0.95 : 1 }}
        >
          {isRunning ? (
            isPaused ? (
              <Play size={18} />
            ) : (
              <Pause size={18} />
            )
          ) : (
            <Play size={18} />
          )}
          {isRunning ? (isPaused ? "Resume" : "Pause") : "Start"}
        </motion.button>

        <motion.button
          className="cyber-button flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600"
          onClick={stopBattle}
          disabled={!isRunning}
          whileHover={{ scale: isRunning ? 1.05 : 1 }}
          whileTap={{ scale: isRunning ? 0.95 : 1 }}
        >
          <Square size={18} />
          Stop
        </motion.button>
      </div>

      {/* Speed Control */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Battle Speed: {speed.toFixed(1)}x
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">0.1x</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-xs text-gray-400">5.0x</span>
        </div>
      </div>

      {/* Quick Speed Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[0.5, 1, 2, 5].map((speedValue) => (
          <motion.button
            key={speedValue}
            className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
              Math.abs(speed - speedValue) < 0.1
                ? "border-blue-500 bg-blue-500/20 text-blue-300"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            }`}
            onClick={() => handleSpeedChange(speedValue)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {speedValue}x
          </motion.button>
        ))}
      </div>

      {/* Save/Load Game */}
      <div className="mb-6">
        <motion.button
          className="cyber-button w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
          onClick={() => setIsSavePanelOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={18} />
          Save/Load Game
        </motion.button>
      </div>

      {/* Reset Controls */}
      <div className="grid grid-cols-1 gap-3">
        <motion.button
          className="cyber-button flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600"
          onClick={resetBattle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={18} />
          Reset Battle
        </motion.button>

        <motion.button
          className="cyber-button flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700"
          onClick={clearKillFeed}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear Kill Feed
        </motion.button>
      </div>

      {/* Battle Status */}
      <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <h4 className="font-semibold mb-2">Battle Status</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="text-blue-300 capitalize flex items-center gap-1">
              {useGameStore.getState().config.gameMode}
              {useGameStore.getState().config.gameMode === "lifepoints" && (
                <span className="text-red-400">♥♥♥</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Rock count:</span>
            <span className="text-red-300">
              {aliveEntities.filter((e) => e.type === "rock").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Paper count:</span>
            <span className="text-blue-300">
              {aliveEntities.filter((e) => e.type === "paper").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Scissors count:</span>
            <span className="text-yellow-300">
              {aliveEntities.filter((e) => e.type === "scissors").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={`${
                isRunning
                  ? isPaused
                    ? "text-yellow-300"
                    : "text-green-300"
                  : "text-gray-300"
              }`}
            >
              {isRunning ? (isPaused ? "Paused" : "Running") : "Stopped"}
            </span>
          </div>
        </div>
      </div>

      {/* Save/Load Game Panel */}
      <SaveGamePanel
        isOpen={isSavePanelOpen}
        onClose={() => setIsSavePanelOpen(false)}
      />
    </motion.div>
  );
};
