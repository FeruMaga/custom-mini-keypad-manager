import type { Assignment } from '../types/keypad'
import { MODIFIERS as modifiers } from '../data/actions'
import { KEYBOARD_ROWS as rows } from '../data/keyboard'

interface KeyboardEditorProps {
  keys: string[]
  onChange: (assignment: Assignment) => void
}

export function KeyboardEditor({ keys, onChange: update }: KeyboardEditorProps) {
  function chooseKey(key: string) {
    const next = modifiers.includes(key)
      ? keys.includes(key)
        ? keys.filter((item) => item !== key)
        : [
            ...keys.filter((item) => modifiers.includes(item)),
            key,
            ...keys.filter((item) => !modifiers.includes(item)),
          ]
      : [...keys.filter((item) => modifiers.includes(item)), key]
    update({ category: 'Keyboard', keys: next })
  }
  
  return (
    <>
      <div className="modifier-bar">
        {modifiers.map((key) => (
          <button
            key={key}
            className={keys.includes(key) ? 'active' : ''}
            aria-pressed={keys.includes(key)}
            onClick={() => chooseKey(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="keyboard" aria-label="Virtual keyboard">
        {rows.map((row, i) => (
          <div className="keyboard-row" key={i}>
            {row.map((key, index) => (
              <button
                key={`${key}-${index}`}
                className={`${key === 'Space' ? 'space-key' : key.length > 2 ? 'wide-key' : ''} ${keys.includes(key) ? 'chosen' : ''}`}
                aria-pressed={keys.includes(key)}
                onClick={() => chooseKey(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
