import { useEffect, useState } from 'react'
import { getDeviceStatus } from '../services/deviceApi'

export type ConnectionStatus = 'connected' | 'disconnected'

export function useDeviceConnection(): ConnectionStatus {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  useEffect(() => {
    let active = true

    const refresh = async () => {
      try {
        const status = await getDeviceStatus()
        if (active) setConnectionStatus(status.connected ? 'connected' : 'disconnected')
      } catch {
        if (active) setConnectionStatus('disconnected')
      }
    }

    void refresh()
    const timer = window.setInterval(refresh, 1000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  return connectionStatus
}
