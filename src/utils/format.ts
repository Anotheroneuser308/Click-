/**
 * Format large numbers for gaming HUD
 */
export function formatNumber(val: number, decimals: number = 1): string {
  if (!isFinite(val) || isNaN(val)) return '0';
  if (val < 0) return '-' + formatNumber(-val, decimals);
  
  if (val < 1000) {
    if (Math.floor(val) === val) {
      return val.toString();
    }
    return val.toFixed(decimals);
  }

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const tier = Math.floor(Math.log10(val) / 3);
  
  if (tier < suffixes.length) {
    const scale = Math.pow(10, tier * 3);
    const scaled = val / scale;
    const dec = scaled >= 100 ? 1 : 2;
    return `${scaled.toFixed(dec)}${suffixes[tier]}`;
  }

  return val.toExponential(2);
}

/**
 * Format integer with thousand commas
 */
export function formatInt(val: number): string {
  if (!isFinite(val) || isNaN(val)) return '0';
  return Math.floor(val).toLocaleString('ru-RU');
}

/**
 * Format seconds countdown
 */
export function formatSeconds(sec: number): string {
  if (sec <= 0) return '0.0s';
  if (sec < 10) return `${sec.toFixed(1)}s`;
  return `${Math.ceil(sec)}s`;
}

/**
 * Encode game state to safe Base64 string
 */
export function exportSaveString(state: unknown): string {
  try {
    const jsonStr = JSON.stringify(state);
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    console.error('Save encoding error:', err);
    return '';
  }
}

/**
 * Decode game state from Base64 string
 */
export function importSaveString(saveStr: string): unknown | null {
  try {
    const jsonStr = decodeURIComponent(atob(saveStr.trim()));
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Save decoding error:', err);
    return null;
  }
}
