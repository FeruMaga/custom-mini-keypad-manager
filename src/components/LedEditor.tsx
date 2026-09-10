import { LED_MODES, LED_MODE_LABELS } from '../utils/led'
import type { LedMode, LedSettings } from '../utils/led'
import '../styles/led.css'

interface LedEditorProps {
  value: LedSettings
  onChange: (value: LedSettings) => void
}

export function LedEditor({ value, onChange }: LedEditorProps) {
  return (
    <div className="led-editor">
      <h2>LED Mode</h2>
      <p className="helper">Choose one of the three lighting modes.</p>
      <div className="led-modes" role="group" aria-label="LED mode">
        {LED_MODES.map((mode) => (
          <button
            key={mode}
            aria-pressed={value.mode === mode}
            className={value.mode === mode ? 'active' : ''}
            onClick={() => onChange({ mode: mode as LedMode })}
          >
            {LED_MODE_LABELS[mode]}
          </button>
        ))}
      </div>
    </div>
  )
}
