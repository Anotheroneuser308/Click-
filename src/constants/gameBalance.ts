import { GameState, BulkBuyMode, PrestigeUpgrades } from '../types/game';

export const INITIAL_COOLDOWN = 5.0; // 5 seconds
export const MIN_COOLDOWN = 0.5;     // 0.5s minimum base floor
export const PRESTIGE_THRESHOLD = 1_000_000; // 1 Million points to unlock prestige

export const INITIAL_STATE: GameState = {
  version: 2,
  points: 0,
  totalPointsEarned: 0,
  clicks: 0,
  chargeLevel: 0,
  cooldownRemaining: 0,
  prestigePoints: 0,
  totalPrestigePointsEarned: 0,
  prestigeCount: 0,
  prestigeShopUnlocked: false,
  
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
    quantumCrit: 0,
    boosterSuperconductor: 0,
    boosterResonance: 0,
    cooldownOverdrive: 0,
  },

  levelState: {
    level: 1,
    xp: 0,
    maxXp: 100,
    levelPoints: 0,
    totalXpEarned: 0,
    perks: {
      clickMastery: 0,
      boosterCapacity: 0,
      fastRecharge: 0,
      superClicks: 0,
      critPower: 0,
      boosterStep: 0,
    },
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

// Bulk purchase calculation for base upgrades
export function calculateBaseUpgradeBulk(
  type: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus',
  currentLevel: number,
  bulkMode: BulkBuyMode,
  availablePoints: number,
  maxLevel: number = Infinity,
  quickOverclockLevel: number = 0
): { count: number; totalCost: number; canAfford: boolean } {
  if (currentLevel >= maxLevel) {
    return { count: 0, totalCost: 0, canAfford: false };
  }

  if (bulkMode === 'max') {
    let count = 0;
    let totalCost = 0;
    let remaining = availablePoints;

    while (currentLevel + count < maxLevel) {
      const nextCost = getBaseUpgradeCost(type, currentLevel + count, quickOverclockLevel);
      if (remaining < nextCost) break;
      remaining -= nextCost;
      totalCost += nextCost;
      count += 1;
    }

    return {
      count,
      totalCost,
      canAfford: count > 0,
    };
  }

  const targetCount = Math.min(bulkMode, maxLevel - currentLevel);
  if (targetCount <= 0) {
    return { count: 0, totalCost: 0, canAfford: false };
  }

  let totalCost = 0;
  for (let i = 0; i < targetCount; i++) {
    totalCost += getBaseUpgradeCost(type, currentLevel + i, quickOverclockLevel);
  }

  return {
    count: targetCount,
    totalCost,
    canAfford: availablePoints >= totalCost,
  };
}

// Bulk purchase calculation for Prestige upgrades
export function getPrestigeUpgradeSingleCost(type: keyof PrestigeUpgrades, level: number): number {
  switch (type) {
    case 'automationUnlocked': return 1;
    case 'pointsMultiplier': return 1 + level * 2;
    case 'clicksMultiplier': return 2 + level * 2;
    case 'quantumCrit': return 2 + level * 2;
    case 'boosterSuperconductor': return 3 + level * 3;
    case 'boosterResonance': return 2 + level * 2;
    case 'cooldownOverdrive': return 4 + level * 4;
    default: return 1;
  }
}

export function getPrestigeUpgradeMaxLevel(type: keyof PrestigeUpgrades): number {
  switch (type) {
    case 'automationUnlocked': return 1;
    case 'quantumCrit': return 10;
    case 'boosterSuperconductor': return 4;
    case 'boosterResonance': return 25;
    case 'cooldownOverdrive': return 3;
    default: return Infinity;
  }
}

export function calculatePrestigeUpgradeBulk(
  type: keyof PrestigeUpgrades,
  currentLevel: number,
  bulkMode: BulkBuyMode,
  availablePP: number
): { count: number; totalCost: number; canAfford: boolean } {
  const maxLevel = getPrestigeUpgradeMaxLevel(type);
  if (currentLevel >= maxLevel) {
    return { count: 0, totalCost: 0, canAfford: false };
  }

  if (type === 'automationUnlocked') {
    return { count: 1, totalCost: 1, canAfford: availablePP >= 1 };
  }

  if (bulkMode === 'max') {
    let count = 0;
    let totalCost = 0;
    let remaining = availablePP;

    while (currentLevel + count < maxLevel) {
      const nextCost = getPrestigeUpgradeSingleCost(type, currentLevel + count);
      if (remaining < nextCost) break;
      remaining -= nextCost;
      totalCost += nextCost;
      count += 1;
    }

    return {
      count,
      totalCost,
      canAfford: count > 0,
    };
  }

  const targetCount = Math.min(bulkMode, maxLevel - currentLevel);
  if (targetCount <= 0) {
    return { count: 0, totalCost: 0, canAfford: false };
  }

  let totalCost = 0;
  for (let i = 0; i < targetCount; i++) {
    totalCost += getPrestigeUpgradeSingleCost(type, currentLevel + i);
  }

  return {
    count: targetCount,
    totalCost,
    canAfford: availablePP >= totalCost,
  };
}

// Bulk purchase calculation for Level Perks (cost is 1 LP each)
export function calculateLevelPerkBulk(
  currentLevel: number,
  bulkMode: BulkBuyMode,
  availableLP: number,
  maxLevel: number = Infinity
): { count: number; totalCost: number; canAfford: boolean } {
  if (currentLevel >= maxLevel) {
    return { count: 0, totalCost: 0, canAfford: false };
  }

  if (bulkMode === 'max') {
    const affordable = Math.min(availableLP, maxLevel - currentLevel);
    return {
      count: affordable,
      totalCost: affordable,
      canAfford: affordable > 0,
    };
  }

  const targetCount = Math.min(bulkMode, maxLevel - currentLevel);
  return {
    count: targetCount,
    totalCost: targetCount,
    canAfford: availableLP >= targetCount,
  };
}

// Maximum possible cooldown upgrades before reaching min cooldown
export function getMaxCooldownUpgrades(overdriveLevel: number = 0): number {
  const minFloor = Math.max(0.2, MIN_COOLDOWN - overdriveLevel * 0.1);
  const startingCooldown = Math.max(minFloor, INITIAL_COOLDOWN - overdriveLevel * 0.2);
  return Math.floor((startingCooldown - minFloor) / 0.1);
}

// Current cooldown calculation with Overdrive and Fast Recharge perk
export function calculateCooldown(
  cooldownReductionLevel: number,
  overdriveLevel: number = 0,
  fastRechargeLevel: number = 0
): number {
  const minFloor = Math.max(0.2, MIN_COOLDOWN - overdriveLevel * 0.1);
  const startingCooldown = Math.max(minFloor, INITIAL_COOLDOWN - overdriveLevel * 0.2);
  const reduction = cooldownReductionLevel * 0.1 + fastRechargeLevel * 0.05;
  const total = startingCooldown - reduction;
  return Math.max(minFloor, Math.round(total * 100) / 100);
}

// Level XP scaling formula: XP needed to complete current level
export function getXpForLevel(lvl: number): number {
  return Math.floor(100 * Math.pow(1.25, lvl - 1));
}

// Maximum booster capacity (100 base + 25 per perk level)
export function getMaxBoosterCapacity(boosterCapacityLevel: number = 0): number {
  return 100 + boosterCapacityLevel * 25;
}

// Booster decay rate (0.4/s base, reduced by 20% per superconductor level down to min 0.08/s)
export function getBoosterDecayRate(superconductorLevel: number = 0): number {
  return Math.max(0.08, 0.4 * Math.pow(0.8, superconductorLevel));
}

// Points & Clicks gain calculations
export function calculateClickYield(state: GameState) {
  const charge = state.chargeLevel || 0;
  // User: "за каждое нажатие получаемые поинты умножаются на 0.01х, а получаемые клики в 0.005х"
  // Резонатор бустера добавляет +0.002x к множителю поинтов за единицу заряда
  const resonanceBonus = (state.prestigeUpgrades?.boosterResonance || 0) * 0.002;
  const chargePointsMult = 1 + (charge * (0.01 + resonanceBonus));
  const chargeClicksMult = 1 + (charge * 0.005);

  const clickMasteryBonus = 1 + (state.levelState?.perks.clickMastery || 0) * 0.15;
  const superClicksBonus = 1 + (state.levelState?.perks.superClicks || 0) * 0.20;

  const basePoints = (1.0 + state.upgrades.pointsBonus * 1.0) * clickMasteryBonus;
  // Сбалансированный множитель кликов: +15% за уровень улучшения престижа
  const prestigeClicksBonus = 1 + (state.prestigeUpgrades?.clicksMultiplier || 0) * 0.15;
  const baseClicks = (1.0 + state.upgrades.clicksBonus * 0.2) *
    prestigeClicksBonus *
    superClicksBonus *
    chargeClicksMult;

  // Each click adds 0.01x to the click multiplier.
  const clickMultiplier = 1 + (state.clicks * 0.01);
  // Upgrade 4 multiplies all previous point multipliers by 1.1 per level.
  const shopMultiplier = Math.pow(1.1, state.upgrades.multiplierBonus);

  // Сбалансированный множитель престижа (устранение гиперинфляции):
  // +25% за уровень престиж-улучшения вместо удвоения (2^x)
  // и контролируемый мягкий бонус 1.15^prestigeCount от сбросов
  const prestigePointsBonus = 1 + (state.prestigeUpgrades?.pointsMultiplier || 0) * 0.25;
  const prestigeCountMult = Math.pow(1.15, state.prestigeCount);
  const prestigeMultiplier = prestigeCountMult * prestigePointsBonus;

  const totalMultiplier = clickMultiplier * shopMultiplier * prestigeMultiplier * chargePointsMult;
  const pointsEarned = basePoints * totalMultiplier;

  // Critical pulse chance (5% per level of quantumCrit, max 50%)
  const critChance = Math.min(0.5, (state.prestigeUpgrades?.quantumCrit || 0) * 0.05);
  // Critical pulse multiplier: base 5x + 0.5x per critPower perk level
  const critMultiplier = 5 + (state.levelState?.perks?.critPower || 0) * 0.5;

  return {
    basePoints,
    baseClicks,
    clickMultiplier,
    shopMultiplier,
    prestigeMultiplier,
    chargePointsMult,
    chargeClicksMult,
    totalMultiplier,
    pointsEarned,
    critChance,
    critMultiplier,
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
