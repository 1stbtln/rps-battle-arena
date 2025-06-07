import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Clock } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface KillFeedProps {
  className?: string;
}

export const KillFeed: React.FC<KillFeedProps> = ({ className = "" }) => {
  const { killFeed } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new items are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [killFeed.length]);

  const getEntityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "rock":
        return <img src={rockImg} className="w-4 h-4" alt="Rock" />;
      case "paper":
        return <img src={paperImg} className="w-4 h-4" alt="Paper" />;
      case "scissors":
        return <img src={scissorsImg} className="w-4 h-4" alt="Scissors" />;
      default:
        return <span>❓</span>;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "rock":
        return "text-red-400";
      case "paper":
        return "text-blue-400";
      case "scissors":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <motion.div
      className={`glass-card p-2 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sword size={16} className="text-red-400" />
        <h4 className="font-semibold text-sm">Kill Feed</h4>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <div className="kill-feed-wrapper">
        <div className="kill-feed-container space-y-1 max-h-32" ref={scrollRef}>
          <AnimatePresence initial={false}>
            {killFeed.length === 0 ? (
              <motion.div
                className="text-center text-gray-400 text-xs py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Clock size={12} className="mx-auto mb-1 opacity-50" />
                No kills yet...
              </motion.div>
            ) : (
              killFeed.slice(0, 5).map((kill, index) => (
                <motion.div
                  key={kill.id}
                  className={`kill-feed-item flex items-center bg-black/20 rounded p-1.5 ${
                    index === 0 ? "border-l-2 border-red-500" : ""
                  }`}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginBottom: "0.25rem",
                  }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{
                    duration: 0.2,
                    type: "tween",
                  }}
                >
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <div className="w-4 h-4">
                      {getEntityIcon(kill.killerType)}
                    </div>
                    <span
                      className={`font-semibold text-xs ${getTypeColor(
                        kill.killerType
                      )}`}
                    >
                      {kill.killerType.charAt(0).toUpperCase() +
                        kill.killerType.slice(1)}
                    </span>
                    <span className="text-gray-400 text-xs">→</span>
                    <div className="w-4 h-4">
                      {getEntityIcon(kill.victimType)}
                    </div>
                    <span
                      className={`text-xs ${getTypeColor(kill.victimType)}`}
                    >
                      {kill.victimType.charAt(0).toUpperCase() +
                        kill.victimType.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTimeAgo(kill.timestamp)}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {killFeed.length > 5 && (
        <div className="mt-1 text-xs text-gray-400 text-center">
          +{killFeed.length - 5} more kills
        </div>
      )}
    </motion.div>
  );
};
