import { AppHeader } from './components/AppHeader'
import { DevicePreview } from './components/DevicePreview'
import { ShortcutEditor } from './components/ShortcutEditor'
import { useAssignments } from './hooks/useAssignments'
import { useDeviceConnection } from './hooks/useDeviceConnection'
import './App.css'
function App() {
  const { selected, select, assignment, update } = useAssignments()
  const connectionStatus = useDeviceConnection()
  return (
    <div className="app-shell">
      <AppHeader connectionStatus={connectionStatus} />
      <main className="workspace">
        <DevicePreview selected={selected} onSelect={select} />
        <ShortcutEditor
          selected={selected}
          onSelectControl={select}
          assignment={assignment}
          onChange={update}
        />
      </main>
    </div>
  )
}
export default App
