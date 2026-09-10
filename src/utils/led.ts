export const LED_MODES = [0, 1, 2] as const
export type LedMode = (typeof LED_MODES)[number]

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
