/** 
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, ActiveTab, ClickEffect } from './types/game';
import {
  INITIAL_STATE,
  getBaseUpgradeCost,
  calculateCooldown,
  calculateClickYield,
  calculatePrestigePointsReward,
  getAutoclickerInterval,
  getAutoUpgInterval,
  getMaxCooldownUpgrades,
} from './constants/gameBalance';
import { soundEngine } from './utils/audio';
import { TopStatusBar } from './components/TopStatusBar';
import { CyberCore } from './components/CyberCore';
import { RightDrawer } from './components/RightDrawer';
import { ParticleCanvas } from './components/ParticleCanvas';

const SAVE_KEY = 'cyber_clicker_save_v1';

export default function App() {
  // Initialize state from LocalStorage or default
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.points === 'number') {
          return {
            ...INITIAL_STATE,
            ...parsed,
            settings: { ...INITIAL_STATE.settings, ...parsed.settings },
            upgrades: { ...INITIAL_STATE.upgrades, ...parsed.upgrades },
            prestigeUpgrades: { ...INITIAL_STATE.prestigeUpgrades, ...parsed.prestigeUpgrades },
            automation: {
              autoclicker: { ...INITIAL_STATE.automation.autoclicker, ...(parsed.automation?.autoclicker || {}) },
              autoUpg1: { ...INITIAL_STATE.automation.autoUpg1, ...(parsed.automation?.autoUpg1 || {}) },
              autoUpg2: { ...INITIAL_STATE.automation.autoUpg2, ...(parsed.automation?.autoUpg2 || {}) },
              autoUpg3: { ...INITIAL_STATE.automation.autoUpg3, ...(parsed.automation?.autoUpg3 || {}) },
              autoUpg4: { ...INITIAL_STATE.automation.autoUpg4, ...(parsed.automation?.autoUpg4 || {}) },
            },
            lastTickTime: Date.now(),
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse saved game:', e);
    }
    return INITIAL_STATE;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('upgrades');
  const [floatingEffects, setFloatingEffects] = useState<ClickEffect[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const wasCoolingRef = useRef(false);

  // Sync audio mute setting
  useEffect(() => {
    soundEngine.setMuted(!state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // Current cooldown values
  const maxCooldown = calculateCooldown(
    state.upgrades.cooldownReduction,
    state.prestigeUpgrades.quickOverclock
  );

  const clickYields = calculateClickYield(state);

  // Manual save to localStorage
  const saveToStorage = useCallback((currentState: GameState) => {
    try {
      const toSave = { ...currentState, lastSavedAt: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
      setState((prev) => ({ ...prev, lastSavedAt: toSave.lastSavedAt }));
    } catch (err) {
      console.error('Save failed:', err);
    }
  }, []);

  // Main Click Action on the Core
  const handleCoreClick = useCallback((e?: React.MouseEvent) => {
    const curr = stateRef.current;
    if (curr.cooldownRemaining > 0) return;

    const yieldData = calculateClickYield(curr);
    const newCooldown = calculateCooldown(
      curr.upgrades.cooldownReduction,
      curr.prestigeUpgrades.quickOverclock
    );

    const clientX = e ? e.clientX : window.innerWidth / 2;
    const clientY = e ? e.clientY : window.innerHeight / 2;

    const newEffect: ClickEffect = {
      id: `${Date.now()}_${Math.random()}`,
      x: clientX,
      y: clientY,
      points: yieldData.pointsEarned,
      clicks: yieldData.baseClicks,
    };

    setFloatingEffects((prev) => [...prev.slice(-15), newEffect]);
    setTimeout(() => {
      setFloatingEffects((prev) => prev.filter((eff) => eff.id !== newEffect.id));
    }, 800);

    setState((prev) => ({
      ...prev,
      points: prev.points + yieldData.pointsEarned,
      totalPointsEarned: prev.totalPointsEarned + yieldData.pointsEarned,
      clicks: prev.clicks + yieldData.baseClicks,
      cooldownRemaining: newCooldown,
    }));
  }, []);

  // Main Game Loop (50ms interval) for smooth countdowns and automation
  useEffect(() => {
    const loopInterval = setInterval(() => {
      const now = Date.now();
      const curr = stateRef.current;
      const dt = Math.min(1.0, (now - curr.lastTickTime) / 1000);

      let nextCooldown = curr.cooldownRemaining;
      let cooldownFinished = false;

      if (nextCooldown > 0) {
        nextCooldown = Math.max(0, nextCooldown - dt);
        if (nextCooldown === 0 && wasCoolingRef.current) {
          cooldownFinished = true;
        }
      }
      wasCoolingRef.current = nextCooldown > 0;

      if (cooldownFinished) {
        soundEngine.playReady();
      }

      // Handle Automation if unlocked
      let nextPoints = curr.points;
      let nextTotalEarned = curr.totalPointsEarned;
      let nextClicks = curr.clicks;
      const nextUpgrades = { ...curr.upgrades };
      const nextAuto = {
        autoclicker: { ...curr.automation.autoclicker },
        autoUpg1: { ...curr.automation.autoUpg1 },
        autoUpg2: { ...curr.automation.autoUpg2 },
        autoUpg3: { ...curr.automation.autoUpg3 },
        autoUpg4: { ...curr.automation.autoUpg4 },
      };

      if (curr.prestigeUpgrades.automationUnlocked) {
        // 1. Autoclicker Module
        if (nextAuto.autoclicker.enabled && nextAuto.autoclicker.level > 0) {
          nextAuto.autoclicker.timer += dt;
          if (nextAuto.autoclicker.timer >= nextAuto.autoclicker.interval) {
            if (nextCooldown <= 0) {
              const yieldData = calculateClickYield({
                ...curr,
                points: nextPoints,
                clicks: nextClicks,
                upgrades: nextUpgrades,
              });
              nextPoints += yieldData.pointsEarned;
              nextTotalEarned += yieldData.pointsEarned;
              nextClicks += yieldData.baseClicks;
              nextCooldown = calculateCooldown(
                nextUpgrades.cooldownReduction,
                curr.prestigeUpgrades.quickOverclock
              );
              nextAuto.autoclicker.timer = 0;
            }
          }
        }

        // 2. AutoUpg 1 (+Points)
        if (nextAuto.autoUpg1.enabled && nextAuto.autoUpg1.level > 0) {
          nextAuto.autoUpg1.timer += dt;
          if (nextAuto.autoUpg1.timer >= nextAuto.autoUpg1.interval) {
            const cost = getBaseUpgradeCost('pointsBonus', nextUpgrades.pointsBonus);
            if (nextPoints >= cost) {
              nextPoints -= cost;
              nextUpgrades.pointsBonus += 1;
            }
            nextAuto.autoUpg1.timer = 0;
          }
        }

        // 3. AutoUpg 2 (+Clicks)
        if (nextAuto.autoUpg2.enabled && nextAuto.autoUpg2.level > 0) {
          nextAuto.autoUpg2.timer += dt;
          if (nextAuto.autoUpg2.timer >= nextAuto.autoUpg2.interval) {
            const cost = getBaseUpgradeCost('clicksBonus', nextUpgrades.clicksBonus);
            if (nextPoints >= cost) {
              nextPoints -= cost;
              nextUpgrades.clicksBonus += 1;
            }
            nextAuto.autoUpg2.timer = 0;
          }
        }

        // 4. AutoUpg 3 (-Cooldown)
        if (nextAuto.autoUpg3.enabled && nextAuto.autoUpg3.level > 0) {
          nextAuto.autoUpg3.timer += dt;
          if (nextAuto.autoUpg3.timer >= nextAuto.autoUpg3.interval) {
            const maxLvl = getMaxCooldownUpgrades(curr.prestigeUpgrades.quickOverclock);
            if (nextUpgrades.cooldownReduction < maxLvl) {
              const cost = getBaseUpgradeCost('cooldownReduction', nextUpgrades.cooldownReduction, curr.prestigeUpgrades.quickOverclock);
              if (nextPoints >= cost) {
                nextPoints -= cost;
                nextUpgrades.cooldownReduction += 1;
              }
            }
            nextAuto.autoUpg3.timer = 0;
          }
        }

        // 5. AutoUpg 4 (+Multiplier)
        if (nextAuto.autoUpg4.enabled && nextAuto.autoUpg4.level > 0) {
          nextAuto.autoUpg4.timer += dt;
          if (nextAuto.autoUpg4.timer >= nextAuto.autoUpg4.interval) {
            const cost = getBaseUpgradeCost('multiplierBonus', nextUpgrades.multiplierBonus);
            if (nextPoints >= cost) {
              nextPoints -= cost;
              nextUpgrades.multiplierBonus += 1;
            }
            nextAuto.autoUpg4.timer = 0;
          }
        }
      }

      setState((prev) => ({
        ...prev,
        points: nextPoints,
        totalPointsEarned: nextTotalEarned,
        clicks: nextClicks,
        upgrades: nextUpgrades,
        automation: nextAuto,
        cooldownRemaining: nextCooldown,
        lastTickTime: now,
      }));
    }, 50);

    return () => clearInterval(loopInterval);
  }, []);

  // Autosave interval (every 10 seconds)
  useEffect(() => {
    const autosaveTimer = setInterval(() => {
      const curr = stateRef.current;
      if (curr.settings.autosaveEnabled) {
        saveToStorage(curr);
      }
    }, 10000);

    return () => clearInterval(autosaveTimer);
  }, [saveToStorage]);

  // Upgrade Actions
  const handleBuyUpgrade = (type: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus') => {
    setState((prev) => {
      const cost = type === 'cooldownReduction'
        ? getBaseUpgradeCost(type, prev.upgrades[type], prev.prestigeUpgrades.quickOverclock)
        : getBaseUpgradeCost(type, prev.upgrades[type]);
      if (prev.points < cost) return prev;
      return {
        ...prev,
        points: prev.points - cost,
        upgrades: {
          ...prev.upgrades,
          [type]: prev.upgrades[type] + 1,
        },
      };
    });
  };

  // Prestige Action
  const handlePrestige = () => {
    setState((prev) => {
      const rewardPP = calculatePrestigePointsReward(prev.points);
      if (rewardPP <= 0) return prev;

      return {
        ...prev,
        points: 0,
        clicks: 0,
        cooldownRemaining: 0,
        prestigePoints: prev.prestigePoints + rewardPP,
        totalPrestigePointsEarned: prev.totalPrestigePointsEarned + rewardPP,
        prestigeCount: prev.prestigeCount + 1,
        upgrades: {
          pointsBonus: 0,
          clicksBonus: 0,
          cooldownReduction: 0,
          multiplierBonus: 0,
        },
      };
    });
  };

  // Prestige Upgrade Shop
  const handleBuyPrestigeUpgrade = (
    type: 'automationUnlocked' | 'quantumImpulse' | 'quickOverclock',
    cost: number
  ) => {
    setState((prev) => {
      if (prev.prestigePoints < cost) return prev;

      if (type === 'automationUnlocked') {
        return {
          ...prev,
          prestigePoints: prev.prestigePoints - cost,
          prestigeUpgrades: {
            ...prev.prestigeUpgrades,
            automationUnlocked: true,
          },
        };
      }

      return {
        ...prev,
        prestigePoints: prev.prestigePoints - cost,
        prestigeUpgrades: {
          ...prev.prestigeUpgrades,
          [type]: prev.prestigeUpgrades[type] + 1,
        },
      };
    });
  };

  // Automation Module Toggle
  const handleToggleModule = (
    key: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4'
  ) => {
    setState((prev) => ({
      ...prev,
      automation: {
        ...prev.automation,
        [key]: {
          ...prev.automation[key],
          enabled: !prev.automation[key].enabled,
        },
      },
    }));
  };

  // Automation Module Upgrade / Activation with PP
  const handleUpgradeModule = (
    key: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4',
    cost: number
  ) => {
    setState((prev) => {
      if (prev.prestigePoints < cost) return prev;
      const targetMod = prev.automation[key];
      const nextLevel = targetMod.level + 1;
      const nextInterval =
        key === 'autoclicker'
          ? getAutoclickerInterval(nextLevel)
          : getAutoUpgInterval(nextLevel);

      return {
        ...prev,
        prestigePoints: prev.prestigePoints - cost,
        automation: {
          ...prev.automation,
          [key]: {
            ...targetMod,
            level: nextLevel,
            interval: nextInterval,
            timer: 0,
          },
        },
      };
    });
  };

  // Settings Toggles
  const handleToggleAutosave = () => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, autosaveEnabled: !prev.settings.autosaveEnabled },
    }));
  };

  const handleToggleSound = () => {
    setState((prev) => {
      const nextSound = !prev.settings.soundEnabled;
      soundEngine.setMuted(!nextSound);
      return {
        ...prev,
        settings: { ...prev.settings, soundEnabled: nextSound },
      };
    });
  };

  const handleManualSave = () => {
    saveToStorage(stateRef.current);
  };

  const handleImportSave = (importedState: GameState) => {
    setState(importedState);
    saveToStorage(importedState);
  };

  const handleResetProgress = () => {
    localStorage.removeItem(SAVE_KEY);
    setState(INITIAL_STATE);
  };

  // Check if player can afford any base upgrade
  const canAffordAnyUpgrade =
    state.points >= getBaseUpgradeCost('pointsBonus', state.upgrades.pointsBonus) ||
    state.points >= getBaseUpgradeCost('clicksBonus', state.upgrades.clicksBonus) ||
    (state.upgrades.cooldownReduction < getMaxCooldownUpgrades(state.prestigeUpgrades.quickOverclock) &&
      state.points >= getBaseUpgradeCost('cooldownReduction', state.upgrades.cooldownReduction, state.prestigeUpgrades.quickOverclock)) ||
    state.points >= getBaseUpgradeCost('multiplierBonus', state.upgrades.multiplierBonus);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090e] cyber-grid flex flex-col select-none">
      {/* Background Ambience */}
      <ParticleCanvas />

      {/* Top HUD Status Bar */}
      <TopStatusBar
        state={state}
        onToggleSound={handleToggleSound}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        isDrawerOpen={isDrawerOpen}
        canAffordAnyUpgrade={canAffordAnyUpgrade}
      />

      {/* Main Playfield with Central Cooldown Core */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-4 z-10">
        <CyberCore
          cooldownRemaining={state.cooldownRemaining}
          maxCooldown={maxCooldown}
          pointsYield={clickYields.pointsEarned}
          clicksYield={clickYields.baseClicks}
          onClick={handleCoreClick}
          floatingEffects={floatingEffects}
        />

        {/* Live Multiplier Formula Card */}
        <div className="mt-8 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center max-w-sm">
          <div className="text-[11px] text-slate-400">
            Формула доходности клика:
          </div>
          <div className="font-mono-numbers text-xs text-slate-300 mt-0.5">
            <span className="text-cyan-400 font-semibold">{clickYields.basePoints.toFixed(0)} P</span>
            {' × '}
            <span className="text-purple-400 font-semibold">{clickYields.clickMultiplier.toFixed(2)}x</span>
            {' × '}
            <span className="text-emerald-400 font-semibold">{Math.pow(1.1, state.upgrades.multiplierBonus).toFixed(2)}x</span>
            {' × '}
            <span className="text-amber-400 font-semibold">{clickYields.prestigeMultiplier.toFixed(2)}x</span>
            {' = '}
            <strong className="text-cyan-300 font-bold">{clickYields.pointsEarned.toFixed(1)} P</strong>
          </div>
        </div>
      </main>

      {/* Right Expandable Management Drawer */}
      <RightDrawer
        isOpen={isDrawerOpen}
        onToggle={() => setIsDrawerOpen((prev) => !prev)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        state={state}
        onBuyUpgrade={handleBuyUpgrade}
        onPrestige={handlePrestige}
        onBuyPrestigeUpgrade={handleBuyPrestigeUpgrade}
        onToggleModule={handleToggleModule}
        onUpgradeModule={handleUpgradeModule}
        onManualSave={handleManualSave}
        onToggleAutosave={handleToggleAutosave}
        onToggleSound={handleToggleSound}
        onImportSave={handleImportSave}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
