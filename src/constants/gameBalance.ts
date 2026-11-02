import { GameState } from '../types/game';

export const INITIAL_COOLDOWN = 5.0; // 5 seconds
export const MIN_COOLDOWN = 0.5;     // 0.5s minimum
export const PRESTIGE_THRESHOLD = 1_000_000; // 1 Million points to unlock prestige

export const INITIAL_STATE: GameState = {
  version: 1,
  points: 0,
  totalPointsEarned: 0,
  clicks: 0,
  cooldownRemaining: 0,
  prestigePoints: 0,
  totalPrestigePointsEarned: 0,
  prestigeCount: 0,
  
  upgrades: {
    pointsBonus: 0,
    clicksBonus: 0,
    cooldownReduction: 0,
    multiplierBonus: 0,
  },
  
  prestigeUpgrades: {
    automationUnlocked: false,
    clicksMultiplier: 0,
    pointsMultiplier: 0,
  },
  
  automation: {
    autoclicker: { level: 0, interval: 10, timer: 0, enabled: true },
    autoUpg1: { level: 0, interval: 60, timer: 0, enabled: true },
    autoUpg2: { level: 0, interval: 60, timer: 0, enabled: true },
    autoUpg3: { level: 0, interval: 60, timer: 0, enabled: true },
    autoUpg4: { level: 0, interval: 60, timer: 0, enabled: true },
  },
  
  settings: {
    soundEnabled: true,
    autosaveEnabled: true,
  },
  
  lastTickTime: Date.now(),
  lastSavedAt: Date.now(),
};

// Base upgrade cost formulas
export function getBaseUpgradeCost(
  type: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus',
  level: number,
  quickOverclockLevel: number = 0
): number {
  switch (type) {
    case 'pointsBonus': // +1 point
      return Math.floor(10 * Math.pow(1.15, level));
    case 'clicksBonus': // +0.2 clicks
      return Math.floor(25 * Math.pow(1.18, level));
    case 'cooldownReduction': { // -0.1s cooldown; price growth accelerates below 4.0s
      const startingCooldown = Math.max(MIN_COOLDOWN, INITIAL_COOLDOWN - quickOverclockLevel * 0.4);
      let cost = 65;
      for (let i = 0; i < level; i++) {
        const cooldownBeforePurchase = Math.max(
          MIN_COOLDOWN,
          Math.round((startingCooldown - i * 0.1) * 10) / 10
        );
        const growth = cooldownBeforePurchase > 4.0
          ? 1.28
          : 1.38 + (4.0 - cooldownBeforePurchase) * 0.1;
        cost *= growth;
      }
      return Math.floor(cost);
    }
    case 'multiplierBonus': // +10% to all previous multipliers per level
      return Math.floor(140 * Math.pow(1.22, level));
  }
}

// Maximum possible cooldown upgrades before reaching MIN_COOLDOWN
export function getMaxCooldownUpgrades(quickOverclockLevel: number): number {
  const base = Math.max(MIN_COOLDOWN, INITIAL_COOLDOWN - quickOverclockLevel * 0.4);
  return Math.floor((base - MIN_COOLDOWN) / 0.1);
}

// Current cooldown calculation
export function calculateCooldown(cooldownReductionLevel: number, quickOverclockLevel: number): number {
  const startingCooldown = Math.max(MIN_COOLDOWN, INITIAL_COOLDOWN - quickOverclockLevel * 0.4);
  const total = startingCooldown - cooldownReductionLevel * 0.1;
  return Math.max(MIN_COOLDOWN, Math.round(total * 10) / 10);
}

// Points & Clicks gain calculations
export function calculateClickYield(state: GameState) {
  const basePoints = 1.0 + state.upgrades.pointsBonus * 1.0;
  const baseClicks = (1.0 + state.upgrades.clicksBonus * 0.2) * Math.pow(1.3, state.prestigeUpgrades.clicksMultiplier);

  // Each click adds 0.01x to the click multiplier.
  const clickMultiplier = 1 + (state.clicks * 0.01);
  // Upgrade 4 multiplies all previous point multipliers by 1.1 per level.
  const shopMultiplier = Math.pow(1.1, state.upgrades.multiplierBonus);
  const prestigeMultiplier = Math.pow(1.2, state.prestigeCount) * Math.pow(2, state.prestigeUpgrades.pointsMultiplier);

  const totalMultiplier = clickMultiplier * shopMultiplier * prestigeMultiplier;
  const pointsEarned = basePoints * totalMultiplier;

  return {
    basePoints,
    baseClicks,
    clickMultiplier,
    shopMultiplier,
    prestigeMultiplier,
    totalMultiplier,
    pointsEarned,
  };
}

// Prestige point calculation on reset
export function calculatePrestigePointsReward(points: number): number {
  if (points < PRESTIGE_THRESHOLD) return 0;
  return Math.max(1, Math.floor(Math.sqrt(points / PRESTIGE_THRESHOLD)));
}

// Automation interval curves based on level
export const AUTOCLICKER_INTERVALS = [10, 8, 6, 4, 2, 1]; // level 1..6
export const AUTOUPG_INTERVALS = [60, 45, 30, 15, 5];     // level 1..5

export function getAutoclickerInterval(level: number): number {
  if (level <= 0) return 10;
  const idx = Math.min(level - 1, AUTOCLICKER_INTERVALS.length - 1);
  return AUTOCLICKER_INTERVALS[idx];
}

export function getAutoUpgInterval(level: number): number {
  if (level <= 0) return 60;
  const idx = Math.min(level - 1, AUTOUPG_INTERVALS.length - 1);
  return AUTOUPG_INTERVALS[idx];
}

// PP cost for upgrading automation modules
export function getAutomationModuleUpgradeCost(level: number): number {
  // Level 0 -> 1 costs 1 PP, 1 -> 2 costs 2 PP, 2 -> 3 costs 3 PP, etc.
  return level + 1;
}
