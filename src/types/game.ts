export interface BaseUpgrades {
  pointsBonus: number;       // +1 to points per level
  clicksBonus: number;       // +0.2 to clicks per level
  cooldownReduction: number; // -0.1s to cooldown per level
  multiplierBonus: number;   // +0.1x to points multiplier per level
}

export interface PrestigeUpgrades {
  automationUnlocked: boolean; // 1 PP: Unlocks the Automation tab
  clicksMultiplier: number;   // ×1.3 clicks per level
  pointsMultiplier: number;   // ×2 points per level
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
  chargeLevel: number; // 0 to 100 presses
  cooldownRemaining: number; // in seconds
  prestigePoints: number;
  totalPrestigePointsEarned: number;
  prestigeCount: number;
  prestigeShopUnlocked: boolean;
  
  upgrades: BaseUpgrades;
  prestigeUpgrades: PrestigeUpgrades;
  automation: AutomationState;
  settings: GameSettings;
  
  lastTickTime: number;
  lastSavedAt: number;
}

export type ActiveTab = 'upgrades' | 'prestige' | 'automation' | 'settings';

export interface ClickEffect {
  id: string;
  x: number;
  y: number;
  points: number;
  clicks: number;
}
