import React from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Zap, Clock, TrendingUp, Heart } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface StatsDashboardProps {
  className?: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  className = "",
}) => {
  const { entities, simulationStats, config } = useGameStore();

  const aliveEntities = entities.filter((e) => e.isAlive);

  const stats = {
    total: aliveEntities.length,
    rocks: aliveEntities.filter((e) => e.type === "rock").length,
    papers: aliveEntities.filter((e) => e.type === "paper").length,
    scissors: aliveEntities.filter((e) => e.type === "scissors").length,
    kills: aliveEntities.reduce((sum, e) => sum + e.kills, 0),
    // Life points stats for life points mode
    totalLifePoints:
      config.gameMode === "lifepoints"
        ? aliveEntities.reduce((sum, e) => sum + (e.lifePoints || 0), 0)
        : 0,
    avgLifePoints:
      config.gameMode === "lifepoints" && aliveEntities.length > 0
        ? (
            aliveEntities.reduce((sum, e) => sum + (e.lifePoints || 0), 0) /
            aliveEntities.length
          ).toFixed(1)
        : 0,
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color?: string;
  }> = ({ icon, label, value, color = "white" }) => (
    <motion.div
      className="stat-card"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className={`text-${color}-400 mb-2`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </motion.div>
  );

  // Distribution bar showing relative amounts of each type
  const TypeDistributionBar: React.FC = () => {
    const total = stats.rocks + stats.papers + stats.scissors;
    const rockPercentage = total > 0 ? (stats.rocks / total) * 100 : 0;
    const paperPercentage = total > 0 ? (stats.papers / total) * 100 : 0;
    const scissorsPercentage = total > 0 ? (stats.scissors / total) * 100 : 0;

    return (
      <motion.div
        className="glass-card p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-medium text-red-400">
            Rocks ({stats.rocks})
          </span>
          <span className="font-medium text-blue-400">
            Papers ({stats.papers})
          </span>
          <span className="font-medium text-yellow-400">
            Scissors ({stats.scissors})
          </span>
        </div>

        <div className="type-distribution-bar h-4 bg-black/30 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-red-500"
            style={{ width: `${rockPercentage}%` }}
            initial={{ width: "33%" }}
            animate={{ width: `${rockPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-blue-500"
            style={{ width: `${paperPercentage}%` }}
            initial={{ width: "33%" }}
            animate={{ width: `${paperPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-yellow-500"
            style={{ width: `${scissorsPercentage}%` }}
            initial={{ width: "34%" }}
            animate={{ width: `${scissorsPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="text-xs text-center mt-1 text-gray-300">
          Entity Distribution
        </div>
      </motion.div>
    );
  };

  // For the compact version, just return the type distribution bar
  if (className.includes("inline-mini")) {
    return <TypeDistributionBar />;
  }

  return (
    <motion.div
      className={`space-y-3 ${className}`}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-lg font-bold mb-3 text-center">Simulation Stats</h3>

      {/* Type Distribution */}
      <TypeDistributionBar />

      {/* Entity Type Statistics - Improved spacing */}
      <div className="glass-card p-4">
        <h4 className="font-semibold mb-3 text-center text-sm">Entity Types</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <span>Total:</span>
            <span className="font-bold">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="flex items-center">
              <img src={rockImg} className="w-4 h-4 mr-2" alt="Rock" /> Rocks:
            </span>
            <span className="text-red-400 font-medium">{stats.rocks}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="flex items-center">
              <img src={paperImg} className="w-4 h-4 mr-2" alt="Paper" />{" "}
              Papers:
            </span>
            <span className="text-blue-400 font-medium">{stats.papers}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="flex items-center">
              <img src={scissorsImg} className="w-4 h-4 mr-2" alt="Scissors" />{" "}
              Scissors:
            </span>
            <span className="text-yellow-400 font-medium">
              {stats.scissors}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
            <span>Total Kills:</span>
            <span className="font-bold text-green-400">{stats.kills}</span>
          </div>
        </div>
      </div>

      {/* Overall Stats - Improved grid layout */}
      <div className="grid grid-cols-1 gap-3">
        <div className="glass-card p-3 text-center">
          <Trophy size={18} className="text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold">{stats.entities}</div>
          <div className="text-xs text-gray-400">
            {config.gameMode === "lifepoints"
              ? "Total Entities"
              : "Active Entities"}
          </div>
        </div>
        {config.gameMode === "lifepoints" && (
          <div className="glass-card p-3 text-center">
            <Target size={18} className="text-red-400 mx-auto mb-1" />
            <div className="text-lg font-bold">{stats.kills}</div>
            <div className="text-xs text-gray-400">Total Kills</div>
          </div>
        )}
        <div className="glass-card p-3 text-center">
          <Zap size={18} className="text-yellow-400 mx-auto mb-1" />
          <div className="text-lg font-bold">
            {stats.rocks >= stats.papers && stats.rocks >= stats.scissors
              ? "Rock"
              : stats.papers >= stats.rocks && stats.papers >= stats.scissors
              ? "Paper"
              : "Scissors"}
          </div>
          <div className="text-xs text-gray-400">Dominant Type</div>
        </div>
      </div>

      {/* Life Points Stats - Shown only in life points mode */}
      {config.gameMode === "lifepoints" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatCard
            icon={<Heart size={16} />}
            label="Total Life Points"
            value={stats.totalLifePoints}
            color="text-pink-400"
          />
          <StatCard
            icon={<Target size={16} />}
            label="Avg Life Points"
            value={stats.avgLifePoints}
            color="text-purple-400"
          />
        </div>
      )}
    </motion.div>
  );
};
