import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { ShieldIcon, Zap, Heart, Flame, Target, Award } from "lucide-react";
import type { Entity } from "../types/game";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";

interface EntityDetailViewProps {
  className?: string;
}

export const EntityDetailView: React.FC<EntityDetailViewProps> = ({
  className = "",
}) => {
  const { entities, config } = useGameStore();
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [sortBy, setSortBy] = useState<"kills" | "health">("kills");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"all" | "rock" | "paper" | "scissors">(
    "all"
  );

  // Select highest kill entity by default
  useEffect(() => {
    if (entities.length > 0 && !selectedEntity) {
      const sortedEntities = [...entities]
        .filter((e) => e.isAlive)
        .sort((a, b) => b.kills - a.kills);

      if (sortedEntities.length > 0) {
        setSelectedEntity(sortedEntities[0]);
      }
    }
  }, [entities, selectedEntity]);

  // If selected entity is killed, select a new one
  useEffect(() => {
    if (selectedEntity && !selectedEntity.isAlive) {
      const alive = entities.filter((e) => e.isAlive);
      if (alive.length > 0) {
        setSelectedEntity(alive[0]);
      } else {
        setSelectedEntity(null);
      }
    }
  }, [entities, selectedEntity]);

  // Update filtering to remove team options
  const getFilteredEntities = () => {
    return entities
      .filter((entity) => {
        if (!entity.isAlive) return false;

        switch (filter) {
          case "rock":
            return entity.type === "rock";
          case "paper":
            return entity.type === "paper";
          case "scissors":
            return entity.type === "scissors";
          case "all":
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const factor = sortOrder === "asc" ? 1 : -1;

        if (sortBy === "kills") {
          return (a.kills - b.kills) * factor;
        } else {
          return (a.health - b.health) * factor;
        }
      });
  };

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case "rock":
        return <img src={rockImg} className="w-6 h-6" alt="Rock" />;
      case "paper":
        return <img src={paperImg} className="w-6 h-6" alt="Paper" />;
      case "scissors":
        return <img src={scissorsImg} className="w-6 h-6" alt="Scissors" />;
      default:
        return <span>❓</span>;
    }
  };

  const getEntityColor = (entity: Entity) => {
    return entity.color;
  };

  const handleEntitySelect = (entity: Entity) => {
    setSelectedEntity(entity);
  };

  const filteredEntities = getFilteredEntities();

  return (
    <motion.div
      className={`entity-detail-view ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="filters mb-3 flex flex-wrap gap-2">
        <select
          className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All Entities</option>
          <option value="rock">Rocks</option>
          <option value="paper">Papers</option>
          <option value="scissors">Scissors</option>
        </select>

        <select
          className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split("-");
            setSortBy(newSortBy as "kills" | "health");
            setSortOrder(newSortOrder as "asc" | "desc");
          }}
        >
          <option value="kills-desc">Most Kills</option>
          <option value="kills-asc">Least Kills</option>
          <option value="health-desc">Highest Health</option>
          <option value="health-asc">Lowest Health</option>
        </select>
      </div>

      <div className="entity-list mb-4 h-24 overflow-y-auto p-1">
        {filteredEntities.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {filteredEntities.slice(0, 9).map((entity) => (
              <motion.button
                key={entity.id}
                className={`p-2 text-center border rounded ${
                  selectedEntity?.id === entity.id
                    ? "border-white bg-white/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
                onClick={() => handleEntitySelect(entity)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="text-lg"
                  style={{ color: getEntityColor(entity) }}
                >
                  {getEntityTypeIcon(entity.type)}
                </div>
                <div className="text-xs mt-1">
                  <span className="font-semibold">{entity.kills}</span> kills
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            No entities to display
          </div>
        )}
      </div>

      {selectedEntity ? (
        <div className="selected-entity-details p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="entity-icon text-3xl"
              style={{ color: getEntityColor(selectedEntity) }}
            >
              {getEntityTypeIcon(selectedEntity.type)}
            </div>
            <div>
              <h4 className="font-semibold capitalize">
                {selectedEntity.type}
              </h4>
              <div className="text-xs text-gray-400">
                ID: {selectedEntity.id.substring(selectedEntity.id.length - 6)}
              </div>
            </div>
          </div>

          <div className="stats grid grid-cols-2 gap-2 text-sm">
            <div className="stat flex items-center gap-1">
              <Heart size={14} className="text-red-400" />
              <span>
                Health: {Math.round(selectedEntity.health)}/
                {selectedEntity.maxHealth}
              </span>
            </div>
            <div className="stat flex items-center gap-1">
              <Flame size={14} className="text-orange-400" />
              <span>Kills: {selectedEntity.kills}</span>
            </div>
            {config.gameMode === "lifepoints" &&
              selectedEntity.lifePoints !== undefined && (
                <div className="stat flex items-center gap-1">
                  <Award size={14} className="text-pink-400" />
                  <span>
                    Lives: {selectedEntity.lifePoints}/
                    {selectedEntity.maxLifePoints || 3}
                  </span>
                </div>
              )}
            <div className="stat flex items-center gap-1">
              <Zap size={14} className="text-yellow-400" />
              <span>Speed: {selectedEntity.speed.toFixed(1)}</span>
            </div>
            <div className="stat flex items-center gap-1">
              <ShieldIcon size={14} className="text-blue-400" />
              <span>Size: {selectedEntity.size}</span>
            </div>
          </div>

          <div className="health-bar mt-3 bg-white/10 h-2 rounded overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-green-500"
              style={{
                width: `${
                  (selectedEntity.health / selectedEntity.maxHealth) * 100
                }%`,
              }}
              initial={{ width: 0 }}
              animate={{
                width: `${
                  (selectedEntity.health / selectedEntity.maxHealth) * 100
                }%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="position mt-3 text-xs text-gray-400">
            Position: x: {Math.round(selectedEntity.x)}, y:{" "}
            {Math.round(selectedEntity.y)}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">
          Select an entity to view details
        </div>
      )}
    </motion.div>
  );
};
