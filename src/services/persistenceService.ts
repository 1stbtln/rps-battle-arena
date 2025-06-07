import type { BattleState, Entity, KillFeedItem } from "../types/game";

// Interface for saved game state
export interface SavedGameState {
  id: string;
  name: string;
  date: string;
  battleState: BattleState;
}

// Mock "database" using IndexedDB
export class PersistenceService {
  private readonly DB_NAME = "rps-battle-arena";
  private readonly STORE_NAME = "saved-games";
  private readonly DB_VERSION = 1;
  
  // Initialize database
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
        }
      };
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };
      
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }
  
  // Save game state
  async saveGame(name: string, battleState: BattleState): Promise<string> {
    try {
      const db = await this.init();
      const id = `game_${Date.now()}`;
      
      const savedGame: SavedGameState = {
        id,
        name,
        date: new Date().toISOString(),
        battleState: this.cleanBattleStateForStorage(battleState),
      };
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], "readwrite");
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.add(savedGame);
        
        request.onsuccess = () => {
          resolve(id);
        };
        
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Failed to save game:", error);
      throw error;
    }
  }
  
  // Load game state by ID
  async loadGame(id: string): Promise<SavedGameState> {
    try {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], "readonly");
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          if (result) {
            resolve(result);
          } else {
            reject(new Error(`Game with ID ${id} not found`));
          }
        };
        
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Failed to load game:", error);
      throw error;
    }
  }
  
  // Get all saved games
  async getAllSavedGames(): Promise<SavedGameState[]> {
    try {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], "readonly");
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result;
          resolve(result || []);
        };
        
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Failed to get all saved games:", error);
      throw error;
    }
  }
  
  // Delete saved game
  async deleteSavedGame(id: string): Promise<void> {
    try {
      const db = await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.STORE_NAME], "readwrite");
        const store = transaction.objectStore(this.STORE_NAME);
        
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Failed to delete saved game:", error);
      throw error;
    }
  }
  
  // Clean battle state for storage (remove circular references, etc.)
  private cleanBattleStateForStorage(battleState: BattleState): BattleState {
    // Create a deep copy
    const cleanedState = JSON.parse(JSON.stringify(battleState));
    
    // Remove any potential circular references or large objects that are not needed
    // In a real app, this would be more thorough
    
    return cleanedState;
  }
}

// Export singleton instance
export const persistenceService = new PersistenceService();
