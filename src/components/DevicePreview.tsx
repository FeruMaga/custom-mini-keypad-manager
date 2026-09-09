interface DevicePreviewProps {
  selected: string
  onSelect: (id: string) => void
}
export function DevicePreview({ selected, onSelect }: DevicePreviewProps) {
  return (
    <section className="device-panel" aria-label="Select a keypad control">
      <div className="device-scene">
        <div className="device">
          <span className="screw s1" />
          <span className="screw s2" />
          <span className="screw s3" />
          <span className="screw s4" />
          <button
            className={`knob ${selected === 'Dial press' ? 'selected' : ''}`}
            aria-label="Configure dial press"
            aria-pressed={selected === 'Dial press'}
            onClick={() => onSelect('Dial press')}
          >
            <span />
          </button>
          <div className="device-keys">
            {Array.from({ length: 6 }, (_, i) => `K${i + 1}`).map((id) => (
              <button
                key={id}
                className={`device-key ${selected === id ? 'selected' : ''}`}
                onClick={() => onSelect(id)}
                aria-label={`Configure ${id}`}
                aria-pressed={selected === id}
              >
                <span className="key-cap">
                  {selected === id && <span className="key-tag">{id}</span>}
                  <span className="key-label">{id}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="device-instruction">Select a key to assign a shortcut</p>
      <div className="dial-controls">
        <button onClick={() => onSelect('Dial left')} aria-pressed={selected === 'Dial left'}>
          ↶ Rotate left
        </button>
        <button onClick={() => onSelect('Dial right')} aria-pressed={selected === 'Dial right'}>
          ↷ Rotate right
        </button>
      </div>
      <span className="device-caption">6 KEYS · 1 DIAL</span>
    </section>
  )
}
