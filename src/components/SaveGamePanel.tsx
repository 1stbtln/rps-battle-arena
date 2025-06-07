import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Download, Upload, Trash2, X } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { persistenceService } from "../services/persistenceService";
import type { SavedGameState } from "../services/persistenceService";

interface SaveGamePanelProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SaveGamePanel: React.FC<SaveGamePanelProps> = ({
  className = "",
  isOpen,
  onClose,
}) => {
  const gameStore = useGameStore();
  const [savedGames, setSavedGames] = useState<SavedGameState[]>([]);
  const [gameName, setGameName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load saved games on mount
  useEffect(() => {
    if (isOpen) {
      loadSavedGames();
    }
  }, [isOpen]);

  const loadSavedGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const games = await persistenceService.getAllSavedGames();
      setSavedGames(
        games.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      setError("Failed to load saved games");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGame = async () => {
    if (!gameName.trim()) {
      setError("Please enter a name for your saved game");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current state from store
      const currentState = {
        entities: gameStore.entities,
        isRunning: gameStore.isRunning,
        isPaused: gameStore.isPaused,
        speed: gameStore.speed,
        killFeed: gameStore.killFeed,
        battleStats: gameStore.battleStats,
        winProbability: gameStore.winProbability,
      };

      // Save game
      await persistenceService.saveGame(gameName, currentState);

      // Refresh saved games list
      await loadSavedGames();

      // Clear form and show success message
      setGameName("");
      setSuccessMessage("Game saved successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Failed to save game");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadGame = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load game
      const savedGame = await persistenceService.loadGame(id);

      // Stop current battle if running
      if (gameStore.isRunning) {
        gameStore.stopBattle();
      }

      // Clear entities and kill feed
      gameStore.clearEntities();
      gameStore.clearKillFeed();

      // Apply saved state
      const state = savedGame.battleState;

      // Add entities
      state.entities.forEach((entity) => {
        gameStore.updateEntity(entity.id, entity);
      });

      // Add kill feed items
      state.killFeed.forEach((item) => {
        gameStore.addKillFeedItem({
          killerType: item.killerType,
          victimType: item.victimType,
          killerId: item.killerId,
          victimId: item.victimId,
          // Removed team properties
        });
      });

      // Show success message
      setSuccessMessage(`Game "${savedGame.name}" loaded successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError("Failed to load game");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Delete game
      await persistenceService.deleteSavedGame(id);

      // Refresh saved games list
      await loadSavedGames();

      // Show success message
      setSuccessMessage("Game deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Failed to delete game");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className={`save-game-panel fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 border border-white/20 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Save size={18} className="text-blue-400" />
            Save & Load Games
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {error && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-300 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-950/50 border border-green-500/50 text-green-300 p-3 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              Save Current Game
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Game name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="flex-grow bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleSaveGame}
                disabled={isLoading || !gameName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Saved Games
          </h3>
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">Loading...</div>
          ) : savedGames.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No saved games found
            </div>
          ) : (
            <div className="space-y-2">
              {savedGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-black/30 border border-white/10 rounded p-3 flex justify-between"
                >
                  <div>
                    <div className="font-medium">{game.name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(game.date).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleLoadGame(game.id)}
                      className="p-2 hover:bg-white/10 rounded transition-colors text-blue-400"
                      title="Load Game"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 hover:bg-white/10 rounded transition-colors text-red-400"
                      title="Delete Game"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
