import { useState } from 'react'
import type { Category } from '../types/keypad'
import { LedEditor } from './LedEditor'
import { normalizeLed } from '../utils/led'
import type { Assignment } from '../types/keypad'
import { ACTIONS, CATEGORIES } from '../data/actions'
import { Icon } from './Icon'
import { KeyboardEditor } from './KeyboardEditor'
import type { ConnectionStatus } from '../hooks/useDeviceConnection'

interface ShortcutEditorProps {
  selected: string
  onSelectControl: (id: string) => void
  assignment: Assignment
  onChange: (assignment: Assignment) => void
  onApply: (assignment: Assignment) => Promise<{ reportId: number }>
  connectionStatus: ConnectionStatus
}

const DIAL_CONTROLS = [
  { id: 'Dial click', label: 'Click' },
  { id: 'Dial left', label: 'Rotate left' },
  { id: 'Dial right', label: 'Rotate right' },
]

const DIAL_LABELS = Object.fromEntries(DIAL_CONTROLS.map((control) => [control.id, control.label]))

export function ShortcutEditor({
  selected,
  onSelectControl,
  assignment,
  onChange,
  onApply,
  connectionStatus,
}: ShortcutEditorProps) {
  const [categoryChoice, setCategoryChoice] = useState<{
    selected: string
    category: Category
  } | null>(null)
  const [applyFeedback, setApplyFeedback] = useState<{
    selected: string
    state: 'idle' | 'applying' | 'success' | 'error'
    message: string
  }>({ selected: '', state: 'idle', message: '' })
  const dialSelected = selected.startsWith('Dial')
  const selectedLabel = dialSelected ? `dial ${DIAL_LABELS[selected].toLowerCase()}` : selected
  const category =
    categoryChoice?.selected === selected ? categoryChoice.category : assignment.category
  const keys = assignment.category === category ? assignment.keys : []
  const applyState = applyFeedback.selected === selected ? applyFeedback.state : 'idle'
  const applyMessage = applyFeedback.selected === selected ? applyFeedback.message : ''

  async function applyToDevice() {
    setApplyFeedback({ selected, state: 'applying', message: '' })

    const current: Assignment =
      category === 'LED'
        ? { category, keys: [], led: normalizeLed(assignment.led) }
        : { category, keys }

    try {
      const result = await onApply(current)
      setApplyFeedback({
        selected,
        state: 'success',
        message: `Applied to device using report ${result.reportId}`,
      })
    } catch (error) {
      setApplyFeedback({
        selected,
        state: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <section className="editor-panel">
      <div className="editor-heading">
        <div className="editor-title-copy">
          <h1>Choose Shortcut</h1>
          <p>
            Assign a shortcut to <strong>{selectedLabel}</strong>
          </p>
        </div>
        {dialSelected && (
          <div className="dial-mode-switch" role="group" aria-label="Dial control">
            {DIAL_CONTROLS.map((control) => (
              <button
                key={control.id}
                aria-pressed={selected === control.id}
                onClick={() => onSelectControl(control.id)}
              >
                {control.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="categories" role="group" aria-label="Action category">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            className={category === item ? 'active' : ''}
            onClick={() => {
              setCategoryChoice({ selected, category: item })
              setApplyFeedback({ selected, state: 'idle', message: '' })
            }}
          >
            <Icon name={item} />
            {item}
          </button>
        ))}
      </div>
      <div className="assignment-editor">
        {category === 'LED' ? (
          <LedEditor
            key={selected}
            value={normalizeLed(assignment.led)}
            onChange={(led) => onChange({ category: 'LED', keys: [], led })}
          />
        ) : (
          <>
            <h2>{category === 'Keyboard' ? 'Key Combination' : `${category} Action`}</h2>
            <p className="helper">
              {category === 'Keyboard'
                ? 'Select the keys below to create a shortcut'
                : 'Choose an action for the selected control'}
            </p>
            <div className="combination">
              <div className="combination-keys">
                {keys.length ? (
                  keys.map((key, index) => (
                    <span className="combination-part" key={key}>
                      {index > 0 && <span className="plus">+</span>}
                      <kbd>{key}</kbd>
                    </span>
                  ))
                ) : (
                  <span className="placeholder">No shortcut assigned</span>
                )}
              </div>
              <button
                className="clear-button"
                aria-label="Clear shortcut"
                onClick={() => onChange({ category, keys: [] })}
              >
                <Icon name="Close" />
              </button>
            </div>
            {category === 'Keyboard' ? (
              <KeyboardEditor key={selected} keys={keys} onChange={onChange} />
            ) : (
              <div className="action-grid" aria-label={`${category} actions`}>
                {ACTIONS[category].map((action) => (
                  <button
                    key={action}
                    aria-pressed={keys.includes(action)}
                    className={keys.includes(action) ? 'active' : ''}
                    onClick={() => onChange({ category, keys: [action] })}
                  >
                    <Icon name={category} />
                    {action}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="editor-actions">
        <p className={`apply-message ${applyState}`} role="status">
          {applyMessage}
        </p>
        <button
          className="apply-button"
          disabled={applyState === 'applying' || connectionStatus !== 'connected'}
          title={connectionStatus !== 'connected' ? 'Connect the device to apply' : undefined}
          onClick={applyToDevice}
        >
          {applyState === 'applying' ? 'Applying...' : 'Apply to device'}
        </button>
      </div>
    </section>
  )
}
