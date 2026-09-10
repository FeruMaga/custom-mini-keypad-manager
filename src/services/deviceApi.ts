import { invoke } from '@tauri-apps/api/core'
import type { Assignment } from '../types/keypad'

export interface DeviceStatus {
  connected: boolean
  vendorId: number | null
  productId: number | null
  interfaceMatched: boolean
  path: string | null
  error: string | null
}

export interface DeviceProbe {
  connected: boolean
  reportId: number | null
}

export interface ApplyResult {
  reportId: number
}

export function getDeviceStatus() {
  return invoke<DeviceStatus>('get_device_status')
}

export function probeDevice() {
  return invoke<DeviceProbe>('probe_device')
}

export function applyAssignment(control: string, assignment: Assignment) {
  return invoke<ApplyResult>('apply_assignment', { control, assignment })
}
