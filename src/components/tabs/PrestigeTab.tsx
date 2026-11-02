import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { PRESTIGE_THRESHOLD, calculatePrestigePointsReward } from '../../constants/gameBalance';
import { formatNumber, formatInt } from '../../utils/format';
import { soundEngine } from '../../utils/audio';
import { Lock, Sparkles, Cpu, Check, AlertTriangle, MousePointerClick, Zap } from 'lucide-react';

interface PrestigeTabProps {
  state: GameState;
  onPrestige: () => void;
  onBuyPrestigeUpgrade: (type: 'automationUnlocked' | 'clicksMultiplier' | 'pointsMultiplier', cost: number) => void;
}

export const PrestigeTab: React.FC<PrestigeTabProps> = ({
  state,
  onPrestige,
  onBuyPrestigeUpgrade,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const isUnlocked = state.points >= PRESTIGE_THRESHOLD || state.prestigeCount > 0;
  const progressRatio = Math.min(1, state.points / PRESTIGE_THRESHOLD);
  const potentialPP = calculatePrestigePointsReward(state.points);

  const isShopVisible =
    state.prestigeShopUnlocked ||
    state.prestigePoints >= 1 ||
    state.totalPrestigePointsEarned >= 1 ||
    state.prestigeCount > 0;

  const clicksMultiplierCost = 2 + state.prestigeUpgrades.clicksMultiplier * 2;
  const pointsMultiplierCost = 1 + state.prestigeUpgrades.pointsMultiplier * 2;

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
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Квантовые улучшения (за PP)
        </h4>

        {/* Upgrade 1: Unlock Automation */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-slate-100">
                  Модуль автоматики
                </h5>
                {state.prestigeUpgrades.automationUnlocked && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Активен
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Разблокирует вкладку «Автоматика» с автокликером и 4 автопокупщиками
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (state.prestigePoints >= 1 && !state.prestigeUpgrades.automationUnlocked) {
                soundEngine.playBuy();
                onBuyPrestigeUpgrade('automationUnlocked', 1);
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

        {/* Repeatable Click Multiplier */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-slate-100">Click Enhancement</h5>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ур. {state.prestigeUpgrades.clicksMultiplier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Умножает получаемые клики на ×1.3 за уровень
              </p>
              <p className="text-xs text-cyan-300 mt-1">
                Текущий бонус: ×{Math.pow(1.3, state.prestigeUpgrades.clicksMultiplier).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (state.prestigePoints >= clicksMultiplierCost) {
                soundEngine.playBuy();
                onBuyPrestigeUpgrade('clicksMultiplier', clicksMultiplierCost);
              }
            }}
            disabled={state.prestigePoints < clicksMultiplierCost}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${state.prestigePoints >= clicksMultiplierCost ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            {clicksMultiplierCost} PP
          </button>
        </div>

        {/* Repeatable Point Multiplier */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-slate-100">Point Enhancement</h5>
                <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ур. {state.prestigeUpgrades.pointsMultiplier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Умножает получаемые поинты на ×2 за уровень
              </p>
              <p className="text-xs text-cyan-300 mt-1">
                Текущий бонус: ×{Math.pow(2, state.prestigeUpgrades.pointsMultiplier).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (state.prestigePoints >= pointsMultiplierCost) {
                soundEngine.playBuy();
                onBuyPrestigeUpgrade('pointsMultiplier', pointsMultiplierCost);
              }
            }}
            disabled={state.prestigePoints < pointsMultiplierCost}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${state.prestigePoints >= pointsMultiplierCost ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
          >
            {pointsMultiplierCost} PP
          </button>
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
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmPrestige}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)]"
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
