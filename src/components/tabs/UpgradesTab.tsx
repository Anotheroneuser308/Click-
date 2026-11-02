import React from 'react';
import { GameState } from '../../types/game';
import { getBaseUpgradeCost, calculateCooldown, getMaxCooldownUpgrades } from '../../constants/gameBalance';
import { formatNumber } from '../../utils/format';
import { soundEngine } from '../../utils/audio';
import { Zap, MousePointerClick, Timer, TrendingUp } from 'lucide-react';

interface UpgradesTabProps {
  state: GameState;
  onBuyUpgrade: (type: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus') => void;
}

export const UpgradesTab: React.FC<UpgradesTabProps> = ({ state, onBuyUpgrade }) => {
  const currentCooldown = calculateCooldown(
    state.upgrades.cooldownReduction,
    0
  );
  const maxCooldownLevel = getMaxCooldownUpgrades(0);
  const isCooldownMaxed = state.upgrades.cooldownReduction >= maxCooldownLevel;

  const upgradesList = [
    {
      id: 'pointsBonus' as const,
      title: '+1 к поинтам',
      desc: 'Увеличивает базовое количество поинтов за каждый клик по ядру',
      icon: Zap,
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20 hover:border-cyan-500/50',
      level: state.upgrades.pointsBonus,
      currentStat: `+${state.upgrades.pointsBonus} P за клик`,
      cost: getBaseUpgradeCost('pointsBonus', state.upgrades.pointsBonus),
      isMax: false,
    },
    {
      id: 'clicksBonus' as const,
      title: '+0.2 к кликам',
      desc: 'Увеличивает количество кликов, ускоряя прирост множителя (+0.01x за клик)',
      icon: MousePointerClick,
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/50',
      level: state.upgrades.clicksBonus,
      currentStat: `+${(1 + state.upgrades.clicksBonus * 0.2).toFixed(1)} клик/нажатие`,
      cost: getBaseUpgradeCost('clicksBonus', state.upgrades.clicksBonus),
      isMax: false,
    },
    {
      id: 'cooldownReduction' as const,
      title: '-0.1с к кулдауну',
      desc: 'Снижает время перезарядки ядра для более быстрых нажатий',
      icon: Timer,
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      level: state.upgrades.cooldownReduction,
      currentStat: `${currentCooldown.toFixed(1)} сек кулдаун`,
      cost: getBaseUpgradeCost('cooldownReduction', state.upgrades.cooldownReduction, 0),
      isMax: isCooldownMaxed,
    },
    {
      id: 'multiplierBonus' as const,
      title: '×1.1 к множителям',
      desc: 'Умножает все предыдущие множители получения поинтов на ×1.1 за уровень',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/50',
      level: state.upgrades.multiplierBonus,
      currentStat: `×${Math.pow(1.1, state.upgrades.multiplierBonus).toFixed(2)} ко всем предыдущим множителям`,
      cost: getBaseUpgradeCost('multiplierBonus', state.upgrades.multiplierBonus),
      isMax: false,
    },
  ];

  const handleBuy = (id: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus', cost: number, isMax: boolean) => {
    if (isMax || state.points < cost) return;
    soundEngine.playBuy();
    onBuyUpgrade(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Модули улучшений
          </h3>
          <p className="text-xs text-slate-400">
            Инвестируйте поинты в модернизацию ядра
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Баланс:</span>
          <span className="font-mono-numbers text-sm font-bold text-cyan-400">
            {formatNumber(state.points)} P
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {upgradesList.map((upg) => {
          const Icon = upg.icon;
          const canAfford = state.points >= upg.cost && !upg.isMax;

          return (
            <div
              key={upg.id}
              className={`p-3.5 rounded-xl bg-slate-900/60 border ${upg.borderColor} transition-all duration-200 flex flex-col justify-between gap-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${upg.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">
                        {upg.title}
                      </h4>
                      <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        ур. {upg.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {upg.desc}
                    </p>
                    <div className="mt-1 text-xs font-mono-numbers text-cyan-300/90 font-medium">
                      Эффект: {upg.currentStat}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-xs">
                  {upg.isMax ? (
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                      Максимальный уровень
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Стоимость:</span>
                      <span className={`font-mono-numbers font-bold ${canAfford ? 'text-white' : 'text-slate-400'}`}>
                        {formatNumber(upg.cost)} P
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBuy(upg.id, upg.cost, upg.isMax)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                    upg.isMax
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.35)] cursor-pointer active:scale-95'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/50 cursor-not-allowed'
                  }`}
                >
                  {upg.isMax ? 'МАКС' : 'Улучшить'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
