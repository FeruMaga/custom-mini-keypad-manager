export const LED_MODES = [0, 1, 2] as const
export type LedMode = (typeof LED_MODES)[number]

export const LED_MODE_LABELS: Record<LedMode, string> = {
  0: 'Mode 0 (None)',
  1: 'Mode 1 (Static on click)',
  2: 'Mode 2 (Wave)',
}

export interface LedSettings {
  mode: LedMode
}

export const DEFAULT_LED: LedSettings = {
  mode: 0,
}

export function normalizeLed(value?: Partial<LedSettings>): LedSettings {
  return {
    mode: LED_MODES.includes(value?.mode as LedMode) ? value!.mode! : DEFAULT_LED.mode,
  }
}
