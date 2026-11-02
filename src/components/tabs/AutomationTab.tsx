import React from 'react';
import { GameState } from '../../types/game';
import {
  getAutomationModuleUpgradeCost,
  AUTOCLICKER_INTERVALS,
  AUTOUPG_INTERVALS,
} from '../../constants/gameBalance';
import { soundEngine } from '../../utils/audio';
import {
  Lock,
  Cpu,
  Power,
  Zap,
  MousePointerClick,
  Timer,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface AutomationTabProps {
  state: GameState;
  onToggleModule: (moduleKey: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4') => void;
  onUpgradeModule: (moduleKey: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4', cost: number) => void;
}

export const AutomationTab: React.FC<AutomationTabProps> = ({
  state,
  onToggleModule,
  onUpgradeModule,
}) => {
  const isUnlocked = state.prestigeUpgrades.automationUnlocked;

  const modules = [
    {
      key: 'autoclicker' as const,
      title: 'Autoclicker (Автокликер ядра)',
      desc: 'Автоматически активирует квантовое ядро по завершении цикла',
      icon: Cpu,
      iconColor: 'text-cyan-400',
      data: state.automation.autoclicker,
      maxLevel: AUTOCLICKER_INTERVALS.length,
    },
    {
      key: 'autoUpg1' as const,
      title: 'AutoUpg 1 (+1 к поинтам)',
      desc: 'Автоматически покупает улучшение «+1 к поинтам», если хватает средств',
      icon: Zap,
      iconColor: 'text-cyan-400',
      data: state.automation.autoUpg1,
      maxLevel: AUTOUPG_INTERVALS.length,
    },
    {
      key: 'autoUpg2' as const,
      title: 'AutoUpg 2 (+0.2 к кликам)',
      desc: 'Автоматически покупает улучшение «+0.2 к кликам»',
      icon: MousePointerClick,
      iconColor: 'text-purple-400',
      data: state.automation.autoUpg2,
      maxLevel: AUTOUPG_INTERVALS.length,
    },
    {
      key: 'autoUpg3' as const,
      title: 'AutoUpg 3 (-0.1с к кулдауну)',
      desc: 'Автоматически покупает улучшение «-0.1с к кулдауну»',
      icon: Timer,
      iconColor: 'text-blue-400',
      data: state.automation.autoUpg3,
      maxLevel: AUTOUPG_INTERVALS.length,
    },
    {
      key: 'autoUpg4' as const,
      title: 'AutoUpg 4 (+0.1x к множителю)',
      desc: 'Автоматически покупает улучшение «+0.1x к множителю»',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      data: state.automation.autoUpg4,
      maxLevel: AUTOUPG_INTERVALS.length,
    },
  ];

  if (!isUnlocked) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 my-8">
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-base font-bold text-white">
            Модуль автоматики заблокирован
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Для разблокировки автоматики приобретите улучшение «Модуль автоматики» во вкладке «Престиж» за 1 PP.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
            Автоматика и Дроны
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/40">
              5 Модулей
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Настраиваемые таймеры автоклика и автопокупки улучшений за PP
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

      {/* Modules List */}
      <div className="grid grid-cols-1 gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isPurchased = mod.data.level > 0;
          const cost = getAutomationModuleUpgradeCost(mod.data.level);
          const isMax = mod.data.level >= mod.maxLevel;
          const canAfford = state.prestigePoints >= cost && !isMax;

          const progressPercent = isPurchased
            ? Math.min(100, Math.max(0, (mod.data.timer / mod.data.interval) * 100))
            : 0;
          const remainingSec = Math.max(0, mod.data.interval - mod.data.timer);

          return (
            <div
              key={mod.key}
              className={`p-3.5 rounded-xl bg-slate-900/70 border transition-all duration-200 ${
                isPurchased
                  ? mod.data.enabled
                    ? 'border-cyan-500/30'
                    : 'border-slate-800 opacity-60'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${mod.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">
                        {mod.title}
                      </h4>
                      <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {isPurchased ? `ур. ${mod.data.level}` : 'Не куплено'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {mod.desc}
                    </p>

                    {isPurchased && (
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="text-slate-400">
                          Цикл: <strong className="text-cyan-300 font-mono-numbers">{mod.data.interval}с</strong>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">
                          До срабатывания: <strong className="text-white font-mono-numbers">{remainingSec.toFixed(1)}с</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isPurchased && (
                  <button
                    onClick={() => onToggleModule(mod.key)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      mod.data.enabled
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                    }`}
                    title={mod.data.enabled ? 'Отключить модуль' : 'Включить модуль'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Real-time Progress Bar */}
              {isPurchased && (
                <div className="mt-3 space-y-1">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${
                        mod.data.enabled
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                          : 'bg-slate-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upgrade/Purchase Footer */}
              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">
                  {!isPurchased ? (
                    <span>Активация за {cost} PP (стартовый таймер {mod.data.interval}с)</span>
                  ) : isMax ? (
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                      Максимальная скорость
                    </span>
                  ) : (
                    <span>Ускорить цикл: {cost} PP</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (canAfford) {
                      soundEngine.playBuy();
                      onUpgradeModule(mod.key, cost);
                    }
                  }}
                  disabled={!canAfford}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isMax
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isMax ? 'МАКС' : !isPurchased ? `Купить (${cost} PP)` : `Улучшить (${cost} PP)`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
