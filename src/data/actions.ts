import type { Category } from '../types/keypad'

export const PROJECT_NAME = 'Custom Mini Keypad Manager'

export const CATEGORIES: Category[] = ['Keyboard', 'Media', 'System', 'Mouse', 'LED']

export const MODIFIERS = ['Ctrl', 'Shift', 'Alt', 'Win']

export const ACTIONS: Record<'Media' | 'System' | 'Mouse', string[]> = {
  Media: ['Volume Up', 'Volume Down', 'Mute', 'Play / Pause', 'Next Track', 'Previous Track'],
  System: [
    'Lock Screen',
    'Show Desktop',
    'Task Manager',
    'Microphone Mute',
    'Screenshot',
    'Snipping Tool',
    'File Explorer',
    'Settings',
    'Search',
    'Run Dialog',
    'Switch Window',
    'Close Window',
    'New Virtual Desktop',
    'Next Virtual Desktop',
    'Previous Virtual Desktop',
  ],
  Mouse: [
    'Left Click',
    'Right Click',
    'Middle Click',
    'Scroll Up',
    'Scroll Down',
    'Ctrl + Scroll Up',
    'Ctrl + Scroll Down',
    'Shift + Scroll Up',
    'Shift + Scroll Down',
    'Alt + Scroll Up',
    'Alt + Scroll Down',
  ],
}
