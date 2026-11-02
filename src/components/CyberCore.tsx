import React, { useState } from 'react';
import { formatNumber, formatSeconds } from '../utils/format';
import { ClickEffect } from '../types/game';
import { soundEngine } from '../utils/audio';

interface CyberCoreProps {
  cooldownRemaining: number;
  maxCooldown: number;
  pointsYield: number;
  clicksYield: number;
  onClick: (e: React.MouseEvent) => void;
  floatingEffects: ClickEffect[];
}

export const CyberCore: React.FC<CyberCoreProps> = ({
  cooldownRemaining,
  maxCooldown,
  pointsYield,
  clicksYield,
  onClick,
  floatingEffects,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [shake, setShake] = useState(false);

  const isCooling = cooldownRemaining > 0;
  const progressRatio = Math.max(0, Math.min(1, 1 - cooldownRemaining / maxCooldown));

  // Circular gauge math (radius = 120, circumference = 2 * PI * 120 ≈ 753.98)
  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleClick = (e: React.MouseEvent) => {
    if (isCooling) {
      soundEngine.playCooldownError();
      setShake(true);
      setTimeout(() => setShake(false), 250);
    } else {
      soundEngine.playClick();
    }
    onClick(e);
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Floating Click Yield Popups */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {floatingEffects.map((eff) => (
          <div
            key={eff.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none animate-float-fade"
            style={{
              left: `${eff.x}px`,
              top: `${eff.y}px`,
            }}
          >
            <span className="font-mono-numbers font-extrabold text-cyan-300 text-lg md:text-xl drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">
              +{formatNumber(eff.points)} P
            </span>
            <span className="font-mono-numbers font-semibold text-purple-300 text-xs md:text-sm drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]">
              +{eff.clicks.toFixed(1)} Клик
            </span>
          </div>
        ))}
      </div>

      {/* Outer Pulse Rings when Ready */}
      {!isCooling && (
        <div className="absolute w-[320px] h-[320px] md:w-[380px] md:h-[380px] rounded-full border border-cyan-400/20 animate-ping opacity-25 pointer-events-none" />
      )}

      {/* Main Interactive Core Container */}
      <div
        className={`relative w-[290px] h-[290px] md:w-[350px] md:h-[350px] flex items-center justify-center rounded-full transition-transform duration-100 cursor-pointer ${
          isPressed ? 'scale-95' : 'hover:scale-[1.02]'
        } ${shake ? 'animate-wiggle' : ''}`}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Кликните по ядру для получения поинтов"
      >
        {/* SVG Circular Cooldown Progress Arc */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 transform pointer-events-none"
          viewBox="0 0 300 300"
        >
          {/* Background Track Ring */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke="rgba(15, 23, 42, 0.8)"
            strokeWidth="10"
            className="transition-colors duration-300"
          />

          {/* Glowing Progress Arc */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={isCooling ? '#00f2fe' : '#38bdf8'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
            style={{
              filter: isCooling
                ? 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.8))'
                : 'drop-shadow(0 0 14px rgba(56, 189, 248, 0.9))',
            }}
          />
        </svg>

        {/* Central Glowing Orb Surface */}
        <div
          className={`w-[220px] h-[220px] md:w-[260px] md:h-[260px] rounded-full flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 border ${
            isCooling
              ? 'bg-slate-900/90 border-cyan-900/40 opacity-90'
              : 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-400/60 neon-glow-cyan'
          }`}
        >
          {/* Subtle Grid / Circuit Lines inside Core */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Status Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {isCooling ? (
              <>
                <span className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                  Перезарядка
                </span>
                <span className="font-mono-numbers text-3xl md:text-4xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]">
                  {formatSeconds(cooldownRemaining)}
                </span>
                <div className="w-24 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-75"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-cyan-400 mb-2 shadow-[0_0_12px_#00f2fe] animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]">
                  КЛИКНИ МЕНЯ
                </span>
                <div className="mt-2 text-center">
                  <span className="font-mono-numbers text-2xl md:text-3xl font-extrabold text-white text-glow-cyan">
                    +{formatNumber(pointsYield)}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold ml-1">поинтов</span>
                </div>
                <span className="font-mono-numbers text-[11px] text-purple-400/90 font-medium mt-0.5">
                  +{clicksYield.toFixed(1)} к кликам
                </span>
              </>
            )}
          </div>

          {/* Specular Highlight / Lens Flare arc */}
          <div className="absolute top-2 left-6 right-6 h-12 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
        </div>
      </div>

      {/* Cooldown Info Badge below Core */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>Кулдаун ядра:</span>
        <span className="font-mono-numbers font-semibold text-cyan-300">
          {maxCooldown.toFixed(1)} сек
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">
          {isCooling ? 'Заряжается...' : 'Готов к импульсу'}
        </span>
      </div>
    </div>
  );
};
