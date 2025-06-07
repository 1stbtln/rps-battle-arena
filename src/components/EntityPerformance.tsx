import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { Trophy, BarChart2, Target, Clock, Medal } from "lucide-react";

interface EntityPerformanceProps {
  className?: string;
}

interface EntityStat {
  id: string;
  type: string;
  kills: number;
  lifespan: number; // in milliseconds
  isAlive: boolean;
}

export const EntityPerformance: React.FC<EntityPerformanceProps> = ({
  className = "",
}) => {
  const { entities, killFeed } = useGameStore();
  const [entityStats, setEntityStats] = useState<EntityStat[]>([]);
  const [sortBy, setSortBy] = useState<"kills" | "lifespan">("kills");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"all" | "rock" | "paper" | "scissors">(
    "all"
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Update entity stats
  useEffect(() => {
    // Create stats for all entities
    const stats: EntityStat[] = entities.map((entity) => ({
      id: entity.id,
      type: entity.type,
      kills: entity.kills,
      lifespan: entity.isAlive ? Date.now() - startTimeRef.current : 0,
      isAlive: entity.isAlive,
    }));

    // Add lifespan for dead entities from kill feed
    killFeed.forEach((kill) => {
      const victimStat = stats.find((stat) => stat.id === kill.victimId);
      if (victimStat && !victimStat.isAlive && victimStat.lifespan === 0) {
        victimStat.lifespan = kill.timestamp - startTimeRef.current;
      }
    });

    setEntityStats(stats);
  }, [entities, killFeed]);

  // Draw performance chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filtered and sorted stats
    const filteredStats = entityStats.filter((stat) => {
      switch (filter) {
        case "rock":
          return stat.type === "rock";
        case "paper":
          return stat.type === "paper";
        case "scissors":
          return stat.type === "scissors";
        default:
          return true;
      }
    });

    const sortedStats = [...filteredStats].sort((a, b) => {
      const factor = sortOrder === "asc" ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * factor;
    });

    // Configuration
    const barHeight = 15;
    const barGap = 5;
    const padding = { top: 10, right: 10, bottom: 10, left: 100 };

    // Determine chart width and maximum value
    const chartWidth = canvas.width - padding.left - padding.right;
    const maxValue = Math.max(
      ...sortedStats.map((stat) => stat[sortBy]),
      1 // Ensure we don't divide by zero
    );

    // Draw bars
    sortedStats.slice(0, 8).forEach((stat, index) => {
      const y = padding.top + index * (barHeight + barGap);
      const barWidth = (stat[sortBy] / maxValue) * chartWidth;

      // Team and type colors
      let barColor = stat.type === "rock" ? "#ef4444" : "#3b82f6";
      if (stat.type === "paper") {
        barColor = "#2563eb";
      } else if (stat.type === "scissors") {
        barColor = "#eab308";
      }

      // Draw label
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        ` ${stat.type.charAt(0).toUpperCase()}${stat.type.slice(1, 3)}`,
        padding.left - 5,
        y + barHeight / 2
      );

      // Draw bar
      ctx.fillStyle = barColor;
      ctx.fillRect(padding.left, y, barWidth, barHeight);

      // Draw value
      ctx.fillStyle = "#f1f5f9";
      ctx.textAlign = "left";
      ctx.fillText(
        sortBy === "kills"
          ? stat.kills.toString()
          : `${Math.round(stat.lifespan / 1000)}s`,
        padding.left + barWidth + 5,
        y + barHeight / 2
      );

      // Show if entity is dead
      if (!stat.isAlive) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.textAlign = "right";
        ctx.fillText("☠️", padding.left - 25, y + barHeight / 2);
      }
    });

    // Draw title
    ctx.fillStyle = "#f1f5f9";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      sortBy === "kills" ? "Kills Leaderboard" : "Survival Time",
      canvas.width / 2,
      canvas.height - 5
    );
  }, [entityStats, sortBy, sortOrder, filter]);

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "rock":
        return "text-red-500";
      case "paper":
        return "text-blue-500";
      case "scissors":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Calculate average lifespan
  const calculateAverageLifespan = () => {
    if (entityStats.length === 0) return 0;

    const totalLifespan = entityStats.reduce(
      (sum, stat) => sum + stat.lifespan,
      0
    );
    return Math.round(totalLifespan / entityStats.length / 1000);
  };

  // Get the entity with most kills
  const getTopKiller = () => {
    if (entityStats.length === 0) return null;

    return [...entityStats].sort((a, b) => b.kills - a.kills)[0];
  };

  // Get the entity with longest lifespan
  const getSurvivor = () => {
    if (entityStats.length === 0) return null;

    return [...entityStats].sort((a, b) => b.lifespan - a.lifespan)[0];
  };

  const topKiller = getTopKiller();
  const topSurvivor = getSurvivor();

  return (
    <motion.div
      className={`entity-performance ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold flex items-center gap-1">
          <Trophy size={16} className="text-yellow-400" />
          Entity Performance
        </h3>
        <div className="controls flex gap-1">
          <select
            className="text-xs bg-white/10 border border-white/20 rounded px-1 py-0.5"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="rock">Rocks</option>
            <option value="paper">Papers</option>
            <option value="scissors">Scissors</option>
          </select>
          <select
            className="text-xs bg-white/10 border border-white/20 rounded px-1 py-0.5"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "kills" | "lifespan")}
          >
            <option value="kills">Kills</option>
            <option value="lifespan">Survival</option>
          </select>
        </div>
      </div>

      {/* Top stats */}
      <div className="top-stats grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-white/5 border border-white/10 rounded">
          <div className="text-xs text-yellow-400 flex items-center gap-1 mb-1">
            <Medal size={12} />
            <span>Top Killer</span>
          </div>
          {topKiller ? (
            <div className="flex items-center gap-2">
              <div className={`text-lg ${getTypeColor(topKiller.type)}`}>
                {topKiller.type === "rock" && "🪨"}
                {topKiller.type === "paper" && "📄"}
                {topKiller.type === "scissors" && "✂️"}
              </div>
              <div>
                <div className="text-sm font-medium capitalize">
                  {topKiller.type}
                </div>
                <div className="text-xs text-gray-400">
                  {topKiller.kills} kills
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No data</div>
          )}
        </div>

        <div className="p-2 bg-white/5 border border-white/10 rounded">
          <div className="text-xs text-blue-400 flex items-center gap-1 mb-1">
            <Clock size={12} />
            <span>Longest Survivor</span>
          </div>
          {topSurvivor ? (
            <div className="flex items-center gap-2">
              <div className={`text-lg ${getTypeColor(topSurvivor.type)}`}>
                {topSurvivor.type === "rock" && "🪨"}
                {topSurvivor.type === "paper" && "📄"}
                {topSurvivor.type === "scissors" && "✂️"}
              </div>
              <div>
                <div className="text-sm font-medium capitalize">
                  {topSurvivor.type}
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(topSurvivor.lifespan / 1000)}s survival
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Performance chart */}
      <div className="performance-chart border border-white/10 rounded bg-black/20 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={280}
          height={180}
          className="w-full h-auto"
        />
      </div>

      {/* Overall stats */}
      <div className="mt-2 text-xs text-gray-400 flex justify-between">
        <div>Total Entities: {entityStats.length}</div>
        <div>Avg. Survival: {calculateAverageLifespan()}s</div>
      </div>
    </motion.div>
  );
};
