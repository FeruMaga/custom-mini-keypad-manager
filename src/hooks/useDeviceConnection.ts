import { useEffect, useState } from 'react'

type HidNavigator = Navigator & {
  hid?: {
    getDevices: () => Promise<unknown[]>
    addEventListener: (type: 'connect' | 'disconnect', listener: () => void) => void
    removeEventListener: (type: 'connect' | 'disconnect', listener: () => void) => void
  }
}

export type ConnectionStatus = 'connected' | 'disconnected'

export function useDeviceConnection(): ConnectionStatus {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  useEffect(() => {
    const hid = (navigator as HidNavigator).hid
    if (!hid) return

    let active = true
    const refresh = async () => {
      try {
        const devices = await hid.getDevices()
        if (active) setConnectionStatus(devices.length > 0 ? 'connected' : 'disconnected')
      } catch {
        if (active) setConnectionStatus('disconnected')
      }
    }

    const refreshConnection = () => {
      void refresh()
    }

    refreshConnection()
    hid.addEventListener('connect', refreshConnection)
    hid.addEventListener('disconnect', refreshConnection)

    return () => {
      active = false
      hid.removeEventListener('connect', refreshConnection)
      hid.removeEventListener('disconnect', refreshConnection)
    }
  }, [])

  return connectionStatus
}
