import { useState } from 'react'
import { Board } from './components/Board'
import { TrashView } from './components/TrashView'

function App() {
  const [view, setView] = useState<'board' | 'trash'>('board')

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-900">Task Management</h1>
        <button
          type="button"
          onClick={() => setView(view === 'board' ? 'trash' : 'board')}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          {view === 'board' ? 'ゴミ箱' : 'ボードに戻る'}
        </button>
      </header>
      {view === 'board' ? <Board /> : <TrashView />}
    </div>
  )
}

export default App
