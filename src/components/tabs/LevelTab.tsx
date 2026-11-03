import React, { useState } from 'react';
import { GameState, LevelPerks, BulkBuyMode } from '../../types/game';
import { calculateLevelPerkBulk } from '../../constants/gameBalance';
import { soundEngine } from '../../utils/audio';
import {
  Award,
  Zap,
  BatteryCharging,
  Timer,
  MousePointerClick,
  Radio,
  CheckCircle2,
  Lock,
  Star,
  Sparkles,
  Layers,
  Flame,
} from 'lucide-react';

interface LevelTabProps {
  state: GameState;
  onUpgradePerk: (perkKey: keyof LevelPerks, count?: number) => void;
}

const BULK_MODES: BulkBuyMode[] = [1, 5, 10, 25, 100, 'max'];

export const LevelTab: React.FC<LevelTabProps> = ({ state, onUpgradePerk }) => {
  const [bulkMode, setBulkMode] = useState<BulkBuyMode>(1);
  const isUnlocked = state.prestigeCount > 0 || state.prestigeShopUnlocked || state.totalPrestigePointsEarned > 0;
  const levelState = state.levelState;

  const progressRatio = Math.min(1, Math.max(0, levelState.xp / levelState.maxXp));

  const perksList: {
    key: keyof LevelPerks;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    level: number;
    effectText: string;
  }[] = [
    {
      key: 'clickMastery',
      title: 'Мастерство клика',
      desc: '+15% ко всем получаемым поинтам за уровень навыка',
      icon: Zap,
      iconColor: 'text-cyan-400',
      level: levelState.perks.clickMastery,
      effectText: `+${levelState.perks.clickMastery * 15}% к доходу`,
    },
    {
      key: 'boosterCapacity',
      title: 'Квантовая емкость бустера',
      desc: '+25 к максимальному запасу нажатий бустера (100 → 125 → 150...)',
      icon: BatteryCharging,
      iconColor: 'text-amber-400',
      level: levelState.perks.boosterCapacity,
      effectText: `Лимит: ${100 + levelState.perks.boosterCapacity * 25} нажатий`,
    },
    {
      key: 'fastRecharge',
      title: 'Быстрая перезарядка',
      desc: '-0.05с к времени кулдауна круга за каждый уровень',
      icon: Timer,
      iconColor: 'text-blue-400',
      level: levelState.perks.fastRecharge,
      effectText: `-${(levelState.perks.fastRecharge * 0.05).toFixed(2)}с к кулдауну`,
    },
    {
      key: 'superClicks',
      title: 'Сверх-клики',
      desc: '+20% к получаемым кликам за каждое нажатие ядра',
      icon: MousePointerClick,
      iconColor: 'text-purple-400',
      level: levelState.perks.superClicks,
      effectText: `+${levelState.perks.superClicks * 20}% к кликам`,
    },
    {
      key: 'critPower',
      title: 'Критический импульс',
      desc: '+0.5x к множителю критического удара ядра за каждый уровень',
      icon: Flame,
      iconColor: 'text-amber-400',
      level: levelState.perks.critPower || 0,
      effectText: `Множитель: ×${(5 + (levelState.perks.critPower || 0) * 0.5).toFixed(1)}`,
    },
    {
      key: 'boosterStep',
      title: 'Клики в усилителе ядра',
      desc: '+0.5 к количеству кликов заряда в усилителе за каждое нажатие',
      icon: Zap,
      iconColor: 'text-amber-300',
      level: levelState.perks.boosterStep || 0,
      effectText: `+${(1 + (levelState.perks.boosterStep || 0) * 0.5).toFixed(1)} к заряду за клик`,
    },
  ];

  const milestones = [
    { level: 5, reward: '+25% к глобальным поинтам' },
    { level: 10, reward: '+50% к генерации кликов' },
    { level: 20, reward: '-0.10с к кулдауну ядра' },
    { level: 30, reward: '+2 дополнительных LP очка' },
    { level: 50, reward: 'Квантовое Золотое ядро' },
  ];

  if (!isUnlocked) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center flex flex-col items-center justify-center space-y-4 my-8">
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-base font-bold text-white">
            Система Уровней заблокирована
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Разблокируется после совершения первого Квантового Престижа (1M поинтов).
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
            <Award className="w-5 h-5 text-amber-400" />
            Кибер-Уровень и Мастерство
          </h3>
          <p className="text-xs text-slate-400">
            Получайте XP за клики и престиж, открывая очки навыков (LP)
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Очки навыков:</span>
          <span className="font-mono-numbers text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {levelState.levelPoints} LP
          </span>
        </div>
      </div>

      {/* Main Level & XP Hero Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30 border border-cyan-500/30 neon-glow-cyan flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.3)]">
              <span className="text-[9px] uppercase font-bold text-cyan-400">LVL</span>
              <span className="font-mono-numbers text-lg font-black text-white -mt-1">
                {levelState.level}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Уровень Мастерства {levelState.level}
              </h4>
              <p className="text-[11px] text-slate-400">
                Каждый уровень дает +1 LP для изучения перков
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Всего накоплено XP</span>
            <span className="font-mono-numbers text-xs font-bold text-cyan-300">
              {Math.floor(levelState.totalXpEarned)} XP
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono-numbers">
            <span className="text-slate-400">
              Опыт: <strong className="text-cyan-300">{Math.floor(levelState.xp)}</strong> / {levelState.maxXp} XP
            </span>
            <span className="text-cyan-400 font-bold">
              {(progressRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400 transition-all duration-150"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Perks / Skill Tree */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Древо кибер-навыков (за LP)
          </h4>
          <span className="text-[10px] text-slate-400">
            Стоимость: 1 LP за уровень
          </span>
        </div>

        {/* Bulk Buy Toggle Bar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold px-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Режим покупки LP:</span>
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
          {perksList.map((perk) => {
            const Icon = perk.icon;
            const bulk = calculateLevelPerkBulk(
              perk.level,
              bulkMode,
              levelState.levelPoints
            );
            const canBuy = bulk.canAfford && bulk.count > 0;

            return (
              <div
                key={perk.key}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${perk.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-slate-100">
                        {perk.title}
                      </h5>
                      <span className="text-[10px] font-mono-numbers px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        ур. {perk.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {perk.desc}
                    </p>
                    <p className="text-[11px] text-cyan-300 font-mono-numbers mt-0.5">
                      Эффект: {perk.effectText}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (canBuy) {
                      soundEngine.playBuy();
                      onUpgradePerk(perk.key, bulk.count);
                    }
                  }}
                  disabled={!canBuy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    canBuy
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.3)] active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {bulkMode === 'max'
                    ? (bulk.count > 0 ? `+${bulk.count} (${bulk.totalCost} LP)` : 'Не хватает LP')
                    : canBuy
                    ? `+${bulk.count} (${bulk.totalCost} LP)`
                    : `+${bulk.count} (${bulk.totalCost} LP)`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Rewards Section */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Вехи уровней
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {milestones.map((m) => {
            const isReached = levelState.level >= m.level;
            return (
              <div
                key={m.level}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  isReached
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div>
                  <span className="font-bold block">Уровень {m.level}</span>
                  <span className="text-[10px] text-slate-400">{m.reward}</span>
                </div>
                {isReached ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
