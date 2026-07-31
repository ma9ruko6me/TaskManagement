import { Board } from './components/Board'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-900">Task Management</h1>
      </header>
      <Board />
    </div>
  )
}

export default App
