import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Users, Zap, RotateCcw, Grid, MapPin } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface EntityCompositionPanelProps {
  className?: string;
}

type DeploymentZone = "random" | "corners";

export const EntityCompositionPanel: React.FC<EntityCompositionPanelProps> = ({
  className = "",
}) => {
  const { clearEntities, entities, setEntityComposition } = useGameStore();
  const [rockCount, setRockCount] = useState(10);
  const [paperCount, setPaperCount] = useState(10);
  const [scissorsCount, setScissorsCount] = useState(10);
  const [deploymentZone, setDeploymentZone] =
    useState<DeploymentZone>("random");

  const aliveEntities = entities.filter((e) => e.isAlive);
  const currentRocks = aliveEntities.filter((e) => e.type === "rock").length;
  const currentPapers = aliveEntities.filter((e) => e.type === "paper").length;
  const currentScissors = aliveEntities.filter(
    (e) => e.type === "scissors"
  ).length;

  const handleSetComposition = () => {
    clearEntities();
    // Use the deployment zone when setting entity composition
    setEntityComposition(
      {
        rocks: rockCount,
        papers: paperCount,
        scissors: scissorsCount,
      },
      deploymentZone
    );
  };

  const handlePreset = (preset: string) => {
    switch (preset) {
      case "balanced":
        setRockCount(15);
        setPaperCount(15);
        setScissorsCount(15);
        break;
      case "small":
        setRockCount(5);
        setPaperCount(5);
        setScissorsCount(5);
        break;
      case "large":
        setRockCount(25);
        setPaperCount(25);
        setScissorsCount(25);
        break;
      case "chaos":
        setRockCount(Math.floor(Math.random() * 20) + 10);
        setPaperCount(Math.floor(Math.random() * 20) + 10);
        setScissorsCount(Math.floor(Math.random() * 20) + 10);
        break;
    }
  };

  // Helper to render deployment zone visualization
  const renderZoneVisualization = (zone: DeploymentZone) => {
    const cells = [];
    const grid = 3;

    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        let isActive = false;
        let entityType: "rock" | "paper" | "scissors" | null = null;

        switch (zone) {
          case "random":
            // Random dots across the grid
            isActive = Math.random() > 0.5;
            entityType = ["rock", "paper", "scissors"][
              Math.floor(Math.random() * 3)
            ] as "rock" | "paper" | "scissors";
            break;
          case "corners":
            // Show the three corner deployment areas with type separation
            if (x === 0 && y === 0) {
              // Top-left corner - Rocks
              isActive = true;
              entityType = "rock";
            } else if (x === 2 && y === 0) {
              // Top-right corner - Papers
              isActive = true;
              entityType = "paper";
            } else if (x === 1 && y === 2) {
              // Bottom-center - Scissors
              isActive = true;
              entityType = "scissors";
            }
            break;
        }

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`w-3 h-3 rounded border ${
              isActive
                ? entityType === "rock"
                  ? "bg-red-500 border-red-400"
                  : entityType === "paper"
                  ? "bg-blue-500 border-blue-400"
                  : entityType === "scissors"
                  ? "bg-yellow-500 border-yellow-400"
                  : "bg-white border-gray-300"
                : "bg-gray-600 border-gray-500"
            }`}
          />
        );
      }
    }

    return <div className="grid grid-cols-3 gap-1 w-fit mx-auto">{cells}</div>;
  };

  return (
    <motion.div
      className={`entity-composition-panel ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 overflow-y-auto h-full">
        <h3 className="text-xl font-bold mb-4 text-center">Battle Setup</h3>

        {/* Current Entity Counts */}
        <div className="current-counts mb-6 p-3 bg-white/5 border border-white/10 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Current Arena</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <img src={rockImg} className="w-8 h-8 mx-auto mb-1" alt="Rock" />
              <div className="text-sm font-medium text-red-400">
                {currentRocks}
              </div>
              <div className="text-xs text-gray-400">Rocks</div>
            </div>
            <div className="text-center">
              <img
                src={paperImg}
                className="w-8 h-8 mx-auto mb-1"
                alt="Paper"
              />
              <div className="text-sm font-medium text-blue-400">
                {currentPapers}
              </div>
              <div className="text-xs text-gray-400">Papers</div>
            </div>
            <div className="text-center">
              <img
                src={scissorsImg}
                className="w-8 h-8 mx-auto mb-1"
                alt="Scissors"
              />
              <div className="text-sm font-medium text-yellow-400">
                {currentScissors}
              </div>
              <div className="text-xs text-gray-400">Scissors</div>
            </div>
          </div>
        </div>

        {/* Deployment Zone Selection */}
        <div className="deployment-zone mb-4">
          <label className="text-sm font-medium mb-2 block">
            Deployment Pattern
          </label>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className={`p-3 rounded-lg border transition-all ${
                deploymentZone === "random"
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setDeploymentZone("random")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="mb-2">{renderZoneVisualization("random")}</div>
                <div className="text-xs font-medium">Random</div>
                <div className="text-xs text-gray-400">Scattered placement</div>
              </div>
            </motion.button>

            <motion.button
              className={`p-3 rounded-lg border transition-all ${
                deploymentZone === "corners"
                  ? "border-blue-500 bg-blue-900/30"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setDeploymentZone("corners")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="mb-2">{renderZoneVisualization("corners")}</div>
                <div className="text-xs font-medium">Corners</div>
                <div className="text-xs text-gray-400">Three corner areas</div>
              </div>
            </motion.button>
          </div>

          {deploymentZone === "corners" && (
            <div className="mt-2 p-2 bg-blue-900/20 rounded text-xs text-blue-300">
              <div className="font-medium mb-1">Corner Deployment:</div>
              <div className="space-y-1">
                <div>🪨 Rocks: Top-left corner</div>
                <div>📄 Papers: Top-right corner</div>
                <div>✂️ Scissors: Bottom-center area</div>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Each type starts in their designated area for strategic
                positioning.
              </div>
            </div>
          )}
        </div>

        {/* Entity Count Controls */}
        <div className="entity-controls mb-6">
          <h4 className="text-sm font-medium mb-3">Entity Composition</h4>
          <div className="space-y-4">
            {/* Rock Control */}
            <div className="entity-control">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={rockImg} className="w-6 h-6" alt="Rock" />
                  <span className="font-medium text-red-400">Rocks</span>
                </div>
                <span className="text-sm text-gray-400">{rockCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => setRockCount(Math.max(0, rockCount - 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus size={16} />
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rockCount}
                  onChange={(e) => setRockCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => setRockCount(Math.min(50, rockCount + 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>

            {/* Paper Control */}
            <div className="entity-control">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={paperImg} className="w-6 h-6" alt="Paper" />
                  <span className="font-medium text-blue-400">Papers</span>
                </div>
                <span className="text-sm text-gray-400">{paperCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => setPaperCount(Math.max(0, paperCount - 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus size={16} />
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={paperCount}
                  onChange={(e) => setPaperCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => setPaperCount(Math.min(50, paperCount + 1))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>

            {/* Scissors Control */}
            <div className="entity-control">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={scissorsImg} className="w-6 h-6" alt="Scissors" />
                  <span className="font-medium text-yellow-400">Scissors</span>
                </div>
                <span className="text-sm text-gray-400">{scissorsCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() =>
                    setScissorsCount(Math.max(0, scissorsCount - 1))
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minus size={16} />
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={scissorsCount}
                  onChange={(e) => setScissorsCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
                <motion.button
                  className="p-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() =>
                    setScissorsCount(Math.min(50, scissorsCount + 1))
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="preset-controls mb-6">
          <h4 className="text-sm font-medium mb-3">Quick Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className="p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm"
              onClick={() => handlePreset("balanced")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Balanced (15 each)
            </motion.button>
            <motion.button
              className="p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm"
              onClick={() => handlePreset("small")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Small (5 each)
            </motion.button>
            <motion.button
              className="p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm"
              onClick={() => handlePreset("large")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Large (25 each)
            </motion.button>
            <motion.button
              className="p-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-1"
              onClick={() => handlePreset("chaos")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={14} />
              Chaos
            </motion.button>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="deploy-controls">
          <motion.button
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
            onClick={handleSetComposition}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Users size={18} />
            Deploy {rockCount + paperCount + scissorsCount} Entities
          </motion.button>

          <motion.button
            className="w-full mt-2 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2"
            onClick={clearEntities}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw size={16} />
            Clear Arena
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
