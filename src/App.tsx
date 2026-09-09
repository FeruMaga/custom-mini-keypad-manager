import { AppHeader } from './components/AppHeader'
import { DevicePreview } from './components/DevicePreview'
import { ShortcutEditor } from './components/ShortcutEditor'
import { useAssignments } from './hooks/useAssignments'
import './App.css'
function App() {
  const { selected, select, assignment, update, status } = useAssignments()
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="workspace">
        <DevicePreview selected={selected} onSelect={select} />
        <ShortcutEditor
          selected={selected}
          assignment={assignment}
          onChange={update}
          status={status}
        />
      </main>
    </div>
  )
}
export default App
