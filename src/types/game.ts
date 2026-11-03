export interface BaseUpgrades {
  pointsBonus: number;       // +1 to points per level
  clicksBonus: number;       // +0.2 to clicks per level
  cooldownReduction: number; // -0.1s to cooldown per level
  multiplierBonus: number;   // +0.1x to points multiplier per level
}

export interface PrestigeUpgrades {
  automationUnlocked: boolean; // 1 PP: Unlocks the Automation tab
  clicksMultiplier: number;   // +15% clicks per level
  pointsMultiplier: number;   // +25% points per level (balanced, no hyper-inflation)
  quantumCrit: number;        // 2 PP: +5% chance for critical pulse (max 10)
  boosterSuperconductor: number; // 3 PP: -20% booster decay rate (max 4)
  boosterResonance: number;   // 2 PP: +0.005x to booster multiplier per level
  cooldownOverdrive: number;  // 4 PP: -0.1s min cooldown limit & -0.2s initial cooldown (max 3)
  passiveReactor?: number;    // Legacy fallback for old saves
}

export interface LevelPerks {
  clickMastery: number;     // +15% points per level
  boosterCapacity: number;  // +25 to max booster capacity (100 -> 125 -> 150...)
  fastRecharge: number;     // -0.05s circle cooldown per level
  superClicks: number;      // +20% clicks earned per level
  critPower: number;        // +0.5x critical multiplier per level
  boosterStep: number;      // +0.5 charge clicks per press on booster
  autoHarvest?: number;     // Legacy fallback for old saves
}

export interface LevelState {
  level: number;
  xp: number;
  maxXp: number;
  levelPoints: number;
  totalXpEarned: number;
  perks: LevelPerks;
}

export interface AutomationModule {
  level: number;
  interval: number; // in seconds
  timer: number;    // seconds accumulated towards interval
  enabled: boolean;
}

export interface AutomationState {
  autoclicker: AutomationModule;
  autoUpg1: AutomationModule;
  autoUpg2: AutomationModule;
  autoUpg3: AutomationModule;
  autoUpg4: AutomationModule;
}

export interface GameSettings {
  soundEnabled: boolean;
  autosaveEnabled: boolean;
}

export interface GameState {
  version: number;
  points: number;
  totalPointsEarned: number;
  clicks: number;
  chargeLevel: number; // 0 to 100+ presses
  cooldownRemaining: number; // in seconds
  prestigePoints: number;
  totalPrestigePointsEarned: number;
  prestigeCount: number;
  prestigeShopUnlocked: boolean;
  
  upgrades: BaseUpgrades;
  prestigeUpgrades: PrestigeUpgrades;
  levelState: LevelState;
  automation: AutomationState;
  settings: GameSettings;
  
  lastTickTime: number;
  lastSavedAt: number;
}

export type ActiveTab = 'upgrades' | 'prestige' | 'level' | 'automation' | 'settings';
export type BulkBuyMode = 1 | 5 | 10 | 25 | 100 | 'max';

export interface ClickEffect {
  id: string;
  x: number;
  y: number;
  points: number;
  clicks: number;
  isCrit?: boolean;
}
