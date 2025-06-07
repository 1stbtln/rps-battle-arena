import React from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Shield,
  Sword,
  Target,
} from "lucide-react";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";
import { useGameStore } from "../store/gameStore";

interface RulesExplainerProps {
  className?: string;
}

export const RulesExplainer: React.FC<RulesExplainerProps> = ({
  className = "",
}) => {
  const { config } = useGameStore();

  return (
    <motion.div
      className={`rules-explainer overflow-y-auto ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-y-auto h-full px-1">
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Info size={18} className="text-blue-400" />
            RPS Battle Rules
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Welcome to Rock Paper Scissors Battle Arena! Here's how the
            simulation works:
          </p>
        </div>

        <div className="rule-section mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Shield size={16} className="text-yellow-400" />
            Entity Types
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
              <img src={rockImg} className="w-6 h-6" alt="Rock" />
              <div>
                <div className="font-medium">Rock</div>
                <div className="text-xs text-gray-300">
                  Crushes scissors but is covered by paper
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
              <img src={paperImg} className="w-6 h-6" alt="Paper" />
              <div>
                <div className="font-medium">Paper</div>
                <div className="text-xs text-gray-300">
                  Covers rock but is cut by scissors
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
              <img src={scissorsImg} className="w-6 h-6" alt="Scissors" />
              <div>
                <div className="font-medium">Scissors</div>
                <div className="text-xs text-gray-300">
                  Cuts paper but is crushed by rock
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-section mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sword size={16} className="text-red-400" />
            Combat Rules
          </h4>
          <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
            <Target size={16} className="text-blue-400" />
            <div className="text-sm">
              <span className="font-medium">Game Mode:</span>{" "}
              {config.gameMode === "classic" ? "Classic" : "Life Points"}
            </div>
          </div>
          {config.gameMode === "classic" ? (
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Entities move randomly around the arena</li>
              <li>When entities collide, they battle according to RPS rules</li>
              <li>
                <span className="text-red-400 font-medium">Rock</span> defeats{" "}
                <span className="text-yellow-400 font-medium">Scissors</span>
              </li>
              <li>
                <span className="text-blue-400 font-medium">Paper</span> defeats{" "}
                <span className="text-red-400 font-medium">Rock</span>
              </li>
              <li>
                <span className="text-yellow-400 font-medium">Scissors</span>{" "}
                defeats <span className="text-blue-400 font-medium">Paper</span>
              </li>
              <li>Winners convert losers to their type immediately</li>
              <li>Same types (Rock vs Rock) bounce off each other</li>
            </ul>
          ) : (
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Entities start with 1 life point</li>
              <li>
                When an entity wins a battle, it gains 1 life point (up to max
                3)
              </li>
              <li>When an entity loses a battle, it loses 1 life point</li>
              <li>Entities are only converted when they reach 0 life points</li>
              <li>
                Converted entities start with 1 life point as their new type
              </li>
              <li>Life points are shown as hearts above entities</li>
              <li>Same types still bounce off each other</li>
            </ul>
          )}
        </div>

        <div className="rule-section mb-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            Victory Conditions
          </h4>
          <p className="text-sm text-gray-300 mb-2">
            The simulation continues until only one type of entity remains.
          </p>
          <div className="p-2 bg-white/5 rounded-lg">
            <div className="text-sm font-medium mb-1">Entity Balance</div>
            <div className="text-xs text-gray-300">
              The balance between entity types is dynamic and follows the
              rock-paper-scissors rule. Each type has an advantage against one
              type and a disadvantage against another.
            </div>
          </div>
        </div>

        <div className="rule-section">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-400" />
            Tips
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              Balance your team composition based on your opponent's strategy
            </li>
            <li>Too many of one type makes you vulnerable to its counter</li>
            <li>Deploy in waves to adapt to the changing battlefield</li>
            <li>
              Speed and positioning can sometimes overcome type disadvantages
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};
