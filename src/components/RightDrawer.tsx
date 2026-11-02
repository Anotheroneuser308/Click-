import React from 'react';
import { GameState, ActiveTab } from '../types/game';
import { PRESTIGE_THRESHOLD } from '../constants/gameBalance';
import { UpgradesTab } from './tabs/UpgradesTab';
import { PrestigeTab } from './tabs/PrestigeTab';
import { AutomationTab } from './tabs/AutomationTab';
import { SettingsTab } from './tabs/SettingsTab';
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Sparkles,
  Cpu,
  Settings,
  Lock,
} from 'lucide-react';

interface RightDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  state: GameState;
  
  // Actions
  onBuyUpgrade: (type: 'pointsBonus' | 'clicksBonus' | 'cooldownReduction' | 'multiplierBonus') => void;
  onPrestige: () => void;
  onBuyPrestigeUpgrade: (type: 'automationUnlocked' | 'clicksMultiplier' | 'pointsMultiplier', cost: number) => void;
  onToggleModule: (moduleKey: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4') => void;
  onUpgradeModule: (moduleKey: 'autoclicker' | 'autoUpg1' | 'autoUpg2' | 'autoUpg3' | 'autoUpg4', cost: number) => void;
  onManualSave: () => void;
  onToggleAutosave: () => void;
  onToggleSound: () => void;
  onImportSave: (importedState: GameState) => void;
  onResetProgress: () => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  state,
  onBuyUpgrade,
  onPrestige,
  onBuyPrestigeUpgrade,
  onToggleModule,
  onUpgradeModule,
  onManualSave,
  onToggleAutosave,
  onToggleSound,
  onImportSave,
  onResetProgress,
}) => {
  const isPrestigeLocked = state.points < PRESTIGE_THRESHOLD && state.prestigeCount === 0;
  const isAutomationLocked = !state.prestigeUpgrades.automationUnlocked;

  // Rectangular sub-windows definitions
  const tabs = [
    {
      id: 'upgrades' as const,
      label: 'Улучшения',
      sublabel: 'Базовая прокачка',
      icon: Zap,
      locked: false,
      accentColor: 'text-cyan-400',
      activeBg: 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300',
    },
    {
      id: 'prestige' as const,
      label: isPrestigeLocked ? 'Locked' : 'Престиж',
      sublabel: isPrestigeLocked ? 'Достигните 1M Points' : 'Квантовый сброс',
      icon: Sparkles,
      locked: isPrestigeLocked,
      accentColor: 'text-amber-400',
      activeBg: 'bg-amber-950/40 border-amber-500/50 text-amber-300',
    },
    {
      id: 'automation' as const,
      label: isAutomationLocked ? 'Locked' : 'Автоматика',
      sublabel: isAutomationLocked ? 'Разблокируйте в престиже' : '5 активных модулей',
      icon: Cpu,
      locked: isAutomationLocked,
      accentColor: 'text-purple-400',
      activeBg: 'bg-purple-950/40 border-purple-500/50 text-purple-300',
    },
    {
      id: 'settings' as const,
      label: 'Настройки',
      sublabel: 'Сохранение и звук',
      icon: Settings,
      locked: false,
      accentColor: 'text-slate-300',
      activeBg: 'bg-slate-850 border-slate-600 text-white',
    },
  ];

  return (
    <>
      {/* Toggle button on screen right edge */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 py-4 px-2.5 rounded-l-2xl bg-slate-900/90 border-l border-y border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-slate-800 transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.25)] ${
          isOpen ? 'right-[540px] md:right-[600px] lg:right-[660px]' : 'right-0'
        }`}
        aria-label={isOpen ? 'Свернуть панель' : 'Развернуть панель'}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 animate-pulse" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ChevronLeft className="w-5 h-5 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest writing-vertical-lr text-cyan-300">
              МАГАЗИН
            </span>
          </div>
        )}
      </button>

      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs"
          onClick={onToggle}
        />
      )}

      {/* Main Drawer Container */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-35 w-full sm:w-[540px] md:w-[600px] lg:w-[660px] bg-[#0c101b]/95 backdrop-blur-md border-l border-cyan-500/30 flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
              Центр управления и улучшений
            </h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Закрыть панель"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body: Left Rectangular Sub-Tabs + Right Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Rectangular Sub-Window Buttons */}
          <nav className="w-40 sm:w-48 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-2.5 flex flex-col gap-2 overflow-y-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative w-full text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                    isActive
                      ? `${tab.activeBg} shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                      : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? tab.accentColor : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="text-xs font-bold tracking-tight">
                        {tab.label}
                      </span>
                    </div>

                    {tab.locked && (
                      <Lock className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 block truncate">
                    {tab.sublabel}
                  </span>

                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Column: Active Sub-Window View */}
          <main className="flex-1 p-4 md:p-5 overflow-y-auto no-scrollbar bg-slate-950/20">
            {activeTab === 'upgrades' && (
              <UpgradesTab state={state} onBuyUpgrade={onBuyUpgrade} />
            )}
            {activeTab === 'prestige' && (
              <PrestigeTab
                state={state}
                onPrestige={onPrestige}
                onBuyPrestigeUpgrade={onBuyPrestigeUpgrade}
              />
            )}
            {activeTab === 'automation' && (
              <AutomationTab
                state={state}
                onToggleModule={onToggleModule}
                onUpgradeModule={onUpgradeModule}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsTab
                state={state}
                onManualSave={onManualSave}
                onToggleAutosave={onToggleAutosave}
                onToggleSound={onToggleSound}
                onImportSave={onImportSave}
                onResetProgress={onResetProgress}
              />
            )}
          </main>
        </div>
      </aside>
    </>
  );
};
