import { useState } from 'react'
import { Board } from './components/Board'
import { CompletedView } from './components/CompletedView'
import { TrashView } from './components/TrashView'

type View = 'board' | 'completed' | 'trash'

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'board', label: 'ボード' },
  { view: 'completed', label: '完了済み一覧' },
  { view: 'trash', label: 'ゴミ箱' },
]

function App() {
  const [view, setView] = useState<View>('board')

  return (
    <div className="min-h-screen bg-bg">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold text-text">Task Management</h1>
        <nav className="flex gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              type="button"
              onClick={() => setView(item.view)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                view === item.view
                  ? 'border-accent bg-accent text-white'
                  : 'border-border text-text-muted hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>
      {view === 'board' && <Board />}
      {view === 'completed' && <CompletedView />}
      {view === 'trash' && <TrashView />}
    </div>
  )
}

export default App
