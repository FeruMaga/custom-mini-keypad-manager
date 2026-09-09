import { useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { LED_EFFECTS, hexToRgb, rgbToHex, wheelColor, wheelPosition } from '../utils/led'
import type { LedSettings } from '../utils/led'
import '../styles/led.css'

interface LedEditorProps {
  value: LedSettings
  onChange: (value: LedSettings) => void
}

export function LedEditor({ value, onChange }: LedEditorProps) {
  const [hexDraft, setHexDraft] = useState<string | null>(null)
  const rgb = hexToRgb(value.color)
  const invalidHex = hexDraft !== null && !/^#?[\da-f]{6}$/i.test(hexDraft)
  const update = (patch: Partial<LedSettings>) => onChange({ ...value, ...patch })

  function selectColor(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2)
    const y = (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2)
    const hue = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360
    setHexDraft(null)
    update({ color: wheelColor(hue, Math.min(1, Math.hypot(x, y))) })
  }

  return (
    <div className="led-editor">
      <div className="led-color-row">
        <div
          className="led-wheel"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            selectColor(event)
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) selectColor(event)
          }}
          onPointerUp={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId)
          }}
        >
          <span className="led-wheel-marker" style={wheelPosition(value.color)} />
        </div>
        <div className="led-color-fields">
          <label className="led-field">
            HEX
            <div className="led-hex-input">
              <input
                type="color"
                aria-label="Choose LED color"
                value={value.color}
                onChange={(event) => {
                  setHexDraft(null)
                  update({ color: event.target.value.toUpperCase() })
                }}
              />
              <input
                aria-label="LED HEX"
                value={hexDraft ?? value.color}
                aria-invalid={invalidHex}
                maxLength={7}
                onChange={(event) => {
                  const draft = event.target.value
                  setHexDraft(draft)
                  if (/^#?[\da-f]{6}$/i.test(draft))
                    update({ color: ('#' + draft.replace('#', '')).toUpperCase() })
                }}
                onBlur={() => setHexDraft(null)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === 'Escape') {
                    setHexDraft(null)
                    event.currentTarget.blur()
                  }
                }}
              />
            </div>
          </label>
          <div className="led-rgb">
            {['R', 'G', 'B'].map((channel, index) => (
              <label className="led-field" key={channel}>
                {channel}
                <input
                  type="number"
                  min={0}
                  max={255}
                  aria-label={`LED ${channel}`}
                  value={rgb[index]}
                  onChange={(event) => {
                    if (!Number.isFinite(event.target.valueAsNumber)) return
                    const next = [...rgb]
                    next[index] = event.target.valueAsNumber
                    setHexDraft(null)
                    update({ color: rgbToHex(next) })
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
      <label className="led-slider-row">
        <span>Brightness</span>
        <span aria-hidden="true">☼</span>
        <input
          type="range"
          min="0"
          max="100"
          aria-label="LED brightness"
          value={value.brightness}
          style={{ '--fill': `${value.brightness}%` } as CSSProperties}
          onChange={(event) => update({ brightness: Number(event.target.value) })}
        />
        <output>{value.brightness}%</output>
      </label>
      <div className="led-divider" />
      <label className="led-effect-select">
        <span>Effect</span>
        <select
          value={value.effect}
          onChange={(event) => update({ effect: event.target.value as LedSettings['effect'] })}
        >
          {LED_EFFECTS.map((effect) => (
            <option key={effect}>{effect}</option>
          ))}
        </select>
      </label>
      <label className="led-slider-row">
        <span>Speed</span>
        <span aria-hidden="true">◴</span>
        <input
          type="range"
          min="0"
          max="100"
          aria-label="LED speed"
          value={value.speed}
          style={{ '--fill': `${value.speed}%` } as CSSProperties}
          onChange={(event) => update({ speed: Number(event.target.value) })}
        />
        <output>{value.speed}%</output>
      </label>
      <div className="led-effects" role="group" aria-label="LED effects">
        {LED_EFFECTS.map((effect) => (
          <button
            key={effect}
            aria-pressed={value.effect === effect}
            className={value.effect === effect ? 'active' : ''}
            onClick={() => update({ effect })}
          >
            {effect}
          </button>
        ))}
      </div>
      <p className="editor-note">
        Saved locally. Lighting effects depend on device support; USB sync is not connected.
      </p>
    </div>
  )
}
