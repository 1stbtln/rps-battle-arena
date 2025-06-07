import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Trophy, Users, Flag, BarChart2 } from "lucide-react";
import { useGameStore } from "../store/gameStore";

interface Match {
  id: string;
  date: Date;
  winner: "team1" | "team2" | "draw";
  duration: number; // in seconds
  team1Count: number;
  team2Count: number;
  team1Kills: number;
  team2Kills: number;
}

interface MatchHistoryProps {
  className?: string;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  className = "",
}) => {
  // In a real implementation, this would come from the store or an API
  const [matches] = useState<Match[]>([
    {
      id: "match-1",
      date: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      winner: "team1",
      duration: 45,
      team1Count: 30,
      team2Count: 25,
      team1Kills: 15,
      team2Kills: 10,
    },
    {
      id: "match-2",
      date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      winner: "team2",
      duration: 62,
      team1Count: 20,
      team2Count: 35,
      team1Kills: 8,
      team2Kills: 18,
    },
    {
      id: "match-3",
      date: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      winner: "draw",
      duration: 120,
      team1Count: 40,
      team2Count: 40,
      team1Kills: 22,
      team2Kills: 22,
    },
  ]);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getWinnerText = (winner: "team1" | "team2" | "draw"): string => {
    switch (winner) {
      case "team1":
        return "Team 1 Victory";
      case "team2":
        return "Team 2 Victory";
      case "draw":
        return "Draw";
    }
  };

  const getWinnerColor = (winner: "team1" | "team2" | "draw"): string => {
    switch (winner) {
      case "team1":
        return "text-blue-400";
      case "team2":
        return "text-red-400";
      case "draw":
        return "text-yellow-400";
    }
  };

  return (
    <motion.div
      className={`match-history ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="matches-list mb-4">
        <h4 className="text-sm font-medium mb-2">Recent Matches</h4>
        <div className="overflow-y-auto max-h-28">
          {matches.map((match) => (
            <motion.button
              key={match.id}
              className={`w-full p-2 mb-1 rounded text-left flex items-center justify-between ${
                selectedMatch?.id === match.id
                  ? "bg-white/20 border border-white"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              onClick={() => setSelectedMatch(match)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <Trophy size={16} className={getWinnerColor(match.winner)} />
                <div>
                  <div className="text-sm font-medium">
                    {getWinnerText(match.winner)}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(match.date)}
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium">
                {match.team1Kills} - {match.team2Kills}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedMatch ? (
        <div className="match-details p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm">Match Details</h4>
            <div
              className={`text-sm font-medium ${getWinnerColor(
                selectedMatch.winner
              )}`}
            >
              {getWinnerText(selectedMatch.winner)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="team-alpha">
              <div className="text-xs text-gray-400">Team 1</div>
              <div className="text-lg font-bold text-blue-400">
                {selectedMatch.team1Kills}
              </div>
              <div className="text-xs">kills</div>
            </div>

            <div className="match-duration">
              <div className="text-xs text-gray-400">Duration</div>
              <div className="text-lg font-bold">
                {formatDuration(selectedMatch.duration)}
              </div>
              <div className="text-xs">mm:ss</div>
            </div>

            <div className="team-beta">
              <div className="text-xs text-gray-400">Team 2</div>
              <div className="text-lg font-bold text-red-400">
                {selectedMatch.team2Kills}
              </div>
              <div className="text-xs">kills</div>
            </div>
          </div>

          <div className="team-compositions text-xs space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Users size={12} className="text-blue-400" />
                <span>Team 1: {selectedMatch.team1Count} entities</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={12} className="text-red-400" />
                <span>Team 2: {selectedMatch.team2Count} entities</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          Select a match to view details
        </div>
      )}
    </motion.div>
  );
};
