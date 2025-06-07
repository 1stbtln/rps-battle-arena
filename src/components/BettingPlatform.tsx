import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import {
  DollarSign,
  TrendingUp,
  Trophy,
  Target,
  Coins,
  Zap,
  BarChart2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface BettingPlatformProps {
  className?: string;
}

export const BettingPlatform: React.FC<BettingPlatformProps> = ({
  className = "",
}) => {
  const {
    entities,
    isRunning,
    isPaused,
    bettingStats,
    activeBets,
    placeBet,
    calculateOdds,
  } = useGameStore();

  const [betAmount, setBetAmount] = useState(50);
  const [selectedPrediction, setSelectedPrediction] = useState<
    "rock" | "paper" | "scissors" | null
  >(null);
  const [odds, setOdds] = useState({ rock: 2.0, paper: 2.0, scissors: 2.0 });
  const [showHistory, setShowHistory] = useState(false);
  const [showBettingInfo, setShowBettingInfo] = useState(false);

  // Use the actual bet history from the store
  const betHistory = bettingStats.betHistory || [];

  // Update odds when entities change
  useEffect(() => {
    const newOdds = calculateOdds();
    setOdds(newOdds);
  }, [entities, calculateOdds]);

  const aliveEntities = entities.filter((e) => e.isAlive);
  // Modify this line to allow placing bets even with no entities
  const canBet = !isRunning && activeBets.length === 0;

  const handlePlaceBet = () => {
    // Add check to prevent invalid bets (need entities to start the battle)
    if (!selectedPrediction || !canBet || betAmount > bettingStats.balance)
      return;

    placeBet(betAmount, selectedPrediction, odds[selectedPrediction]);
    setSelectedPrediction(null);
    // Show a quick notification that bet was placed
    setShowBettingInfo(true);
    setTimeout(() => setShowBettingInfo(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEntityIcon = (type: "rock" | "paper" | "scissors") => {
    switch (type) {
      case "rock":
        return <img src={rockImg} className="w-6 h-6" alt="Rock" />;
      case "paper":
        return <img src={paperImg} className="w-6 h-6" alt="Paper" />;
      case "scissors":
        return <img src={scissorsImg} className="w-6 h-6" alt="Scissors" />;
    }
  };

  const getEntityColor = (type: "rock" | "paper" | "scissors") => {
    switch (type) {
      case "rock":
        return "text-red-400 border-red-500/30 bg-red-900/20";
      case "paper":
        return "text-blue-400 border-blue-500/30 bg-blue-900/20";
      case "scissors":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-900/20";
    }
  };

  // Calculate entity distributions for odds calculation display
  const rockCount = aliveEntities.filter((e) => e.type === "rock").length;
  const paperCount = aliveEntities.filter((e) => e.type === "paper").length;
  const scissorsCount = aliveEntities.filter(
    (e) => e.type === "scissors"
  ).length;

  const totalCount = aliveEntities.length;
  const rockPercent =
    totalCount > 0 ? Math.round((rockCount / totalCount) * 100) : 0;
  const paperPercent =
    totalCount > 0 ? Math.round((paperCount / totalCount) * 100) : 0;
  const scissorsPercent =
    totalCount > 0 ? Math.round((scissorsCount / totalCount) * 100) : 0;

  // Add a state to track if user has scrolled to betting section
  const [highlightBettingControls, setHighlightBettingControls] =
    useState(false);

  // Highlight betting controls when component mounts
  useEffect(() => {
    if (!showHistory && !activeBets.length) {
      setHighlightBettingControls(true);
      const timer = setTimeout(() => setHighlightBettingControls(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showHistory, activeBets.length]);

  return (
    <motion.div
      className={`betting-platform ${className} overflow-y-auto`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-green-400" />
          <h3 className="text-base font-semibold">Battle Betting</h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs px-2 py-1 rounded ${
              showHistory ? "bg-white/20" : "bg-white/10"
            }`}
          >
            {showHistory ? "Place Bets" : "History"}
          </button>
        </div>
      </div>

      {/* Notification for bet placement */}
      {showBettingInfo && (
        <motion.div
          className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-green-300">Bet placed successfully!</p>
          <p className="text-xs text-gray-300">
            Start the battle to see results
          </p>
        </motion.div>
      )}

      {!showHistory ? (
        <>
          {/* Betting Stats */}
          <div className="betting-stats mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="stat">
                <div className="text-xs text-gray-400">Balance</div>
                <div className="text-lg font-bold text-green-400">
                  {formatCurrency(bettingStats.balance)}
                </div>
              </div>
              <div className="stat">
                <div className="text-xs text-gray-400">Win Rate</div>
                <div className="text-lg font-bold">
                  {bettingStats.winRate.toFixed(1)}%
                </div>
              </div>
              <div className="stat">
                <div className="text-xs text-gray-400">Total Bets</div>
                <div className="font-medium">{bettingStats.totalBets}</div>
              </div>
              <div className="stat">
                <div className="text-xs text-gray-400">Biggest Win</div>
                <div className="font-medium text-yellow-400">
                  {formatCurrency(bettingStats.biggestWin)}
                </div>
              </div>
            </div>

            {bettingStats.currentStreak > 0 && (
              <div className="streak-indicator mt-2 p-2 rounded bg-white/5 border border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span>Current Streak:</span>
                  <span
                    className={`font-bold ${
                      bettingStats.streakType === "win"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {bettingStats.currentStreak} {bettingStats.streakType}
                    {bettingStats.currentStreak > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Odds Visualization */}
          {!isRunning && (
            <div className="odds-visualization mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <BarChart2 size={14} className="text-blue-400" />
                <span>Current Distribution</span>
              </h4>

              {aliveEntities.length > 0 ? (
                <>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden flex mb-2">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${rockPercent}%` }}
                    ></div>
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${paperPercent}%` }}
                    ></div>
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${scissorsPercent}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    <div>
                      <span className="text-red-400">{rockPercent}%</span> Rocks
                    </div>
                    <div>
                      <span className="text-blue-400">{paperPercent}%</span>{" "}
                      Papers
                    </div>
                    <div>
                      <span className="text-yellow-400">
                        {scissorsPercent}%
                      </span>{" "}
                      Scissors
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-sm text-gray-400 py-2">
                  No entities yet. Add some to see distribution.
                </div>
              )}
            </div>
          )}

          {/* Active Bet Display */}
          {activeBets.length > 0 && (
            <div className="active-bet mb-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-yellow-400" />
                  <span className="text-sm font-medium">Active Bet</span>
                </div>
                {isRunning && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full animate-pulse">
                    Live
                  </span>
                )}
              </div>

              {activeBets.map((bet) => (
                <div key={bet.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEntityIcon(bet.prediction)}
                    <span className="capitalize">{bet.prediction}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(bet.amount)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {bet.odds.toFixed(2)}x odds
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span>Potential payout:</span>
                  <span className="font-medium text-green-400">
                    {activeBets.length > 0 &&
                      formatCurrency(activeBets[0].amount * activeBets[0].odds)}
                  </span>
                </div>
                {isRunning && (
                  <div className="text-center text-xs mt-2 text-gray-400">
                    Battle in progress... Good luck!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Betting Interface - Modified to always show when not in battle */}
          {canBet ? (
            <motion.div
              className={`betting-interface ${
                highlightBettingControls
                  ? "ring-2 ring-green-400 ring-offset-1 ring-offset-black"
                  : ""
              }`}
              animate={
                highlightBettingControls
                  ? {
                      boxShadow: [
                        "0 0 0 rgba(74, 222, 128, 0)",
                        "0 0 20px rgba(74, 222, 128, 0.5)",
                        "0 0 0 rgba(74, 222, 128, 0)",
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: highlightBettingControls ? 1 : 0,
              }}
            >
              {/* Betting Title - New section to make betting more prominent */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-green-400">
                  Place Your Bet
                </h3>
                <p className="text-sm text-gray-400">
                  {aliveEntities.length > 0
                    ? "Predict which entity will dominate the arena"
                    : "Add entities and predict the winner"}
                </p>
              </div>

              {/* Bet Amount */}
              <div className="bet-amount mb-3">
                <label className="text-sm font-medium mb-2 block">
                  Bet Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) =>
                      setBetAmount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    max={bettingStats.balance}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
                  />
                  <button
                    onClick={() =>
                      setBetAmount(Math.floor(bettingStats.balance / 4))
                    }
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs"
                  >
                    25%
                  </button>
                  <button
                    onClick={() =>
                      setBetAmount(Math.floor(bettingStats.balance / 2))
                    }
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-xs"
                  >
                    50%
                  </button>
                </div>
              </div>

              {/* Prediction Options */}
              <div className="predictions mb-4">
                <label className="text-sm font-medium mb-2 block">
                  Predict Winner
                </label>
                <div className="space-y-2">
                  {(["rock", "paper", "scissors"] as const).map((type) => {
                    const entityCount = aliveEntities.filter(
                      (e) => e.type === type
                    ).length;
                    const percentage =
                      aliveEntities.length > 0
                        ? (entityCount / aliveEntities.length) * 100
                        : 0;

                    return (
                      <motion.button
                        key={type}
                        className={`w-full p-3 rounded-lg border transition-all ${
                          selectedPrediction === type
                            ? `border-white ${getEntityColor(type)}`
                            : "border-white/20 bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => setSelectedPrediction(type)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getEntityIcon(type)}
                            <div className="text-left">
                              <div className="font-medium capitalize">
                                {type}
                              </div>
                              <div className="text-xs text-gray-400">
                                {entityCount} entities ({percentage.toFixed(1)}
                                %)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">
                              {odds[type].toFixed(2)}x
                            </div>
                            <div className="text-xs text-gray-400">
                              Win: {formatCurrency(betAmount * odds[type])}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Modified Place Bet Button with appropriate messaging */}
              <motion.button
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  selectedPrediction &&
                  betAmount <= bettingStats.balance &&
                  aliveEntities.length > 0
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
                onClick={handlePlaceBet}
                disabled={
                  !selectedPrediction ||
                  betAmount > bettingStats.balance ||
                  aliveEntities.length === 0
                }
                whileHover={
                  selectedPrediction &&
                  betAmount <= bettingStats.balance &&
                  aliveEntities.length > 0
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  selectedPrediction &&
                  betAmount <= bettingStats.balance &&
                  aliveEntities.length > 0
                    ? { scale: 0.98 }
                    : {}
                }
              >
                {!selectedPrediction ? (
                  "Select a prediction"
                ) : aliveEntities.length === 0 ? (
                  "Add entities to battle first"
                ) : (
                  <>
                    Place Bet - {formatCurrency(betAmount)} on{" "}
                    {selectedPrediction}
                    <div className="text-xs mt-1">
                      Potential win:{" "}
                      {formatCurrency(betAmount * odds[selectedPrediction])}
                    </div>
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <div className="betting-disabled p-4 text-center text-gray-400 bg-white/5 rounded-lg border border-white/10">
              {isRunning ? (
                <>
                  <Zap size={24} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Battle in progress</div>
                  <div className="text-xs">
                    Wait for results to place new bets
                  </div>
                </>
              ) : aliveEntities.length === 0 ? (
                <>
                  <Trophy size={24} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Add entities to start betting</div>
                  <div className="text-xs mt-2">
                    Go to the Arena tab and add rock, paper, or scissors
                    entities
                  </div>
                </>
              ) : activeBets.length > 0 ? (
                <>
                  <Target size={24} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">You have an active bet</div>
                  <div className="text-xs">Wait for battle results</div>
                </>
              ) : (
                <>
                  <Coins size={24} className="mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Ready to bet</div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Betting History View */}
          <div className="betting-history">
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar size={14} className="text-blue-400" />
                Recent Bets
              </h4>

              {betHistory.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {betHistory.map((bet) => (
                    <div
                      key={bet.id}
                      className="flex items-center justify-between p-2 border border-white/10 bg-white/5 rounded"
                    >
                      <div className="flex items-center gap-2">
                        {getEntityIcon(bet.prediction)}
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {bet.prediction}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimestamp(bet.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-medium ${
                            bet.status === "won"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {bet.status === "won"
                            ? `+${formatCurrency(bet.payout || 0)}`
                            : `-${formatCurrency(bet.amount)}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bet: {formatCurrency(bet.amount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No betting history yet
                </div>
              )}
            </div>

            {/* Betting Performance Stats */}
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
                <TrendingUp size={14} className="text-blue-400" />
                <span>Betting Performance</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-xs text-gray-400">Total Won</div>
                  <div className="text-lg font-medium text-green-400">
                    {formatCurrency(bettingStats.totalWon)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Total Lost</div>
                  <div className="text-lg font-medium text-red-400">
                    {formatCurrency(bettingStats.totalLost)}
                  </div>
                </div>
              </div>

              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${bettingStats.winRate}%` }}
                ></div>
              </div>

              <div className="text-xs text-center text-gray-400">
                {bettingStats.winRate.toFixed(1)}% win rate
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick Stats */}
      <div className="quick-stats mt-4 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Recent Performance:</span>
          <span>
            W: {bettingStats.totalWon.toFixed(0)} | L:{" "}
            {bettingStats.totalLost.toFixed(0)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
