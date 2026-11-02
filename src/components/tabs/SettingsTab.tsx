import React, { useState } from 'react';
import { GameState } from '../../types/game';
import { exportSaveString, importSaveString } from '../../utils/format';
import { soundEngine } from '../../utils/audio';
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface SettingsTabProps {
  state: GameState;
  onManualSave: () => void;
  onToggleAutosave: () => void;
  onToggleSound: () => void;
  onImportSave: (importedState: GameState) => void;
  onResetProgress: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  state,
  onManualSave,
  onToggleAutosave,
  onToggleSound,
  onImportSave,
  onResetProgress,
}) => {
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleManualSave = () => {
    soundEngine.playSave();
    onManualSave();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExport = () => {
    const saveStr = exportSaveString(state);
    if (!saveStr) return;
    navigator.clipboard.writeText(saveStr).then(() => {
      soundEngine.playSave();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleImportSubmit = () => {
    setImportError(null);
    if (!importInput.trim()) {
      setImportError('Пожалуйста, вставьте строку сохранения.');
      return;
    }
    const parsed = importSaveString(importInput) as GameState | null;
    if (!parsed || typeof parsed.points !== 'number' || typeof parsed.upgrades !== 'object') {
      setImportError('Некорректный формат строки сохранения.');
      return;
    }
    soundEngine.playSave();
    onImportSave(parsed);
    setImportInput('');
    setImportError(null);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    onResetProgress();
  };

  const lastSavedDate = new Date(state.lastSavedAt).toLocaleTimeString('ru-RU');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Параметры и Сохранение
          </h3>
          <p className="text-xs text-slate-400">
            Управление данными, звуком и экспортом игрового прогресса
          </p>
        </div>
      </div>

      {/* Save Status & Manual Save Card */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Сохранение игры
              {saveToast && (
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Сохранено!
                </span>
              )}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Последнее сохранение: <strong className="text-slate-200 font-mono-numbers">{lastSavedDate}</strong></span>
            </div>
          </div>
        </div>

        <button
          onClick={handleManualSave}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,254,0.3)] active:scale-95"
        >
          Сохранить сейчас
        </button>
      </div>

      {/* Toggles Grid: Autosave & Sound */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Autosave Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-slate-200">
              Автосохранение (10с)
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Фоновое сохранение каждые 10 секунд
            </p>
          </div>
          <button
            onClick={onToggleAutosave}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              state.settings.autosaveEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            aria-label="Переключить автосохранение"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-1 ${
                state.settings.autosaveEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {state.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <div>
              <h5 className="text-xs font-bold text-slate-200">
                Звуковые эффекты
              </h5>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Процедурный аудио-синтезатор
              </p>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              state.settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
            aria-label="Переключить звук"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 absolute top-1 ${
                state.settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Export & Import Section */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Экспорт и импорт данных
        </h4>

        {/* Export Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Скопировать зашифрованный код прогресса в буфер обмена для переноса на другое устройство.
          </div>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            {copied ? 'Скопировано!' : 'Экспорт кода'}
          </button>
        </div>

        {/* Import Input */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Вставьте скопированный код сохранения..."
              value={importInput}
              onChange={(e) => {
                setImportInput(e.target.value);
                setImportError(null);
              }}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleImportSubmit}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              Импорт
            </button>
          </div>
          {importError && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {importError}
            </p>
          )}
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-rose-300">
            Сброс всего прогресса
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Удаляет все сохранения, поинты, клики, престиж и автоматику.
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Сбросить всё
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full p-5 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Подтверждение полного сброса
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Вы действительно хотите сбросить весь игровой процесс? Это действие необратимо: все поинты, клики, престиж и модули автоматики будут безвозвратно удалены.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer shadow-[0_0_12px_rgba(225,29,72,0.5)]"
              >
                Да, сбросить всё
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
