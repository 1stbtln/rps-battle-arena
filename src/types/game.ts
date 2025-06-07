export type EntityType = 'rock' | 'paper' | 'scissors';
export type Team = 'team1' | 'team2';
export type DeploymentZone = 'random' | 'corners';
export type GameMode = 'classic' | 'lifepoints';

export interface Entity {
  id: string;
  type: EntityType;
  initialType: EntityType;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  health: number;
  maxHealth: number;
  color: string;
  isAlive: boolean;
  team: Team;
  kills: number;
  killedByType?: EntityType;
  temporaryImage?: string;
  temporaryImageUntil?: number;
  lifePoints?: number; // For life points game mode
  maxLifePoints?: number; // For life points game mode
}

export interface BattleState {
  entities: Entity[];
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  killFeed: KillFeedItem[];
  battleStats: BattleStats;
  simulationStats: {
    rockCount: number;
    paperCount: number;
    scissorsCount: number;
  };
}

export interface KillFeedItem {
  id: string;
  killerType: EntityType;
  victimType: EntityType;
  killerId: string;
  victimId: string;
  timestamp: number;
}

export interface BattleStats {
  totalEntities: number;
  aliveEntities: number;
  totalKills: number;
  rocks: number;
  papers: number;
  scissors: number;
  aliveRocks: number;
  alivePapers: number;
  aliveScissors: number;
  totalBattles: number;
  battleDuration: number;
}

export interface GameConfig {
  arenaWidth: number;
  arenaHeight: number;
  entitySize: number;
  entitySpeed: number;
  entityHealth: number;
  maxEntities: number;
  killFeedLimit: number;
  gameMode: GameMode;
  defaultLifePoints: number; // For life points mode
}

export interface EntityComposition {
  rocks: number;
  papers: number;
  scissors: number;
}

export interface WinCondition {
  type: 'elimination' | 'time' | 'kills';
  value: number;
}

export interface BettingOdds {
  rock: number;
  paper: number;
  scissors: number;
}

export interface Bet {
  id: string;
  amount: number;
  prediction: 'rock' | 'paper' | 'scissors';
  odds: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
  title?: string; // Add a title for display purposes
}

export interface BettingStats {
  balance: number;
  totalBets: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  biggestWin: number;
  currentStreak: number;
  streakType: 'win' | 'loss';
  betHistory: Bet[];
}

export const GAME_RULES = {
  rock: { beats: 'scissors', losesTo: 'paper' },
  paper: { beats: 'rock', losesTo: 'scissors' },
  scissors: { beats: 'paper', losesTo: 'rock' }
} as const;

export const ENTITY_COLORS = {
  rock: '#ef4444',
  paper: '#3b82f6',
  scissors: '#eab308'
} as const;