export const LED_EFFECTS = ['Static', 'Wave', 'Reactive', 'Rainbow'] as const
export interface LedSettings {
  color: string
  brightness: number
  speed: number
  effect: (typeof LED_EFFECTS)[number]
}
export const DEFAULT_LED: LedSettings = {
  color: '#FF3366',
  brightness: 80,
  speed: 50,
  effect: 'Static',
}
export function normalizeLed(value?: Partial<LedSettings>): LedSettings {
  const percent = (number: unknown, fallback: number) =>
    typeof number === 'number' && Number.isFinite(number)
      ? Math.max(0, Math.min(100, number))
      : fallback
  return {
    color:
      typeof value?.color === 'string' && /^#[\da-f]{6}$/i.test(value.color)
        ? value.color.toUpperCase()
        : DEFAULT_LED.color,
    brightness: percent(value?.brightness, 80),
    speed: percent(value?.speed, 50),
    effect: LED_EFFECTS.includes(value?.effect as LedSettings['effect'])
      ? value!.effect!
      : 'Static',
  }
}
export function hexToRgb(hex: string) {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
}
export function rgbToHex(rgb: number[]) {
  return (
    '#' +
    rgb
      .map((channel) =>
        Math.round(Math.max(0, Math.min(255, channel)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  )
}
export function wheelColor(hue: number, saturation: number) {
  const c = saturation
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const sectors = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ]
  return rgbToHex(sectors[Math.floor(hue / 60) % 6].map((channel) => (channel + 1 - c) * 255))
}
export function wheelPosition(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255)
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min
  let hue = 0
  if (delta)
    hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  hue = (hue * 60 + 360) % 360
  const radius = max ? (delta / max) * 46 : 0
  const angle = (hue * Math.PI) / 180
  return { left: `${50 + Math.sin(angle) * radius}%`, top: `${50 - Math.cos(angle) * radius}%` }
}
