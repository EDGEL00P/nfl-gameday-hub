type HapticPattern = "tap" | "success" | "error" | "warning" | "selection" | "impact";

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  success: [10, 50, 10],
  error: [50, 100, 50, 100, 50],
  warning: [30, 50, 30],
  selection: 5,
  impact: 25
};

function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

function isHapticsEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  const stored = localStorage.getItem("haptics-enabled");
  return stored !== "false";
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("haptics-enabled", String(enabled));
  }
}

export function vibrate(pattern: number | number[]): boolean {
  if (!isVibrationSupported() || !isHapticsEnabled()) {
    return false;
  }
  
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

export function haptic(type: HapticPattern): boolean {
  const pattern = HAPTIC_PATTERNS[type];
  return vibrate(pattern);
}

export function hapticTap(): boolean {
  return haptic("tap");
}

export function hapticSuccess(): boolean {
  return haptic("success");
}

export function hapticError(): boolean {
  return haptic("error");
}

export function hapticWarning(): boolean {
  return haptic("warning");
}

export function hapticSelection(): boolean {
  return haptic("selection");
}

export function hapticImpact(): boolean {
  return haptic("impact");
}

export function cancelHaptic(): boolean {
  if (!isVibrationSupported()) return false;
  
  try {
    return navigator.vibrate(0);
  } catch {
    return false;
  }
}

export function customVibration(pattern: number[]): boolean {
  return vibrate(pattern);
}

export const haptics = {
  isSupported: isVibrationSupported,
  isEnabled: isHapticsEnabled,
  setEnabled: setHapticsEnabled,
  tap: hapticTap,
  success: hapticSuccess,
  error: hapticError,
  warning: hapticWarning,
  selection: hapticSelection,
  impact: hapticImpact,
  cancel: cancelHaptic,
  custom: customVibration,
  vibrate
};

export default haptics;
