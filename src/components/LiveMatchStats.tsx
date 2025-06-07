import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import {
  Activity,
  Clock,
  Award,
  TrendingUp,
  Zap,
  Users,
  BarChart2,
  Target,
} from "lucide-react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface LiveMatchStatsProps {
  className?: string;
}

export const LiveMatchStats: React.FC<LiveMatchStatsProps> = ({
  className = "",
}) => {
  const {
    entities,
    isRunning,
    isPaused,
    killFeed,
    bettingStats,
    activeBets,
    calculateOdds,
    calculateWinChances,
    config,
  } = useGameStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track match start time for timer
  useEffect(() => {
    if (isRunning && !isPaused) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      intervalRef.current = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000)
        );
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused]);

  // Reset timer when match is not running
  useEffect(() => {
    if (!isRunning) {
      startTimeRef.current = null;
      setElapsedTime(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isRunning]);

  const aliveEntities = entities.filter((e) => e.isAlive);

  // Calculate entity type statistics
  const rockCount = aliveEntities.filter((e) => e.type === "rock").length;
  const paperCount = aliveEntities.filter((e) => e.type === "paper").length;
  const scissorsCount = aliveEntities.filter(
    (e) => e.type === "scissors"
  ).length;

  // Get current odds for display
  const currentOdds = calculateOdds();

  // Calculate momentum (change in entity counts over time)
  const [previousCounts, setPreviousCounts] = useState({
    rock: 0,
    paper: 0,
    scissors: 0,
  });
  const [momentum, setMomentum] = useState({ rock: 0, paper: 0, scissors: 0 });

  useEffect(() => {
    const currentCounts = {
      rock: rockCount,
      paper: paperCount,
      scissors: scissorsCount,
    };

    setMomentum({
      rock: currentCounts.rock - previousCounts.rock,
      paper: currentCounts.paper - previousCounts.paper,
      scissors: currentCounts.scissors - previousCounts.scissors,
    });

    setPreviousCounts(currentCounts);
  }, [rockCount, paperCount, scissorsCount]);

  // Calculate total kills by type (only for life points mode)
  const rockKills =
    config.gameMode === "lifepoints"
      ? entities
          .filter((e) => e.type === "rock")
          .reduce((sum, e) => sum + e.kills, 0)
      : 0;
  const paperKills =
    config.gameMode === "lifepoints"
      ? entities
          .filter((e) => e.type === "paper")
          .reduce((sum, e) => sum + e.kills, 0)
      : 0;
  const scissorsKills =
    config.gameMode === "lifepoints"
      ? entities
          .filter((e) => e.type === "scissors")
          .reduce((sum, e) => sum + e.kills, 0)
      : 0;

  // Calculate kill efficiency by type
  const rockKillEfficiency =
    entities.filter((e) => e.type === "rock").length > 0
      ? rockKills / entities.filter((e) => e.type === "rock").length
      : 0;
  const paperKillEfficiency =
    entities.filter((e) => e.type === "paper").length > 0
      ? paperKills / entities.filter((e) => e.type === "paper").length
      : 0;
  const scissorsKillEfficiency =
    entities.filter((e) => e.type === "scissors").length > 0
      ? scissorsKills / entities.filter((e) => e.type === "scissors").length
      : 0;

  // Calculate change rates (kills per second)
  const recentTimeframe = 10; // last 10 seconds
  const recentKills = killFeed.filter(
    (k) => Date.now() - k.timestamp < recentTimeframe * 1000
  );
  const killRate =
    recentKills.length / Math.max(1, Math.min(recentTimeframe, elapsedTime));

  // Find who's dominating
  const rockPercentage =
    aliveEntities.length > 0 ? (rockCount / aliveEntities.length) * 100 : 0;
  const paperPercentage =
    aliveEntities.length > 0 ? (paperCount / aliveEntities.length) * 100 : 0;
  const scissorsPercentage =
    aliveEntities.length > 0 ? (scissorsCount / aliveEntities.length) * 100 : 0;

  const dominantType =
    rockPercentage >= paperPercentage && rockPercentage >= scissorsPercentage
      ? "rock"
      : paperPercentage >= rockPercentage &&
        paperPercentage >= scissorsPercentage
      ? "paper"
      : "scissors";

  // Find entity with most kills
  const mvp = [...entities].sort((a, b) => b.kills - a.kills)[0];

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get win chances
  const winChances = calculateWinChances();

  return (
    <motion.div
      className={`live-match-stats ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity
            size={20}
            className={isPaused ? "text-yellow-400" : "text-green-400"}
          />
          Live Match Stats
        </h3>
        <div className="flex items-center gap-2 text-lg font-mono">
          <Clock size={16} className="text-blue-400" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Entity Distribution Panel */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="entity-stat p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <img src={rockImg} className="w-5 h-5" alt="Rock" />
              <span className="text-sm font-medium">Rocks</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-red-400">
                {rockCount}
              </span>
              {momentum.rock !== 0 && (
                <div
                  className={`text-xs ${
                    momentum.rock > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {momentum.rock > 0 ? "+" : ""}
                  {momentum.rock}
                </div>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: "0%" }}
              animate={{ width: `${rockPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            {config.gameMode === "lifepoints" && (
              <>
                <span>Kills: {rockKills}</span>
                <span>Odds: {currentOdds.rock.toFixed(1)}x</span>
              </>
            )}
            {config.gameMode === "classic" && (
              <span>Odds: {currentOdds.rock.toFixed(1)}x</span>
            )}
          </div>
        </div>

        <div className="entity-stat p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <img src={paperImg} className="w-5 h-5" alt="Paper" />
              <span className="text-sm font-medium">Papers</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-400">
                {paperCount}
              </span>
              {momentum.paper !== 0 && (
                <div
                  className={`text-xs ${
                    momentum.paper > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {momentum.paper > 0 ? "+" : ""}
                  {momentum.paper}
                </div>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${paperPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            {config.gameMode === "lifepoints" && (
              <>
                <span>Kills: {paperKills}</span>
                <span>Odds: {currentOdds.paper.toFixed(1)}x</span>
              </>
            )}
            {config.gameMode === "classic" && (
              <span>Odds: {currentOdds.paper.toFixed(1)}x</span>
            )}
          </div>
        </div>

        <div className="entity-stat p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <img src={scissorsImg} className="w-5 h-5" alt="Scissors" />
              <span className="text-sm font-medium">Scissors</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-yellow-400">
                {scissorsCount}
              </span>
              {momentum.scissors !== 0 && (
                <div
                  className={`text-xs ${
                    momentum.scissors > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {momentum.scissors > 0 ? "+" : ""}
                  {momentum.scissors}
                </div>
              )}
            </div>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500"
              initial={{ width: "0%" }}
              animate={{ width: `${scissorsPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            {config.gameMode === "lifepoints" && (
              <>
                <span>Kills: {scissorsKills}</span>
                <span>Odds: {currentOdds.scissors.toFixed(1)}x</span>
              </>
            )}
            {config.gameMode === "classic" && (
              <span>Odds: {currentOdds.scissors.toFixed(1)}x</span>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Statistics - only show kill-related stats for life points mode */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="match-stat p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users size={14} className="text-blue-400" />
              <span className="text-sm">Alive</span>
            </div>
            <span className="text-lg font-bold">{aliveEntities.length}</span>
          </div>
        </div>

        {config.gameMode === "lifepoints" && (
          <div className="match-stat p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Target size={14} className="text-red-400" />
                <span className="text-sm">Kill Rate</span>
              </div>
              <span className="text-lg font-bold">{killRate.toFixed(1)}/s</span>
            </div>
          </div>
        )}

        {config.gameMode === "classic" && (
          <div className="match-stat p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <BarChart2 size={14} className="text-green-400" />
                <span className="text-sm">Conversion Rate</span>
              </div>
              <span className="text-lg font-bold">{killRate.toFixed(1)}/s</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Win Chances */}
      <div className="win-chances p-3 bg-white/5 rounded-lg border border-white/10 mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
          <Award size={14} className="text-yellow-400" />
          Live Win Chances
        </h4>

        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Rock win chance */}
          <div className="win-chance">
            <div className="relative mb-1">
              <img src={rockImg} className="w-6 h-6 mx-auto" alt="Rock" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                {winChances.rock < winChances.paper &&
                winChances.rock < winChances.scissors
                  ? "3"
                  : winChances.rock < winChances.paper ||
                    winChances.rock < winChances.scissors
                  ? "2"
                  : "1"}
              </div>
            </div>
            <div className="text-sm font-semibold text-red-400">
              {winChances.rock.toFixed(1)}%
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: "0%" }}
                animate={{ width: `${winChances.rock}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Paper win chance */}
          <div className="win-chance">
            <div className="relative mb-1">
              <img src={paperImg} className="w-6 h-6 mx-auto" alt="Paper" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                {winChances.paper < winChances.rock &&
                winChances.paper < winChances.scissors
                  ? "3"
                  : winChances.paper < winChances.rock ||
                    winChances.paper < winChances.scissors
                  ? "2"
                  : "1"}
              </div>
            </div>
            <div className="text-sm font-semibold text-blue-400">
              {winChances.paper.toFixed(1)}%
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: `${winChances.paper}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Scissors win chance */}
          <div className="win-chance">
            <div className="relative mb-1">
              <img
                src={scissorsImg}
                className="w-6 h-6 mx-auto"
                alt="Scissors"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center">
                {winChances.scissors < winChances.rock &&
                winChances.scissors < winChances.paper
                  ? "3"
                  : winChances.scissors < winChances.rock ||
                    winChances.scissors < winChances.paper
                  ? "2"
                  : "1"}
              </div>
            </div>
            <div className="text-sm font-semibold text-yellow-400">
              {winChances.scissors.toFixed(1)}%
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-yellow-500"
                initial={{ width: "0%" }}
                animate={{ width: `${winChances.scissors}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        <div className="prediction text-xs text-center mt-3 text-gray-300">
          {winChances.rock > winChances.paper &&
            winChances.rock > winChances.scissors &&
            "Rocks have the advantage! They're crushing the competition."}
          {winChances.paper > winChances.rock &&
            winChances.paper > winChances.scissors &&
            "Papers are in the lead! They're covering the competition."}
          {winChances.scissors > winChances.rock &&
            winChances.scissors > winChances.paper &&
            "Scissors are dominating! They're cutting through the competition."}
          {winChances.rock === winChances.paper &&
            winChances.rock > winChances.scissors &&
            "Rocks and Papers are tied for the lead!"}
          {winChances.rock === winChances.scissors &&
            winChances.rock > winChances.paper &&
            "Rocks and Scissors are tied for the lead!"}
          {winChances.paper === winChances.scissors &&
            winChances.paper > winChances.rock &&
            "Papers and Scissors are tied for the lead!"}
          {winChances.rock === winChances.paper &&
            winChances.rock === winChances.scissors &&
            "It's a perfect three-way tie! Anyone could win!"}
        </div>
      </div>

      {/* Match Progress & Recent Activity */}
      <div className="grid grid-cols-1 gap-3">
        <div className="battle-prediction p-3 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <TrendingUp size={14} className="text-blue-400" />
            Match Analysis
          </h4>

          <div className="text-xs text-gray-300 mb-2">
            {dominantType === "rock" &&
              "Rocks are dominating! Papers need to step up their game."}
            {dominantType === "paper" &&
              "Papers are taking over! Scissors need to make their move."}
            {dominantType === "scissors" &&
              "Scissors are cutting through! Rocks need to crush the competition."}
          </div>

          {/* Rock-Paper-Scissors Balance Indicator */}
          <div className="balance-indicator h-2 bg-white/10 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full bg-red-500"
              animate={{ width: `${rockPercentage}%` }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="h-full bg-blue-500"
              animate={{ width: `${paperPercentage}%` }}
              transition={{ duration: 1 }}
            />
            <motion.div
              className="h-full bg-yellow-500"
              animate={{ width: `${scissorsPercentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          {/* Recent kill feed summary */}
          <div className="recent-kills mt-3">
            <div className="text-xs font-medium mb-1">Recent Activity:</div>
            {recentKills.length > 0 ? (
              <div className="text-xs text-gray-400">
                {recentKills.length} kills in the last{" "}
                {Math.min(recentTimeframe, elapsedTime)} seconds
              </div>
            ) : (
              <div className="text-xs text-gray-400">No recent kills</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
