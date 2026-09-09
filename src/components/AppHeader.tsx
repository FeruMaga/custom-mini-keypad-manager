import { PROJECT_NAME } from '../data/actions'
export function AppHeader() {
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
    </header>
  )
}
