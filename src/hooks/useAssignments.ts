import { useState } from 'react'
import { CATEGORIES } from '../data/actions'
import type { Assignment, Assignments } from '../types/keypad'

const STORAGE_KEY = 'mini-keypad-profiles-v1'
const DEFAULT_ASSIGNMENTS: Assignments = {
  K1: { category: 'Keyboard', keys: ['Ctrl', 'C'] },
}
const EMPTY_ASSIGNMENT: Assignment = { category: 'Keyboard', keys: [] }
const DIAL_CONTROLS = ['Dial click', 'Dial left', 'Dial right']

function isDialControl(id: string) {
  return DIAL_CONTROLS.includes(id)
}

function hasConfiguredAssignment(assignment?: Assignment) {
  return Boolean(assignment && (assignment.keys.length > 0 || assignment.led))
}

function isAssignment(value: unknown): value is Assignment {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Assignment>
  return (
    candidate.category !== undefined &&
    CATEGORIES.includes(candidate.category) &&
    Array.isArray(candidate.keys) &&
    candidate.keys.every((key) => typeof key === 'string')
  )
}

function loadAssignments(): Assignments {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return DEFAULT_ASSIGNMENTS
    }
    return Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, Assignment] =>
        isAssignment(entry[1]),
      ),
    )
  } catch {
    return DEFAULT_ASSIGNMENTS
  }
}

export function useAssignments() {
  const [assignments, setAssignments] = useState(loadAssignments)
  const [selected, setSelected] = useState('K1')
  const [lastDialControl, setLastDialControl] = useState(() => {
    const configuredDial = DIAL_CONTROLS.find((id) => hasConfiguredAssignment(assignments[id]))
    return configuredDial || 'Dial click'
  })

  function select(id: string) {
    if (id === 'Dial') {
      const configuredDial = DIAL_CONTROLS.find((dialId) => hasConfiguredAssignment(assignments[dialId]))
      setSelected(configuredDial || lastDialControl)
      return
    }

    if (isDialControl(id)) {
      setLastDialControl(id)
    }

    setSelected(id)
  }

  function update(assignment: Assignment) {
    const next = {
      ...assignments,
      [selected]: { ...assignment, led: assignment.led ?? assignments[selected]?.led },
    }
    if (isDialControl(selected)) {
      setLastDialControl(selected)
    }
    setAssignments(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Keep editing responsive even if local storage is unavailable.
    }
  }
  return { selected, select, update, assignment: assignments[selected] || EMPTY_ASSIGNMENT }
}
