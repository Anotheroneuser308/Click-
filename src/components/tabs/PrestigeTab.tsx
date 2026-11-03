import React, { useState } from 'react';
import { GameState, PrestigeUpgrades, BulkBuyMode } from '../../types/game';
import {
  PRESTIGE_THRESHOLD,
  calculatePrestigePointsReward,
  getBoosterDecayRate,
  calculatePrestigeUpgradeBulk,
  getPrestigeUpgradeSingleCost,
  getPrestigeUpgradeMaxLevel,
} from '../../constants/gameBalance';
import { formatNumber, formatInt } from '../../utils/format';
import { soundEngine } from '../../utils/audio';
import {
  Lock,
  Sparkles,
  Cpu,
  Check,
  AlertTriangle,
  MousePointerClick,
  Zap,
  Flame,
  Shield,
  Radio,
  Timer,
  Layers,
} from 'lucide-react';

interface PrestigeTabProps {
  state: GameState;
  onPrestige: () => void;
  onBuyPrestigeUpgrade: (type: keyof PrestigeUpgrades, cost: number, count?: number) => void;
}

const BULK_MODES: BulkBuyMode[] = [1, 5, 10, 25, 100, 'max'];

export const PrestigeTab: React.FC<PrestigeTabProps> = ({
  state,
  onPrestige,
  onBuyPrestigeUpgrade,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bulkMode, setBulkMode] = useState<BulkBuyMode>(1);

  const isUnlocked = state.points >= PRESTIGE_THRESHOLD || state.prestigeCount > 0;
  const progressRatio = Math.min(1, state.points / PRESTIGE_THRESHOLD);
  const potentialPP = calculatePrestigePointsReward(state.points);

  const isShopVisible =
    state.prestigeShopUnlocked ||
    state.prestigePoints >= 1 ||
    state.totalPrestigePointsEarned >= 1 ||
    state.prestigeCount > 0;


  const handlePrestigeClick = () => {
    if (potentialPP <= 0) return;
    setShowConfirmModal(true);
  };

  const confirmPrestige = () => {
    soundEngine.playPrestige();
    setShowConfirmModal(false);
    onPrestige();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            Квантовый Престиж
            {!isUnlocked && <Lock className="w-4 h-4 text-amber-400" />}
          </h3>
          <p className="text-xs text-slate-400">
            Перезагрузка матрицы в обмен на квантовые Престиж-поинты (PP)
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Баланс PP:</span>
          <span className="font-mono-numbers text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {state.prestigePoints} PP
          </span>
        </div>
      </div>

      {/* Progress or Prestige Action Card */}
      {!isUnlocked ? (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Престиж заблокирован
              </h4>
              <p className="text-xs text-slate-400">
                Требуется накопить {formatInt(PRESTIGE_THRESHOLD)} текущих поинтов для доступа
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono-numbers">
              <span className="text-slate-400">
                {formatNumber(state.points)} / {formatNumber(PRESTIGE_THRESHOLD)} P
              </span>
              <span className="text-amber-400 font-bold">
                {(progressRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 neon-glow-amber flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Готово к квантовому сбросу
              </span>
              <h4 className="text-base font-extrabold text-white mt-0.5">
                Награда: +{potentialPP} PP
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Сбросит поинты, клики и базовые улучшения, усилив постоянные параметры
              </p>
            </div>
            <button
              onClick={handlePrestigeClick}
              disabled={potentialPP <= 0}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                potentialPP > 0
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Престижнуться
            </button>
          </div>
        </div>
      )}

      {/* Prestige Upgrades Shop */}
      {isShopVisible ? (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Квантовые улучшения (за PP)
            </h4>
            <span className="text-[10px] text-amber-400 font-medium">
              Постоянные бонусы
            </span>
          </div>

          {/* Bulk Buy Toggle Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold px-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Режим покупки PP:</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800/80">
              {BULK_MODES.map((mode) => {
                const isActive = bulkMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setBulkMode(mode)}
                    className={`px-2.5 py-1 text-xs font-mono-numbers font-bold rounded-md transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.4)] scale-105'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {mode === 'max' ? 'MAX' : `${mode}x`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* 1. Unlock Automation (One-time) */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-100">
                      Модуль автоматики
                    </h5>
                    {state.prestigeUpgrades.automationUnlocked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Активен
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Разблокирует вкладку «Автоматика» с автокликером и 4 автопокупщиками
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (state.prestigePoints >= 1 && !state.prestigeUpgrades.automationUnlocked) {
                    soundEngine.playBuy();
                    onBuyPrestigeUpgrade('automationUnlocked', 1, 1);
                  }
                }}
                disabled={state.prestigeUpgrades.automationUnlocked || state.prestigePoints < 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                  state.prestigeUpgrades.automationUnlocked
                    ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : state.prestigePoints >= 1
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {state.prestigeUpgrades.automationUnlocked ? 'Куплено' : '1 PP'}
              </button>
            </div>

            {/* 2. Point Enhancement (x2 points) */}
            {(() => {
              const bulk = calculatePrestigeUpgradeBulk(
                'pointsMultiplier',
                state.prestigeUpgrades.pointsMultiplier || 0,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost(
                'pointsMultiplier',
                state.prestigeUpgrades.pointsMultiplier || 0
              );
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Point Enhancement</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {state.prestigeUpgrades.pointsMultiplier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Увеличивает получаемые поинты на +25% за каждый уровень
                      </p>
                      <p className="text-[11px] text-cyan-300 font-mono-numbers mt-0.5">
                        Текущий бонус: +{(state.prestigeUpgrades.pointsMultiplier * 25)}% (×{(1 + state.prestigeUpgrades.pointsMultiplier * 0.25).toFixed(2)})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('pointsMultiplier', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}

            {/* 3. Click Enhancement (+15% clicks) */}
            {(() => {
              const bulk = calculatePrestigeUpgradeBulk(
                'clicksMultiplier',
                state.prestigeUpgrades.clicksMultiplier || 0,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost(
                'clicksMultiplier',
                state.prestigeUpgrades.clicksMultiplier || 0
              );
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Click Enhancement</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {state.prestigeUpgrades.clicksMultiplier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Увеличивает получаемые клики на +15% за каждый уровень
                      </p>
                      <p className="text-[11px] text-purple-300 font-mono-numbers mt-0.5">
                        Текущий бонус: +{(state.prestigeUpgrades.clicksMultiplier * 15)}% (×{(1 + state.prestigeUpgrades.clicksMultiplier * 0.15).toFixed(2)})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('clicksMultiplier', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}

            {/* 4. Quantum Crit (max 10) */}
            {(() => {
              const currentLvl = state.prestigeUpgrades.quantumCrit || 0;
              const isMax = currentLvl >= 10;
              const bulk = calculatePrestigeUpgradeBulk(
                'quantumCrit',
                currentLvl,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost('quantumCrit', currentLvl);
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = !isMax && bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Квантовый крит</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {currentLvl}/10
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        +5% шанс критического импульса ядра (×5 к поинтам и кликам за клик)
                      </p>
                      <p className="text-[11px] text-amber-300 font-mono-numbers mt-0.5">
                        Шанс крита: {(currentLvl * 5)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('quantumCrit', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isMax
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax
                      ? 'МАКС'
                      : bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}

            {/* 5. Booster Superconductor (max 4) */}
            {(() => {
              const currentLvl = state.prestigeUpgrades.boosterSuperconductor || 0;
              const isMax = currentLvl >= 4;
              const bulk = calculatePrestigeUpgradeBulk(
                'boosterSuperconductor',
                currentLvl,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost('boosterSuperconductor', currentLvl);
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = !isMax && bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Сверхпроводник бустера</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {currentLvl}/4
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Замедляет утечку заряда бустера на 20% за каждый уровень
                      </p>
                      <p className="text-[11px] text-cyan-300 font-mono-numbers mt-0.5">
                        Скорость спада: {getBoosterDecayRate(currentLvl).toFixed(2)} зар/сек
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('boosterSuperconductor', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isMax
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax
                      ? 'МАКС'
                      : bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}

            {/* 6. Booster Resonance (replaces passive reactor) */}
            {(() => {
              const currentLvl = state.prestigeUpgrades.boosterResonance || 0;
              const isMax = currentLvl >= 25;
              const bulk = calculatePrestigeUpgradeBulk(
                'boosterResonance',
                currentLvl,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost('boosterResonance', currentLvl);
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = !isMax && bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Резонатор бустера</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {currentLvl}/25
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Усиливает отдачу накопителя бустера: +0.002x к множителю поинтов за единицу заряда
                      </p>
                      <p className="text-[11px] text-amber-300 font-mono-numbers mt-0.5">
                        Бонус к эффекту бустера: +{(currentLvl * 0.2).toFixed(1)}% за каждое нажатие
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('boosterResonance', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isMax
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax
                      ? 'МАКС'
                      : bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}

            {/* 7. Cooldown Overdrive (max 3) */}
            {(() => {
              const currentLvl = state.prestigeUpgrades.cooldownOverdrive || 0;
              const isMax = currentLvl >= 3;
              const bulk = calculatePrestigeUpgradeBulk(
                'cooldownOverdrive',
                currentLvl,
                bulkMode,
                state.prestigePoints
              );
              const singleCost = getPrestigeUpgradeSingleCost('cooldownOverdrive', currentLvl);
              const displayCost = (bulkMode === 'max' && bulk.count === 0) ? singleCost : bulk.totalCost;
              const canBuy = !isMax && bulk.canAfford && bulk.count > 0;

              return (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
                      <Timer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-100">Овердрайв кулдауна</h5>
                        <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          ур. {currentLvl}/3
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Снижает минимальный предел кулдауна ядра (-0.1с) и стартовое время (-0.2с)
                      </p>
                      <p className="text-[11px] text-blue-300 font-mono-numbers mt-0.5">
                        Мин. лимит: {Math.max(0.2, 0.5 - currentLvl * 0.1).toFixed(1)}с
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (canBuy) {
                        soundEngine.playBuy();
                        onBuyPrestigeUpgrade('cooldownOverdrive', bulk.totalCost, bulk.count);
                      }
                    }}
                    disabled={!canBuy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      isMax
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.4)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isMax
                      ? 'МАКС'
                      : bulkMode === 'max'
                      ? (bulk.count > 0 ? `+${bulk.count} (${displayCost} PP)` : 'Не хватает')
                      : canBuy
                      ? `+${bulk.count} (${displayCost} PP)`
                      : `+${bulk.count} (${displayCost} PP)`}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/70 text-center">
          <p className="text-sm font-bold text-slate-200">
            Сначала получите 1 Prestige Point
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Престижные улучшения станут доступны при получении хотя бы 1 PP (накопите 1 млн поинтов и совершите престиж).
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full p-5 rounded-2xl bg-slate-900 border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">
                Подтверждение квантового престижа
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Вы собираетесь активировать Престиж. Ваши текущие поинты, клики и базовые улучшения сбросятся. Взамен вы получите:
            </p>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300">Будет начислено:</span>
              <span className="font-mono-numbers text-base font-bold text-amber-400">
                +{potentialPP} Prestige Points
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={confirmPrestige}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)] cursor-pointer"
              >
                Подтвердить сброс
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
