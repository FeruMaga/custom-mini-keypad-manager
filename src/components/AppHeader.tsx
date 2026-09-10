import { PROJECT_NAME } from '../data/actions'
import type { ConnectionStatus } from '../hooks/useDeviceConnection'

interface AppHeaderProps {
  connectionStatus: ConnectionStatus
}

export function AppHeader({ connectionStatus }: AppHeaderProps) {
  const connected = connectionStatus === 'connected'

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>{PROJECT_NAME}</span>
      </div>
      <div className={`connection-badge ${connectionStatus}`} role="status">
        {connected ? 'Connected' : 'Disconnected'}
      </div>
    </header>
  )
}
