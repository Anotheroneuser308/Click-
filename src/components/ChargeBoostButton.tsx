import React, { useState } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ChargeBoostButtonProps {
  chargeLevel: number; // 0 to 100
  onCharge: () => void;
}

export const ChargeBoostButton: React.FC<ChargeBoostButtonProps> = ({
  chargeLevel,
  onCharge,
}) => {
  const [clickSparks, setClickSparks] = useState<{ id: string; x: number; y: number }[]>([]);
  const isMaxed = chargeLevel >= 100;
  const progressPercent = Math.min(100, Math.max(0, chargeLevel));

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMaxed) return;

    soundEngine.playCharge(chargeLevel + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const sparkX = e.clientX - rect.left;
    const sparkY = e.clientY - rect.top;
    const sparkId = `${Date.now()}_${Math.random()}`;

    setClickSparks((prev) => [...prev.slice(-6), { id: sparkId, x: sparkX, y: sparkY }]);
    setTimeout(() => {
      setClickSparks((prev) => prev.filter((s) => s.id !== sparkId));
    }, 600);

    onCharge();
  };

  const pointsMultBonus = (chargeLevel * 0.01).toFixed(2);
  const clicksMultBonus = (chargeLevel * 0.005).toFixed(3);

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Floating Sparkles when clicking */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {clickSparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-cyan-300 font-mono-numbers text-xs font-black animate-float-fade drop-shadow-[0_0_6px_rgba(0,242,254,0.8)]"
            style={{ left: `${spark.x}px`, top: `${spark.y}px` }}
          >
            +1 (+0.01x P)
          </div>
        ))}
      </div>

      {/* Main Rectangular Button */}
      <button
        onClick={handleClick}
        disabled={isMaxed}
        className={`group relative w-64 sm:w-72 md:w-80 pt-3.5 pb-0 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-md border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
          isMaxed
            ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-default'
            : 'border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-[0_0_25px_rgba(0,242,254,0.25)] active:scale-[0.98] cursor-pointer'
        }`}
        aria-label="Зарядить квантовый бустер"
      >
        {/* Top Glow Accent inside button */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 ${
            isMaxed
              ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500'
              : 'bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent'
          }`}
        />

        {/* Content Container */}
        <div className="px-4 pb-3 flex flex-col gap-2 w-full text-left">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg border transition-colors ${
                  isMaxed
                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                    : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 group-hover:bg-cyan-900/40'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Усилитель ядра
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Квантовая зарядка
                </span>
              </div>
            </div>

            {/* Counter Badge */}
            <div className="text-right">
              <span
                className={`font-mono-numbers text-sm font-extrabold ${
                  isMaxed
                    ? 'text-amber-400 text-glow-amber'
                    : 'text-cyan-300 text-glow-cyan'
                }`}
              >
                {Math.floor(chargeLevel)} <span className="text-slate-500 text-xs">/ 100</span>
              </span>
            </div>
          </div>

          {/* Current Multipliers Display */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono-numbers text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px] block">Поинты:</span>
              <span className="text-cyan-300 font-bold">
                +{pointsMultBonus}x <span className="text-slate-400 font-normal">({(1 + chargeLevel * 0.01).toFixed(2)}x)</span>
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Клики:</span>
              <span className="text-purple-300 font-bold">
                +{clicksMultBonus}x <span className="text-slate-400 font-normal">({(1 + chargeLevel * 0.005).toFixed(3)}x)</span>
              </span>
            </div>
          </div>

          {/* Action Prompt */}
          <div className="flex items-center justify-between text-[11px] pt-0.5">
            {isMaxed ? (
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Максимальный заряд
              </span>
            ) : (
              <span className="text-slate-400 group-hover:text-cyan-300 transition-colors">
                Нажмите для зарядки <strong className="text-white">+1</strong>
              </span>
            )}
            <span className="text-slate-500 font-mono-numbers text-[10px]">
              {Math.floor(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Bottom Progress Bar ("полоска снизу") */}
        <div className="w-full h-2.5 bg-slate-950 rounded-b-2xl overflow-hidden relative border-t border-slate-800/80">
          <div
            className={`h-full transition-all duration-100 ease-out ${
              isMaxed
                ? 'bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_#f59e0b]'
                : 'bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.6)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </button>
    </div>
  );
};
