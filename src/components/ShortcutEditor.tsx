import { useState } from 'react'
import type { Category } from '../types/keypad'
import { LedEditor } from './LedEditor'
import { normalizeLed } from '../utils/led'
import type { Assignment } from '../types/keypad'
import { ACTIONS, CATEGORIES } from '../data/actions'
import { Icon } from './Icon'
import { KeyboardEditor } from './KeyboardEditor'
interface ShortcutEditorProps {
  selected: string
  assignment: Assignment
  status: string
  onChange: (assignment: Assignment) => void
}
export function ShortcutEditor({ selected, assignment, status, onChange }: ShortcutEditorProps) {
  const [category, setCategory] = useState<Category>('Keyboard')
  const keys = assignment.category === category ? assignment.keys : []
  return (
    <section className="editor-panel">
      <div className="editor-heading">
        <h1>Choose Shortcut</h1>
        <p>
          Assign a shortcut to <strong>{selected}</strong>
        </p>
      </div>
      <div className="categories" role="group" aria-label="Action category">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            className={category === item ? 'active' : ''}
            onClick={() => {
              setCategory(item)
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
      <footer className="editor-footer">
        <span className="status-dot" />
        <p role="status">{status}</p>
        <span className="profile-label">DEFAULT PROFILE</span>
      </footer>
    </section>
  )
}
