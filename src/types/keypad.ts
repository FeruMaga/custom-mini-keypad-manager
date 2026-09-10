import type { LedSettings } from '../utils/led'

export type Category = 'Keyboard' | 'Media' | 'System' | 'Mouse' | 'LED'

export interface Assignment {
  category: Category
  keys: string[]
  led?: LedSettings
}

export type Assignments = Record<string, Assignment>
