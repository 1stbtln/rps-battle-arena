import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Play, Pause, Square, RotateCcw, Zap, Settings } from "lucide-react";

interface TopControlBarProps {
  className?: string;
}

export const TopControlBar: React.FC<TopControlBarProps> = ({
  className = "",
}) => {
  const {
    isRunning,
    isPaused,
    speed,
    entities,
    config,
    startBattle,
    pauseBattle,
    stopBattle,
    setSpeed,
    resetBattle,
    setGameMode,
  } = useGameStore();

  const aliveEntities = entities.filter((e) => e.isAlive);
  const canStart = aliveEntities.length > 1;

  return (
    <div className={`top-control-bar ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">RPS Battle Arena</h1>

          {/* Game Mode Selector */}
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm font-medium text-gray-300">Mode:</label>
            <select
              value={config.gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              disabled={isRunning}
              className="px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/40 focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 8px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "16px",
                paddingRight: "32px",
              }}
            >
              <option value="classic" className="bg-gray-800 text-white">
                Classic
              </option>
              <option value="lifepoints" className="bg-gray-800 text-white">
                Life Points
              </option>
            </select>
          </div>

          <div className="flex items-center gap-1 ml-6">
            <motion.button
              className={`px-3 py-1 rounded flex items-center gap-1 ${
                !canStart
                  ? "bg-gray-700/50 cursor-not-allowed"
                  : isRunning
                  ? isPaused
                    ? "bg-yellow-600 hover:bg-yellow-500"
                    : "bg-blue-600 hover:bg-blue-500"
                  : "bg-green-600 hover:bg-green-500"
              }`}
              onClick={isRunning ? pauseBattle : startBattle}
              disabled={!canStart}
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
            >
              {isRunning ? (
                isPaused ? (
                  <>
                    <Play size={16} /> Resume
                  </>
                ) : (
                  <>
                    <Pause size={16} /> Pause
                  </>
                )
              ) : (
                <>
                  <Play size={16} /> Start
                </>
              )}
            </motion.button>

            <motion.button
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 flex items-center gap-1"
              onClick={stopBattle}
              disabled={!isRunning}
              whileHover={{ scale: isRunning ? 1.05 : 1 }}
              whileTap={{ scale: isRunning ? 0.95 : 1 }}
            >
              <Square size={16} /> Stop
            </motion.button>

            <motion.button
              className="px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 flex items-center gap-1"
              onClick={resetBattle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={16} /> Reset
            </motion.button>
          </div>

          <div className="ml-6 flex items-center gap-2">
            <span className="text-sm font-medium">Speed:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2, 5].map((speedValue) => (
                <motion.button
                  key={speedValue}
                  className={`px-2 py-1 rounded text-sm ${
                    Math.abs(speed - speedValue) < 0.1
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  onClick={() => setSpeed(speedValue)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {speedValue}x
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Entities:</span>
            <span className="text-sm font-bold">{aliveEntities.length}</span>
          </div>

          <motion.button
            className="ml-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={18} />
          </motion.button>
        </div>
      </div>

      {/* Mode Description */}
      <div className="text-xs text-gray-400 max-w-md text-right">
        {config.gameMode === "classic"
          ? "Classic: Entities are eliminated when defeated"
          : "Life Points: Entities lose life when defeated, convert when reaching 0 lives"}
      </div>

      {/* Battle Status Indicator */}
      <div className="mt-2 h-1 bg-gray-800 w-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isRunning
              ? isPaused
                ? "bg-yellow-500"
                : "bg-green-500"
              : "bg-gray-600"
          }`}
          initial={{ width: "0%" }}
          animate={{ width: isRunning ? "100%" : "0%" }}
          transition={{
            duration: isRunning ? 60 / speed : 0.3,
            ease: "linear",
            repeat: isRunning ? Infinity : 0,
          }}
        />
      </div>
    </div>
  );
};
