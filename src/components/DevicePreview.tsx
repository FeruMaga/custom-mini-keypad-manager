interface DevicePreviewProps {
  selected: string
  onSelect: (id: string) => void
}
export function DevicePreview({ selected, onSelect }: DevicePreviewProps) {
  const dialSelected = selected.startsWith('Dial')
  return (
    <section className="device-panel" aria-label="Select a keypad control">
      <div className="device-scene">
        <div className="device">
          <span className="screw s1" />
          <span className="screw s2" />
          <span className="screw s3" />
          <span className="screw s4" />
          <button
            className={`knob ${dialSelected ? 'selected' : ''}`}
            aria-label="Configure dial"
            aria-pressed={dialSelected}
            onClick={() => onSelect('Dial')}
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
      <span className="device-caption">6 KEYS · 1 DIAL</span>
    </section>
  )
}
