import React from 'react';
import { GameState } from '../types/game';
import { formatNumber, formatInt } from '../utils/format';
import { calculateClickYield } from '../constants/gameBalance';
import {
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Zap,
} from 'lucide-react';

interface TopStatusBarProps {
  state: GameState;
  onToggleSound: () => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  canAffordAnyUpgrade: boolean;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  state,
  onToggleSound,
  onToggleDrawer,
  isDrawerOpen,
  canAffordAnyUpgrade,
}) => {
  const yields = calculateClickYield(state);

  return (
    <header className="relative z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Brand Title Zone (Zone 1 of Top Bar Contract) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
          <Zap className="w-4 h-4 fill-cyan-400" />
        </div>
        <div>
          <span className="text-base md:text-lg font-black tracking-wider text-white flex items-center gap-1.5 whitespace-nowrap">
            CYBER<span className="text-cyan-400 text-glow-cyan">CORE</span>
          </span>
          <span className="hidden sm:block text-[10px] text-slate-400 tracking-widest uppercase">
            Квантовый кликер v1.0
          </span>
        </div>
      </div>

      {/* Main HUD Stats Zone */}
      <div className="flex items-center gap-3 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar py-1">
        {/* Points Counter */}
        <div className="flex flex-col items-center sm:items-start shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Поинты
          </span>
          <span className="font-mono-numbers text-base sm:text-lg md:text-xl font-black text-cyan-400 text-glow-cyan">
            {formatNumber(state.points)}
          </span>
        </div>

        {/* Clicks Counter */}
        <div className="flex flex-col items-center sm:items-start shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Клики
          </span>
          <span className="font-mono-numbers text-base sm:text-lg md:text-xl font-black text-purple-400 text-glow-purple">
            {formatInt(state.clicks)}
          </span>
        </div>

        {/* Multiplier Stat */}
        <div className="flex flex-col items-center sm:items-start shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Множитель
          </span>
          <span className="font-mono-numbers text-base sm:text-lg md:text-xl font-black text-emerald-400">
            x{yields.totalMultiplier.toFixed(2)}
          </span>
        </div>

        {/* Prestige Points (if > 0 or prestige count > 0) */}
        {(state.prestigePoints > 0 || state.prestigeCount > 0) && (
          <div className="hidden lg:flex flex-col items-start shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> PP
            </span>
            <span className="font-mono-numbers text-base sm:text-lg md:text-xl font-black text-amber-400 text-glow-amber">
              {state.prestigePoints}
            </span>
          </div>
        )}
      </div>

      {/* Actions Zone (Zone 3) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          title={state.settings.soundEnabled ? 'Выключить звук' : 'Включить звук'}
          aria-label="Переключить звук"
        >
          {state.settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Open Shop / Drawer Button */}
        <button
          onClick={onToggleDrawer}
          className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            isDrawerOpen
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,242,254,0.35)]'
          }`}
          aria-label="Открыть магазин и настройки"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">Магазин</span>

          {canAffordAnyUpgrade && !isDrawerOpen && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping shadow-[0_0_8px_#f59e0b]" />
          )}
        </button>
      </div>
    </header>
  );
};
