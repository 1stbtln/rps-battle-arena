import React, { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import type { Entity } from "../types/game";
import { GAME_RULES } from "../types/game";
import rockImg from "../assets/rock.png";
import paperImg from "../assets/paper.png";
import scissorsImg from "../assets/scissors.png";
import dwayneImg from "../assets/dwayne.png";
import dwayneGif from "../assets/dwayne-johnson-the-rock.gif";
import scissorsGif from "../assets/edward scissorhands.gif";
import paperGif from "../assets/paper.gif";

interface BattleArenaProps {
  className?: string;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, fps: 60 });

  // Performance optimization: Use spatial grid for collision detection
  const spatialGridRef = useRef<Map<string, Entity[]>>(new Map());
  const gridSize = 100; // Grid cell size

  // Pre-load images
  const rockImgRef = useRef<HTMLImageElement | null>(null);
  const paperImgRef = useRef<HTMLImageElement | null>(null);
  const scissorsImgRef = useRef<HTMLImageElement | null>(null);
  const dwayneImgRef = useRef<HTMLImageElement | null>(null);

  // Track loading state for each image
  const [imagesLoaded, setImagesLoaded] = useState({
    rock: false,
    paper: false,
    scissors: false,
    dwayne: false,
  });

  useEffect(() => {
    // Load entity images with proper error handling
    rockImgRef.current = new Image();
    rockImgRef.current.onload = () =>
      setImagesLoaded((prev) => ({ ...prev, rock: true }));
    rockImgRef.current.onerror = () =>
      console.error("Failed to load rock image");
    rockImgRef.current.src = rockImg;

    paperImgRef.current = new Image();
    paperImgRef.current.onload = () =>
      setImagesLoaded((prev) => ({ ...prev, paper: true }));
    paperImgRef.current.onerror = () =>
      console.error("Failed to load paper image");
    paperImgRef.current.src = paperImg;

    scissorsImgRef.current = new Image();
    scissorsImgRef.current.onload = () =>
      setImagesLoaded((prev) => ({ ...prev, scissors: true }));
    scissorsImgRef.current.onerror = () =>
      console.error("Failed to load scissors image");
    scissorsImgRef.current.src = scissorsImg;

    // Load Dwayne "The Rock" Johnson image
    dwayneImgRef.current = new Image();
    dwayneImgRef.current.onload = () =>
      setImagesLoaded((prev) => ({ ...prev, dwayne: true }));
    dwayneImgRef.current.onerror = () =>
      console.error("Failed to load dwayne image");
    dwayneImgRef.current.src = dwayneImg;
  }, []);

  const {
    entities,
    isRunning,
    isPaused,
    speed,
    config,
    updateEntity,
    addKillFeedItem,
    performanceSettings,
    updatePerformanceStats,
  } = useGameStore();

  // Performance optimization: Create spatial grid
  const createSpatialGrid = useCallback(
    (entities: Entity[]) => {
      const grid = new Map<string, Entity>();
      const aliveEntities = entities.filter((e) => e.isAlive);

      aliveEntities.forEach((entity) => {
        const gridX = Math.floor(entity.x / gridSize);
        const gridY = Math.floor(entity.y / gridSize);
        const key = `${gridX},${gridY}`;

        if (!grid.has(key)) {
          grid.set(key, []);
        }
        grid.get(key)!.push(entity);
      });

      return grid;
    },
    [gridSize]
  );

  // Performance optimization: Get nearby entities only
  const getNearbyEntities = useCallback(
    (entity: Entity, grid: Map<string, Entity[]>) => {
      const gridX = Math.floor(entity.x / gridSize);
      const gridY = Math.floor(entity.y / gridSize);
      const nearby: Entity[] = [];

      // Check 3x3 grid around entity
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${gridX + dx},${gridY + dy}`;
          if (grid.has(key)) {
            nearby.push(...grid.get(key)!);
          }
        }
      }

      return nearby.filter((e) => e.id !== entity.id);
    },
    [gridSize]
  );

  // Add the calculateWinProbability function
  const calculateWinProbability = useCallback(() => {
    // Only calculate if the game is running
    if (!isRunning) return;

    const aliveEntities = entities.filter((e) => e.isAlive);
    const team1Entities = aliveEntities.filter((e) => e.team === "team1");
    const team2Entities = aliveEntities.filter((e) => e.team === "team2");

    // If either team has no entities, we don't need to calculate
    if (team1Entities.length === 0 || team2Entities.length === 0) return;

    // Calculate total health and strength for each team
    const team1Stats = calculateTeamStats(team1Entities);
    const team2Stats = calculateTeamStats(team2Entities);

    // Calculate advantage based on entity types (Rock-Paper-Scissors matchups)
    let team1TypeAdvantage = 0;
    let team2TypeAdvantage = 0;

    // For each entity in team1, check advantage against each entity in team2
    team1Entities.forEach((entity1) => {
      team2Entities.forEach((entity2) => {
        if (GAME_RULES[entity1.type].beats === entity2.type) {
          team1TypeAdvantage++;
        } else if (GAME_RULES[entity2.type].beats === entity1.type) {
          team2TypeAdvantage++;
        }
      });
    });

    // You could store these values in your game store or use them for UI indicators
    // For example: store.setWinProbabilities({ team1: team1Advantage, team2: team2Advantage });

    // For now, we'll just log it for debugging
    // console.log('Team stats:', { team1: team1Stats, team2: team2Stats });
    // console.log('Type advantages:', { team1: team1TypeAdvantage, team2: team2TypeAdvantage });
  }, [entities, isRunning]);

  // Helper function to calculate team statistics
  const calculateTeamStats = (teamEntities: Entity[]) => {
    return teamEntities.reduce(
      (stats, entity) => {
        return {
          totalHealth: stats.totalHealth + entity.health,
          totalSize: stats.totalSize + entity.size,
          entityCount: stats.entityCount + 1,
          rockCount: stats.rockCount + (entity.type === "rock" ? 1 : 0),
          paperCount: stats.paperCount + (entity.type === "paper" ? 1 : 0),
          scissorsCount:
            stats.scissorsCount + (entity.type === "scissors" ? 1 : 0),
        };
      },
      {
        totalHealth: 0,
        totalSize: 0,
        entityCount: 0,
        rockCount: 0,
        paperCount: 0,
        scissorsCount: 0,
      }
    );
  };

  // Optimized game loop with performance monitoring
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!canvasRef.current || isPaused) {
        if (isRunning) {
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      const targetFrameTime = 1000 / performanceSettings.maxFPS;

      // Performance monitoring
      const fpsCounter = fpsCounterRef.current;
      fpsCounter.frames++;

      if (currentTime - fpsCounter.lastTime >= 1000) {
        const fps = fpsCounter.frames;
        updatePerformanceStats({
          fps,
          frameTime: deltaTime,
          entityCount: entities.filter((e) => e.isAlive).length,
          lastUpdate: currentTime,
        });

        fpsCounter.frames = 0;
        fpsCounter.lastTime = currentTime;
      }

      if (deltaTime >= targetFrameTime) {
        updateGame(deltaTime * speed);
        renderGame();
        lastTimeRef.current = currentTime;
      }

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [
      entities,
      isRunning,
      isPaused,
      speed,
      performanceSettings.maxFPS,
      updatePerformanceStats,
    ]
  );

  // Optimized update game with spatial partitioning
  const updateGame = useCallback(
    (deltaTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const aliveEntities = entities.filter((e) => e.isAlive);

      // Performance optimization: Early exit for game over
      const entityTypes = new Set(aliveEntities.map((entity) => entity.type));
      if (aliveEntities.length > 0 && entityTypes.size === 1) {
        const winningType = aliveEntities[0].type;
        endMatch(winningType);
        return;
      }

      // Create spatial grid for collision optimization
      const spatialGrid = performanceSettings.enableCollisionOptimization
        ? createSpatialGrid(aliveEntities)
        : new Map<string, Entity[]>();

      // Process entities in batches for better performance
      const batchSize = performanceSettings.batchSize;

      for (let i = 0; i < aliveEntities.length; i += batchSize) {
        const batch = aliveEntities.slice(i, i + batchSize);

        batch.forEach((entity) => {
          // Optimized movement calculation
          const cosAngle = Math.cos(entity.angle);
          const sinAngle = Math.sin(entity.angle);

          let newX = entity.x + cosAngle * entity.speed;
          let newY = entity.y + sinAngle * entity.speed;
          let newAngle = entity.angle;

          // Optimized wall collision
          const entitySize = entity.size;
          const maxX = config.arenaWidth - entitySize;
          const maxY = config.arenaHeight - entitySize;

          if (newX <= entitySize || newX >= maxX) {
            newAngle = Math.PI - entity.angle;
            newX = Math.max(entitySize, Math.min(maxX, newX));
          }
          if (newY <= entitySize || newY >= maxY) {
            newAngle = -entity.angle;
            newY = Math.max(entitySize, Math.min(maxY, newY));
          }

          // Optimized collision detection using spatial grid
          const nearbyEntities = performanceSettings.enableCollisionOptimization
            ? getNearbyEntities(entity, spatialGrid)
            : aliveEntities.filter((e) => e.id !== entity.id);

          for (const other of nearbyEntities) {
            const dx = other.x - newX;
            const dy = other.y - newY;
            const distanceSquared = dx * dx + dy * dy;
            const minDistanceSquared = (entity.size + other.size) ** 2;

            if (distanceSquared < minDistanceSquared) {
              if (entity.type === other.type) {
                // Optimized bounce calculation
                const distance = Math.sqrt(distanceSquared);
                const angle = Math.atan2(dy, dx);
                const separation = entity.size + other.size + 1;

                newX = other.x - Math.cos(angle) * separation;
                newY = other.y - Math.sin(angle) * separation;
                newAngle = angle + Math.PI + (Math.random() - 0.5) * 0.5;
              } else {
                handleCombat(entity, other);
              }
              break; // Only handle one collision per frame for performance
            }
          }

          // Add controlled randomness
          newAngle += (Math.random() - 0.5) * 0.1;

          updateEntity(entity.id, {
            x: newX,
            y: newY,
            angle: newAngle,
          });
        });
      }

      calculateWinProbability();
    },
    [
      entities,
      config,
      updateEntity,
      addKillFeedItem,
      calculateWinProbability,
      createSpatialGrid,
      getNearbyEntities,
      performanceSettings,
    ]
  );

  // Optimized rendering with quality settings
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Performance optimization: Disable anti-aliasing for low quality
    if (performanceSettings.renderQuality === "low") {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
    }

    // Clear canvas efficiently
    ctx.clearRect(0, 0, config.arenaWidth, config.arenaHeight);

    // Draw background grid only on medium/high quality
    if (
      performanceSettings.renderQuality !== "low" &&
      performanceSettings.enableEffects
    ) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = 0; x <= config.arenaWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, config.arenaHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= config.arenaHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(config.arenaWidth, y);
        ctx.stroke();
      }
    }

    // Optimized entity rendering
    const aliveEntities = entities.filter((e) => e.isAlive);

    aliveEntities.forEach((entity) => {
      ctx.save();
      ctx.translate(entity.x, entity.y);

      // Use simplified rendering for low quality
      if (performanceSettings.renderQuality === "low") {
        // Simple colored circles for low quality
        ctx.fillStyle = entity.color;
        ctx.beginPath();
        ctx.arc(0, 0, entity.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Full rendering for medium/high quality
        if (
          entity.temporaryImage === "dwayne" &&
          entity.temporaryImageUntil &&
          Date.now() < entity.temporaryImageUntil &&
          dwayneImgRef.current &&
          imagesLoaded.dwayne
        ) {
          const size = entity.size * 2;
          ctx.drawImage(dwayneImgRef.current, -size / 2, -size / 2, size, size);
        } else {
          // Draw entity based on type with full detail
          switch (entity.type) {
            case "rock":
              if (rockImgRef.current && imagesLoaded.rock) {
                const size = entity.size * 2;
                ctx.drawImage(
                  rockImgRef.current,
                  -size / 2,
                  -size / 2,
                  size,
                  size
                );
              } else {
                // Fallback shape
                ctx.fillStyle = entity.color;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                  const angle = (i * Math.PI) / 4;
                  const x = Math.cos(angle) * entity.size;
                  const y = Math.sin(angle) * entity.size;
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              }
              break;

            case "paper":
              if (paperImgRef.current && imagesLoaded.paper) {
                const size = entity.size * 2;
                ctx.drawImage(
                  paperImgRef.current,
                  -size / 2,
                  -size / 2,
                  size,
                  size
                );
              } else {
                // Fallback to shape if image not loaded
                ctx.fillStyle = entity.color;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;

                // Draw paper as rectangle with folded corner
                const size = entity.size * 1.8;
                ctx.beginPath();
                ctx.moveTo(-size / 2, -size / 2);
                ctx.lineTo(size / 2, -size / 2);
                ctx.lineTo(size / 2, size / 2);
                ctx.lineTo(-size / 2, size / 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw folded corner
                ctx.beginPath();
                ctx.moveTo(size / 2 - size / 4, -size / 2);
                ctx.lineTo(size / 2 - size / 4, -size / 2 + size / 4);
                ctx.lineTo(size / 2, -size / 2 + size / 4);
                ctx.stroke();
              }
              break;

            case "scissors":
              if (scissorsImgRef.current && imagesLoaded.scissors) {
                const size = entity.size * 2;
                ctx.drawImage(
                  scissorsImgRef.current,
                  -size / 2,
                  -size / 2,
                  size,
                  size
                );
              } else {
                // Fallback to shape if image not loaded
                ctx.fillStyle = entity.color;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;

                // Draw scissors as an X shape
                const size = entity.size;

                ctx.beginPath();
                ctx.moveTo(-size, -size);
                ctx.lineTo(size, size);
                ctx.moveTo(-size, size);
                ctx.lineTo(size, -size);
                ctx.stroke();

                // Draw circles for handles
                ctx.beginPath();
                ctx.arc(-size / 2, -size / 2, size / 3, 0, Math.PI * 2);
                ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
              }
              break;
          }
        }
      }

      // Draw life points and other UI elements only on medium/high quality
      if (performanceSettings.renderQuality !== "low") {
        if (
          config.gameMode === "lifepoints" &&
          entity.lifePoints !== undefined
        ) {
          const lifePoints = entity.lifePoints;
          const maxLifePoints = entity.maxLifePoints || 3;
          const heartSize = 6;
          const heartSpacing = 8;
          const totalWidth = maxLifePoints * heartSpacing - heartSpacing;
          const startX = -totalWidth / 2;

          for (let i = 0; i < maxLifePoints; i++) {
            const x = startX + i * heartSpacing;
            const y = -entity.size - 20;
            ctx.fillStyle =
              i < lifePoints ? "#ef4444" : "rgba(255, 255, 255, 0.3)";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText("♥", x, y);
          }
        }

        // Health bar
        if (entity.health < entity.maxHealth) {
          const barWidth = entity.size * 1.5;
          const barHeight = 4;
          const healthPercent = entity.health / entity.maxHealth;

          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(-barWidth / 2, entity.size + 5, barWidth, barHeight);

          ctx.fillStyle =
            healthPercent > 0.5
              ? "#22c55e"
              : healthPercent > 0.25
              ? "#eab308"
              : "#ef4444";
          ctx.fillRect(
            -barWidth / 2,
            entity.size + 5,
            barWidth * healthPercent,
            barHeight
          );
        }

        // Kill count
        if (config.gameMode === "lifepoints" && entity.kills > 0) {
          ctx.fillStyle = "white";
          ctx.font = "bold 12px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(entity.kills.toString(), 0, -entity.size - 5);
        }
      }

      ctx.restore();
    });
  }, [entities, config, imagesLoaded, performanceSettings]);

  // Update the endMatch function to include betting information
  const endMatch = useCallback(
    (winningType: string) => {
      // Stop the simulation
      useGameStore.getState().stopBattle();

      // Get betting information before resolving bets
      const bettingStatsBeforeResolve = {
        ...useGameStore.getState().bettingStats,
      };
      const activeBetsBeforeResolve = [...useGameStore.getState().activeBets];

      // Resolve any active bets
      useGameStore
        .getState()
        .resolveBets(winningType as "rock" | "paper" | "scissors");

      // Get updated betting stats after resolving
      const bettingStatsAfterResolve = useGameStore.getState().bettingStats;

      const allEntities = [...entities];
      const aliveEntities = allEntities.filter((e) => e.isAlive);

      // Remove references to teams since we don't use them anymore
      // Find entity with most kills
      const topKiller = [...allEntities].sort((a, b) => b.kills - a.kills)[0];

      // Calculate entity type statistics
      const entityTypeCounts = {
        initial: {
          rock: allEntities.filter((e) => e.initialType === "rock").length,
          paper: allEntities.filter((e) => e.initialType === "paper").length,
          scissors: allEntities.filter((e) => e.initialType === "scissors")
            .length,
        },
        final: {
          rock: aliveEntities.filter((e) => e.type === "rock").length,
          paper: aliveEntities.filter((e) => e.type === "paper").length,
          scissors: aliveEntities.filter((e) => e.type === "scissors").length,
        },
      };

      // Calculate transformations (when entities change type)
      const transformations = allEntities.filter(
        (e) => e.type !== e.initialType
      ).length;

      // Calculate battle duration
      const battleDuration = Math.round(
        (Date.now() - lastTimeRef.current) / 1000
      );

      // Calculate kill statistics by entity type
      const killsByType = {
        rock: allEntities
          .filter((e) => e.type === "rock")
          .reduce((sum, e) => sum + e.kills, 0),
        paper: allEntities
          .filter((e) => e.type === "paper")
          .reduce((sum, e) => sum + e.kills, 0),
        scissors: allEntities
          .filter((e) => e.type === "scissors")
          .reduce((sum, e) => sum + e.kills, 0),
      };

      // Remove team efficiency calculations as we don't use teams

      // Calculate betting results
      let betResult = null;
      if (activeBetsBeforeResolve.length > 0) {
        const bet = activeBetsBeforeResolve[0];
        const won = bet.prediction === winningType;
        const payout = won ? bet.amount * bet.odds : 0;

        betResult = {
          prediction: bet.prediction,
          amount: bet.amount,
          odds: bet.odds,
          won,
          payout,
          balanceChange: won ? payout - bet.amount : -bet.amount,
          newBalance: bettingStatsAfterResolve.balance,
        };
      }

      // Calculate match statistics (removing team references)
      const matchResult = {
        id: `match-${Date.now()}`,
        date: new Date(),
        duration: battleDuration,
        winningType: winningType,
        // Additional statistics
        entityTypeCounts,
        killsByType,
        totalEntities: allEntities.length,
        aliveEntitiesCount: aliveEntities.length,
        transformations,
        topKiller: {
          type: topKiller?.type || "none",
          kills: topKiller?.kills || 0,
        },
        killedByType: {
          rock: allEntities.filter(
            (e) => !e.isAlive && e.killedByType === "rock"
          ).length,
          paper: allEntities.filter(
            (e) => !e.isAlive && e.killedByType === "paper"
          ).length,
          scissors: allEntities.filter(
            (e) => !e.isAlive && e.killedByType === "scissors"
          ).length,
        },
        // Betting information
        betResult,
        bettingStats: bettingStatsAfterResolve,
      };

      // Show match results to user
      setMatchResult(matchResult);
    },
    [entities]
  );

  // Add state to store match result for display
  const [matchResult, setMatchResult] = useState<any>(null);

  const handleCombat = (entity1: Entity, entity2: Entity) => {
    const rules = GAME_RULES;
    let winner: Entity | null = null;
    let loser: Entity | null = null;

    // Check the rules to determine winner and loser
    if (entity1.type === entity2.type) {
      // Same type - bounce off each other
      return;
    } else if (rules[entity1.type].beats === entity2.type) {
      winner = entity1;
      loser = entity2;
    } else if (rules[entity2.type].beats === entity1.type) {
      winner = entity2;
      loser = entity1;
    }

    if (!winner || !loser) return;

    // Handle different game modes
    if (config.gameMode === "lifepoints") {
      // New Life Points Mode - start with 1 life, gain/lose 1 per battle
      const currentLoserLifePoints = loser.lifePoints || 1;
      const newLoserLifePoints = currentLoserLifePoints - 1;

      if (newLoserLifePoints <= 0) {
        // Convert the entity when it runs out of life points
        updateEntity(loser.id, {
          type: winner.type,
          color: winner.color,
          lifePoints: 1, // Start with 1 life point after conversion
          killedByType: winner.type,
        });

        // Winner gains a life point but capped at 3
        updateEntity(winner.id, {
          lifePoints: Math.min((winner.lifePoints || 1) + 1, 3),
          kills: winner.kills + 1,
        });

        // Add to kill feed (conversion)
        addKillFeedItem({
          killerType: winner.type,
          victimType: loser.type,
          killerId: winner.id,
          victimId: loser.id,
        });
      } else {
        // Loser just loses a life point (no conversion if life points remaining)
        updateEntity(loser.id, {
          lifePoints: newLoserLifePoints,
        });

        // Winner gains a life point but capped at 3
        updateEntity(winner.id, {
          lifePoints: Math.min((winner.lifePoints || 1) + 1, 3),
        });
      }
    } else {
      // Classic Mode - no kill tracking, just conversion
      // Check if this is a rock hitting scissors for special effect
      if (
        (entity1.type === "rock" && entity2.type === "scissors") ||
        (entity2.type === "rock" && entity1.type === "scissors")
      ) {
        const scissors = entity1.type === "scissors" ? entity1 : entity2;
        const now = Date.now();

        updateEntity(scissors.id, {
          temporaryImage: "dwayne",
          temporaryImageUntil: now + 100,
        });

        setTimeout(() => {
          updateEntity(scissors.id, {
            temporaryImage: undefined,
            temporaryImageUntil: undefined,
          });
        }, 250);
      }

      // Convert the loser without tracking kills
      updateEntity(loser.id, {
        type: winner.type,
        color: winner.color,
        killedByType: winner.type,
      });

      // No kill tracking for classic mode
      // No kill feed for classic mode
    }
  };

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, gameLoop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = config.arenaWidth;
      canvas.height = config.arenaHeight;
      renderGame();
    }
  }, [config, renderGame]);

  return (
    <motion.div
      className={`battle-arena ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl border border-white/20"
        style={{
          background: performanceSettings.enableEffects
            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(101, 163, 13, 0.1) 100%)"
            : "#0a0f1c",
        }}
      />

      {/* Performance indicator */}
      {isRunning && (
        <div className="absolute top-2 left-2 text-xs font-mono performance-indicator">
          <div
            className={`px-2 py-1 rounded ${
              useGameStore.getState().performanceStats.fps >= 50
                ? "bg-green-900/50 text-green-300"
                : useGameStore.getState().performanceStats.fps >= 30
                ? "bg-yellow-900/50 text-yellow-300"
                : "bg-red-900/50 text-red-300"
            }`}
          >
            FPS: {Math.round(useGameStore.getState().performanceStats.fps)}
          </div>
        </div>
      )}

      {!isRunning &&
        entities.filter((e) => e.isAlive).length === 0 &&
        !matchResult && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Battle Arena Ready</h3>
              <p className="text-gray-300">
                Add entities and start the battle to see who dominates!
              </p>
            </div>
          </motion.div>
        )}

      {/* Match Results Display */}
      {matchResult && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-8 max-w-4xl h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Battle Report
            </h3>

            <div className="mb-6 text-center">
              <div className="text-xl font-bold text-yellow-400">
                {matchResult.winningType.charAt(0).toUpperCase() +
                  matchResult.winningType.slice(1)}{" "}
                Victory!
              </div>
              <div className="text-sm text-gray-300 mt-1">
                {matchResult.winningType.charAt(0).toUpperCase() +
                  matchResult.winningType.slice(1)}{" "}
                dominates the arena!
              </div>

              {/* Victory Celebrations for all types */}
              {matchResult.winningType === "rock" && (
                <motion.div
                  className="mt-4 flex justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.5,
                  }}
                >
                  <div className="relative">
                    <img
                      src={dwayneGif}
                      alt="The Rock Victory"
                      className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl"
                    />
                    <motion.div
                      className="absolute -inset-2 rounded-full border-2 border-yellow-400"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Scissors Victory Celebration */}
              {matchResult.winningType === "scissors" && (
                <motion.div
                  className="mt-4 flex justify-center"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.5,
                  }}
                >
                  <div className="relative">
                    <img
                      src={scissorsGif}
                      alt="Edward Scissorhands Victory"
                      className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl"
                    />
                    <motion.div
                      className="absolute -inset-2 rounded-full border-2 border-yellow-400"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Paper Victory Celebration */}
              {matchResult.winningType === "paper" && (
                <motion.div
                  className="mt-4 flex justify-center"
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.5,
                  }}
                >
                  <div className="relative">
                    <img
                      src={paperGif}
                      alt="Paper Victory"
                      className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-2xl"
                    />
                    <motion.div
                      className="absolute -inset-2 rounded-full border-2 border-yellow-400"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Betting Results */}
            {matchResult.betResult && (
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">Betting Results</h4>
                <div
                  className={`p-4 rounded-lg border ${
                    matchResult.betResult.won
                      ? "bg-green-900/30 border-green-500/30"
                      : "bg-red-900/30 border-red-500/30"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">
                        {matchResult.betResult.prediction === "rock" && "🪨"}
                        {matchResult.betResult.prediction === "paper" && "📄"}
                        {matchResult.betResult.prediction === "scissors" &&
                          "✂️"}
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          You bet on {matchResult.betResult.prediction}
                        </div>
                        <div className="text-xs text-gray-300">
                          ${matchResult.betResult.amount.toFixed(2)} at{" "}
                          {matchResult.betResult.odds.toFixed(2)}x odds
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold text-lg ${
                          matchResult.betResult.won
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {matchResult.betResult.won ? "WIN!" : "LOSS"}
                      </div>
                      {matchResult.betResult.won && (
                        <div className="text-sm text-green-300">
                          +${matchResult.betResult.payout.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balance change:</span>
                      <span
                        className={
                          matchResult.betResult.balanceChange >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {matchResult.betResult.balanceChange >= 0 ? "+" : ""}$
                        {matchResult.betResult.balanceChange.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>New balance:</span>
                      <span className="font-medium">
                        ${matchResult.betResult.newBalance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Match Statistics */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">Match Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.floor(matchResult.duration / 60)}:
                    {(matchResult.duration % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {matchResult.totalEntities}
                  </div>
                  <div className="text-xs text-gray-400">Total Entities</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {matchResult.aliveEntitiesCount}
                  </div>
                  <div className="text-xs text-gray-400">Survivors</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {matchResult.transformations}
                  </div>
                  <div className="text-xs text-gray-400">Transformations</div>
                </div>
              </div>
            </div>

            {/* Entity Type Performance */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-3">
                Entity Type Performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {/* Rock Performance */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">🪨</div>
                    <div>
                      <h5 className="font-medium text-red-300">Rock</h5>
                      <div className="text-xs text-gray-400">
                        {matchResult.winningType === "rock"
                          ? "WINNER"
                          : "Defeated"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.rock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Survived:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.final.rock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kills:</span>
                      <span className="font-medium text-red-400">
                        {matchResult.killsByType.rock}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deaths:</span>
                      <span className="font-medium">
                        {matchResult.killedByType.rock}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-red-500/20 pt-2">
                      <span>Survival Rate:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.rock > 0
                          ? Math.round(
                              (matchResult.entityTypeCounts.final.rock /
                                matchResult.entityTypeCounts.initial.rock) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Paper Performance */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <h5 className="font-medium text-blue-300">Paper</h5>
                      <div className="text-xs text-gray-400">
                        {matchResult.winningType === "paper"
                          ? "WINNER"
                          : "Defeated"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.paper}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Survived:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.final.paper}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kills:</span>
                      <span className="font-medium text-blue-400">
                        {matchResult.killsByType.paper}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deaths:</span>
                      <span className="font-medium">
                        {matchResult.killedByType.paper}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-500/20 pt-2">
                      <span>Survival Rate:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.paper > 0
                          ? Math.round(
                              (matchResult.entityTypeCounts.final.paper /
                                matchResult.entityTypeCounts.initial.paper) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scissors Performance */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-2xl">✂️</div>
                    <div>
                      <h5 className="font-medium text-yellow-300">Scissors</h5>
                      <div className="text-xs text-gray-400">
                        {matchResult.winningType === "scissors"
                          ? "WINNER"
                          : "Defeated"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.scissors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Survived:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.final.scissors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kills:</span>
                      <span className="font-medium text-yellow-400">
                        {matchResult.killsByType.scissors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deaths:</span>
                      <span className="font-medium">
                        {matchResult.killedByType.scissors}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-yellow-500/20 pt-2">
                      <span>Survival Rate:</span>
                      <span className="font-medium">
                        {matchResult.entityTypeCounts.initial.scissors > 0
                          ? Math.round(
                              (matchResult.entityTypeCounts.final.scissors /
                                matchResult.entityTypeCounts.initial.scissors) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle MVP */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Battle MVP</h4>
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4 flex items-center">
                <div className="text-3xl mr-4">
                  {matchResult.topKiller.type === "rock" && "🪨"}
                  {matchResult.topKiller.type === "paper" && "📄"}
                  {matchResult.topKiller.type === "scissors" && "✂️"}
                </div>
                <div>
                  <div className="font-medium text-lg capitalize">
                    {matchResult.topKiller.type} Entity
                  </div>
                  <div className="text-sm text-gray-300">
                    {matchResult.topKiller.kills} kills - Most lethal entity in
                    the arena
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Battle Summary */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2">Battle Summary</h4>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-sm space-y-3">
                  <p>
                    The battle lasted
                    <span className="font-medium mx-1 text-blue-400">
                      {Math.floor(matchResult.duration / 60)}m{" "}
                      {matchResult.duration % 60}s
                    </span>
                    with
                    <span className="font-medium mx-1 text-green-400">
                      {matchResult.totalEntities} entities
                    </span>
                    competing for dominance.
                  </p>

                  <p>
                    <span className="font-medium text-yellow-400 capitalize">
                      {matchResult.winningType}
                    </span>
                    <span className="mx-1">emerged victorious with</span>
                    <span className="font-medium text-red-400">
                      {matchResult.killsByType[matchResult.winningType]} total
                      kills
                    </span>
                    <span className="mx-1">and</span>
                    <span className="font-medium text-green-400">
                      {
                        matchResult.entityTypeCounts.final[
                          matchResult.winningType
                        ]
                      }{" "}
                      survivors
                    </span>
                    <span className="mx-1">remaining in the arena.</span>
                  </p>

                  {matchResult.transformations > 0 && (
                    <p>
                      <span className="font-medium text-purple-400">
                        {matchResult.transformations} entities
                      </span>
                      <span className="mx-1">
                        were transformed during combat, changing the battle's
                        dynamics.
                      </span>
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-400">
                      Total eliminations:{" "}
                      {matchResult.totalEntities -
                        matchResult.aliveEntitiesCount}{" "}
                      • Survival rate:{" "}
                      {Math.round(
                        (matchResult.aliveEntitiesCount /
                          matchResult.totalEntities) *
                          100
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              onClick={() => {
                setMatchResult(null);
                useGameStore.getState().resetBattle();
              }}
            >
              New Battle
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
