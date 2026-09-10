import { useState } from 'react'
import { CATEGORIES } from '../data/actions'
import type { Assignment, Assignments } from '../types/keypad'

const STORAGE_KEY = 'mini-keypad-profiles-v1'
const DEFAULT_ASSIGNMENTS: Assignments = {
  K1: { category: 'Keyboard', keys: ['Ctrl', 'C'] },
}
const EMPTY_ASSIGNMENT: Assignment = { category: 'Keyboard', keys: [] }
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
  function select(id: string) {
    setSelected(id)
  }
  function update(assignment: Assignment) {
    const next = {
      ...assignments,
      [selected]: { ...assignment, led: assignment.led ?? assignments[selected]?.led },
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
