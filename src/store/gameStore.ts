import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Entity, GameConfig, KillFeedItem, Bet, BettingStats, EntityType, DeploymentZone } from '../types/game';

const defaultConfig: GameConfig = {
  arenaWidth: 800,
  arenaHeight: 600,
  entitySize: 20,
  entitySpeed: 2,
  entityHealth: 100,
  maxEntities: 100,
  killFeedLimit: 50,
  gameMode: 'classic',
  defaultLifePoints: 1, // Changed from 3 to 1
};

const defaultBettingStats: BettingStats = {
  balance: 1000,
  totalBets: 0,
  winRate: 0,
  totalWon: 0,
  totalLost: 0,
  biggestWin: 0,
  currentStreak: 0,
  streakType: 'win',
  betHistory: [],
};

interface PerformanceSettings {
  maxFPS: number;
  enableEffects: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  enableCollisionOptimization: boolean;
  batchSize: number;
}

interface PerformanceStats {
  fps: number;
  frameTime: number;
  entityCount: number;
  lastUpdate: number;
}

interface GameStore {
  // State
  entities: Entity[];
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  config: GameConfig;
  killFeed: KillFeedItem[];
  bettingStats: BettingStats;
  activeBets: Bet[];
  performanceSettings: PerformanceSettings;
  performanceStats: PerformanceStats;
  
  // Actions
  startBattle: () => void;
  pauseBattle: () => void;
  stopBattle: () => void;
  resetBattle: () => void;
  setSpeed: (speed: number) => void;
  addEntity: (entityData: Omit<Entity, 'id'>) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  removeEntity: (id: string) => void;
  clearEntities: () => void;
  setGameMode: (mode: string) => void;
  setEntityComposition: (composition: any, deploymentZone?: DeploymentZone) => void;
  addKillFeedItem: (item: KillFeedItem) => void;
  placeBet: (amount: number, prediction: string, odds: number) => void;
  resolveBets: (winner: string) => void;
  calculateOdds: () => { rock: number; paper: number; scissors: number };
  calculateWinChances: () => { rock: number; paper: number; scissors: number };
  saveLayout: (layout: any) => void;
  loadLayout: () => any;
  saveGame: (name: string) => void;
  loadGame: (name: string) => void;
  
  // Performance methods
  updatePerformanceStats: (stats: Partial<PerformanceStats>) => void;
  setPerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  getOptimalSettings: () => PerformanceSettings;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    entities: [],
    isRunning: false,
    isPaused: false,
    speed: 1,
    config: defaultConfig,
    killFeed: [],
    bettingStats: defaultBettingStats,
    activeBets: [],
    
    performanceSettings: {
      maxFPS: 60,
      enableEffects: true,
      renderQuality: 'high',
      enableCollisionOptimization: true,
      batchSize: 10,
    },
    
    performanceStats: {
      fps: 60,
      frameTime: 16.67,
      entityCount: 0,
      lastUpdate: Date.now(),
    },
    
    // Actions
    startBattle: () => set({ isRunning: true, isPaused: false }),
    
    pauseBattle: () => set((state) => ({ isPaused: !state.isPaused })),
    
    stopBattle: () => set({ isRunning: false, isPaused: false }),
    
    resetBattle: () => set({
      entities: [],
      isRunning: false,
      isPaused: false,
      killFeed: [],
      activeBets: [],
    }),
    
    setSpeed: (speed) => set({ speed }),
    
    addEntity: (entityData) => {
      const entity: Entity = {
        ...entityData,
        id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        initialType: entityData.type,
      };
      set((state) => ({ entities: [...state.entities, entity] }));
    },
    
    updateEntity: (id, updates) => set((state) => ({
      entities: state.entities.map(entity =>
        entity.id === id ? { ...entity, ...updates } : entity
      ),
    })),
    
    removeEntity: (id) => set((state) => ({
      entities: state.entities.filter(entity => entity.id !== id),
    })),
    
    clearEntities: () => set({ entities: [] }),
    
    setGameMode: (mode) => set((state) => ({
      config: { ...state.config, gameMode: mode as any }
    })),
    
    setEntityComposition: (composition, deploymentZone = 'random') => {
      const { config } = get();
      const newEntities: Entity[] = [];
      
      // Helper function to get deployment position based on zone
      const getDeploymentPosition = (type: EntityType, index: number, total: number, typeIndex: number, typeTotal: number) => {
        if (deploymentZone === 'corners') {
          // Corner deployment - separate by entity types
          const margin = 50; // Distance from edges
          const spread = 80; // How spread out entities are within their corner
          
          switch (type) {
            case 'rock':
              // Top-left corner
              return {
                x: margin + (Math.random() * spread),
                y: margin + (Math.random() * spread),
              };
            case 'paper':
              // Top-right corner
              return {
                x: config.arenaWidth - margin - spread + (Math.random() * spread),
                y: margin + (Math.random() * spread),
              };
            case 'scissors':
              // Bottom-center area
              return {
                x: config.arenaWidth/2 - spread/2 + (Math.random() * spread),
                y: config.arenaHeight - margin - spread + (Math.random() * spread),
              };
            default:
              return {
                x: Math.random() * config.arenaWidth,
                y: Math.random() * config.arenaHeight,
              };
          }
        } else {
          // Random deployment
          return {
            x: Math.random() * config.arenaWidth,
            y: Math.random() * config.arenaHeight,
          };
        }
      };

      // Create entities for each type
      let entityIndex = 0;
      
      // Create rocks
      for (let i = 0; i < composition.rocks; i++) {
        const position = getDeploymentPosition('rock', entityIndex++, composition.rocks + composition.papers + composition.scissors, i, composition.rocks);
        
        newEntities.push({
          id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'rock',
          initialType: 'rock',
          x: position.x,
          y: position.y,
          size: config.entitySize,
          speed: config.entitySpeed,
          angle: Math.random() * Math.PI * 2,
          health: config.entityHealth,
          maxHealth: config.entityHealth,
          color: '#ef4444',
          isAlive: true,
          team: 'team1',
          kills: 0,
          lifePoints: config.gameMode === 'lifepoints' ? config.defaultLifePoints : undefined,
          maxLifePoints: config.gameMode === 'lifepoints' ? 3 : undefined,
        });
      }
      
      // Create papers
      for (let i = 0; i < composition.papers; i++) {
        const position = getDeploymentPosition('paper', entityIndex++, composition.rocks + composition.papers + composition.scissors, i, composition.papers);
        
        newEntities.push({
          id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'paper',
          initialType: 'paper',
          x: position.x,
          y: position.y,
          size: config.entitySize,
          speed: config.entitySpeed,
          angle: Math.random() * Math.PI * 2,
          health: config.entityHealth,
          maxHealth: config.entityHealth,
          color: '#3b82f6',
          isAlive: true,
          team: 'team1',
          kills: 0,
          lifePoints: config.gameMode === 'lifepoints' ? config.defaultLifePoints : undefined,
          maxLifePoints: config.gameMode === 'lifepoints' ? 3 : undefined,
        });
      }
      
      // Create scissors
      for (let i = 0; i < composition.scissors; i++) {
        const position = getDeploymentPosition('scissors', entityIndex++, composition.rocks + composition.papers + composition.scissors, i, composition.scissors);
        
        newEntities.push({
          id: `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'scissors',
          initialType: 'scissors',
          x: position.x,
          y: position.y,
          size: config.entitySize,
          speed: config.entitySpeed,
          angle: Math.random() * Math.PI * 2,
          health: config.entityHealth,
          maxHealth: config.entityHealth,
          color: '#eab308',
          isAlive: true,
          team: 'team1',
          kills: 0,
          lifePoints: config.gameMode === 'lifepoints' ? config.defaultLifePoints : undefined,
          maxLifePoints: config.gameMode === 'lifepoints' ? 3 : undefined,
        });
      }

      set({ entities: newEntities });
    },
    
    addKillFeedItem: (item) => {
      const killFeedItem: KillFeedItem = {
        ...item,
        id: `kill-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      
      set((state) => ({
        killFeed: [killFeedItem, ...state.killFeed].slice(0, state.config.killFeedLimit || 50),
      }));
    },
    
    placeBet: (amount, prediction, odds) => {
      const { bettingStats } = get();
      
      if (amount > bettingStats.balance) return;
      
      const bet: Bet = {
        id: `bet-${Date.now()}`,
        amount,
        prediction,
        odds,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      set((state) => ({
        activeBets: [...state.activeBets, bet],
        bettingStats: {
          ...state.bettingStats,
          balance: state.bettingStats.balance - amount,
          totalBets: state.bettingStats.totalBets + 1
        }
      }));
    },
    
    resolveBets: (winner) => {
      const { activeBets, bettingStats } = get();
      
      let totalPayout = 0;
      let won = 0;
      let lost = 0;
      let biggestWin = bettingStats.biggestWin;
      
      const resolvedBets = activeBets.map(bet => {
        const didWin = bet.prediction === winner;
        const payout = didWin ? bet.amount * bet.odds : 0;
        
        if (didWin) {
          won++;
          totalPayout += payout;
          if (payout > biggestWin) biggestWin = payout;
        } else {
          lost++;
        }
        
        return { ...bet, status: didWin ? 'won' : 'lost', payout } as Bet;
      });
      
      const newWinRate = bettingStats.totalBets > 0 ? 
        ((bettingStats.totalWon + won) / (bettingStats.totalBets)) * 100 : 0;
      
      set((state) => ({
        activeBets: [],
        bettingStats: {
          ...state.bettingStats,
          balance: state.bettingStats.balance + totalPayout,
          totalWon: state.bettingStats.totalWon + won,
          totalLost: state.bettingStats.totalLost + lost,
          winRate: newWinRate,
          biggestWin,
          betHistory: [...resolvedBets, ...state.bettingStats.betHistory].slice(0, 100)
        }
      }));
    },
    
    calculateOdds: () => {
      const { entities } = get();
      const aliveEntities = entities.filter(e => e.isAlive);
      
      const rockCount = aliveEntities.filter(e => e.type === 'rock').length;
      const paperCount = aliveEntities.filter(e => e.type === 'paper').length;
      const scissorsCount = aliveEntities.filter(e => e.type === 'scissors').length;
      
      const total = rockCount + paperCount + scissorsCount;
      
      if (total === 0) return { rock: 2.0, paper: 2.0, scissors: 2.0 };
      
      const rockProbability = rockCount / total;
      const paperProbability = paperCount / total;
      const scissorsProbability = scissorsCount / total;
      
      return {
        rock: rockProbability > 0 ? Math.max(1.1, 1 / rockProbability) : 10.0,
        paper: paperProbability > 0 ? Math.max(1.1, 1 / paperProbability) : 10.0,
        scissors: scissorsProbability > 0 ? Math.max(1.1, 1 / scissorsProbability) : 10.0,
      };
    },
    
    calculateWinChances: () => {
      const { entities } = get();
      const aliveEntities = entities.filter(e => e.isAlive);
      
      const rockCount = aliveEntities.filter(e => e.type === 'rock').length;
      const paperCount = aliveEntities.filter(e => e.type === 'paper').length;
      const scissorsCount = aliveEntities.filter(e => e.type === 'scissors').length;
      
      const total = rockCount + paperCount + scissorsCount;
      
      if (total === 0) return { rock: 33.33, paper: 33.33, scissors: 33.33 };
      
      return {
        rock: (rockCount / total) * 100,
        paper: (paperCount / total) * 100,
        scissors: (scissorsCount / total) * 100,
      };
    },
    
    saveLayout: (layout) => {
      localStorage.setItem('rps-arena-layout', JSON.stringify(layout));
    },
    
    loadLayout: () => {
      const saved = localStorage.getItem('rps-arena-layout');
      return saved ? JSON.parse(saved) : null;
    },
    
    saveGame: (name) => {
      const { entities, config, killFeed, bettingStats } = get();
      const gameData = {
        name,
        entities,
        config,
        killFeed,
        bettingStats,
        timestamp: Date.now()
      };
      localStorage.setItem(`rps-game-${name}`, JSON.stringify(gameData));
    },
    
    loadGame: (name) => {
      const saved = localStorage.getItem(`rps-game-${name}`);
      if (saved) {
        const gameData = JSON.parse(saved);
        set({
          entities: gameData.entities,
          config: gameData.config,
          killFeed: gameData.killFeed,
          bettingStats: gameData.bettingStats
        });
      }
    },
    
    // Performance methods
    updatePerformanceStats: (stats) =>
      set((state) => ({
        performanceStats: { ...state.performanceStats, ...stats },
      })),
    
    setPerformanceSettings: (settings) =>
      set((state) => ({
        performanceSettings: { ...state.performanceSettings, ...settings },
      })),
    
    getOptimalSettings: () => {
      const { performanceStats } = get();
      
      // Auto-adjust settings based on performance
      if (performanceStats.fps < 30) {
        return {
          maxFPS: 30,
          enableEffects: false,
          renderQuality: 'low' as const,
          enableCollisionOptimization: true,
          batchSize: 5,
        };
      } else if (performanceStats.fps < 45) {
        return {
          maxFPS: 45,
          enableEffects: true,
          renderQuality: 'medium' as const,
          enableCollisionOptimization: true,
          batchSize: 8,
        };
      }
      
      return {
        maxFPS: 60,
        enableEffects: true,
        renderQuality: 'high' as const,
        enableCollisionOptimization: true,
        batchSize: 10,
      };
    },
  }))
);
