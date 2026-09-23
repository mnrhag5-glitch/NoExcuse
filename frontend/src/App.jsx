import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

function formatRemaining(deadline) {
  const distance = new Date(deadline).getTime() - Date.now()
  if (distance <= 0) return 'Past due'
  const hours = Math.floor(distance / 3600000)
  const minutes = Math.floor((distance % 3600000) / 60000)
  return hours ? `${hours}h ${minutes}m left` : `${minutes}m left`
}

function formatCountdown(deadline, now) {
  const distance = Math.max(0, new Date(deadline).getTime() - now)
  const days = Math.floor(distance / 86400000)
  const hours = Math.floor((distance % 86400000) / 3600000)
  const minutes = Math.floor((distance % 3600000) / 60000)
  const seconds = Math.floor((distance % 60000) / 1000)
  if (!distance) return 'TIME IS UP'
  return `${days ? `${days}d ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} REMAINING`
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api(`/user/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: JSON.stringify(form),
      })
      onAuthenticated(data.user)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="grain" />
        <div className="brand-mark">N<span>/</span>E</div>
        <div className="art-copy">
          <p className="eyebrow">THE 24-HOUR RULE</p>
          <h1>Make time<br /><em>count.</em></h1>
          <p>Small promises. Sharp focus.<br />A better you, one task at a time.</p>
        </div>
        <div className="art-footer"><span>01</span><span className="line" /><span>FOCUS / FINISH / REPEAT</span></div>
      </section>
      <section className="auth-panel">
        <div className="mobile-brand">N<span>/</span>E</div>
        <div className="auth-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>{mode === 'login' ? 'Enter your space.' : 'Start your streak.'}</h2>
          <p className="subtle">{mode === 'login' ? 'Log in to pick up where you left off.' : 'Create an account and make today intentional.'}</p>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>FULL NAME<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Alex Morgan" /></label>
            )}
            <label>EMAIL<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
            <label>PASSWORD<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="••••••••" /></label>
            {error && <div className="form-error">{error}</div>}
            <button className="primary-button" disabled={busy}>{busy ? 'PLEASE WAIT…' : mode === 'login' ? 'LOG IN  →' : 'CREATE ACCOUNT  →'}</button>
          </form>
          <p className="switch-auth">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create account' : 'Log in'}</button></p>
        </div>
        <div className="auth-note">PRIVATE BY DEFAULT <span>✦</span> BUILT FOR MOMENTUM</div>
      </section>
    </main>
  )
}

function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [historyTasks, setHistoryTasks] = useState([])
  const [form, setForm] = useState({ title: '', description: '', deadline: '', duration: '60' })
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [missedTask, setMissedTask] = useState(null)
  const notifiedMisses = useRef(new Set())
  const [theme, setTheme] = useState(() => localStorage.getItem('no-excuses-theme') || 'dark')
  const [historyOpen, setHistoryOpen] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      const data = await api('/task/getTasks')
      setTasks(data.tasks || [])
    } catch (loadError) {
      if (loadError.message.toLowerCase().includes('unauthorized')) onLogout()
      else setError(loadError.message)
    }
  }, [onLogout])
  const loadHistory = useCallback(async () => {
    try {
      const data = await api('/task/history')
      setHistoryTasks(data.tasks || [])
    } catch (historyError) {
      if (historyError.message.toLowerCase().includes('unauthorized')) onLogout()
      else setError(historyError.message)
    }
  }, [onLogout])

  useEffect(() => { loadTasks(); loadHistory() }, [loadTasks, loadHistory])
  useEffect(() => {
    const timer = setInterval(loadTasks, 60000)
    return () => clearInterval(timer)
  }, [loadTasks])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    const newlyMissed = tasks.find((task) => !task.completed && new Date(task.deadline).getTime() <= now && !notifiedMisses.current.has(task._id))
    if (newlyMissed) {
      notifiedMisses.current.add(newlyMissed._id)
      setMissedTask(newlyMissed)
    }
  }, [tasks, now])

  const saveTask = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const duration = Number(form.duration)
      if (!Number.isInteger(duration) || duration < 1) throw new Error('Enter a duration of at least 1 minute.')
      const deadline = new Date(Date.now() + duration * 60000)
      const endpoint = editingTask ? `/task/updateTask/${editingTask._id}` : '/task/createTasks'
      const data = await api(endpoint, { method: editingTask ? 'PUT' : 'POST', body: JSON.stringify({ ...form, deadline: deadline.toISOString() }) })
      setForm({ title: '', description: '', deadline: '', duration: '60' })
      setEditingTask(null)
      setNotice(editingTask ? 'Task updated. Your new countdown is live.' : 'Task added to your list. The clock is live.')
      if (editingTask) {
        setTasks((currentTasks) => currentTasks.map((task) => task._id === editingTask._id ? data.task : task))
        await loadHistory()
      } else if (data.task) {
        setTasks((currentTasks) => [data.task, ...currentTasks])
        setHistoryTasks((currentTasks) => [data.task, ...currentTasks])
      } else {
        await Promise.all([loadTasks(), loadHistory()])
      }
    } catch (createError) { setError(createError.message) } finally { setBusy(false) }
  }

  const editTask = (task) => {
    const deadline = new Date(task.deadline)
    const pad = (number) => String(number).padStart(2, '0')
    setEditingTask(task)
    const remainingMinutes = Math.max(1, Math.ceil((deadline.getTime() - Date.now()) / 60000))
    setForm({
      title: task.title,
      description: task.description,
      duration: String(remainingMinutes),
      deadline: `${pad(deadline.getDate())}-${pad(deadline.getMonth() + 1)}-${deadline.getFullYear()} ${pad(deadline.getHours())}:${pad(deadline.getMinutes())}`,
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setForm({ title: '', description: '', deadline: '', duration: '60' })
  }

  const completeTask = async (id) => {
    const task = tasks.find((item) => item._id === id)
    if (task && new Date(task.deadline).getTime() <= Date.now()) {
      setMissedTask(task)
      return
    }
    try {
      await api(`/task/completeTask/${id}`, { method: 'PUT' })
      setNotice('That is a win. Keep the streak alive.')
      await loadTasks()
    } catch (taskError) {
      if (taskError.message.toLowerCase().includes('deadline')) setMissedTask(task)
      else setError(taskError.message)
    }
  }

  const archiveTask = async (id) => {
    try { await api(`/task/archiveTask/${id}`, { method: 'PUT' }); await Promise.all([loadTasks(), loadHistory()]); setNotice('Task moved to your history.') }
    catch (taskError) { setError(taskError.message) }
  }
  const deleteHistoryTask = async (id) => {
    try { await api(`/task/deleteTask/${id}`, { method: 'DELETE' }); await loadHistory(); setNotice('History item permanently deleted.') }
    catch (taskError) { setError(taskError.message) }
  }
  const deleteAllHistory = async () => {
    if (!historyTasks.length || !window.confirm('Delete your complete task history permanently?')) return
    try { await api('/task/history', { method: 'DELETE' }); setHistoryTasks([]); setTasks([]); setNotice('All task history deleted.') }
    catch (taskError) { setError(taskError.message) }
  }

  const visibleTasks = useMemo(() => tasks.filter((task) => filter === 'all' || (filter === 'done' ? task.completed : !task.completed)), [tasks, filter])
  const completed = historyTasks.filter((task) => task.completed).length
  const missed = historyTasks.filter((task) => !task.completed && new Date(task.deadline).getTime() <= now).length
  const pending = historyTasks.length - completed - missed
  const nextTask = tasks.find((task) => !task.completed && new Date(task.deadline) > new Date())
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('no-excuses-theme', nextTheme)
  }

  return (
    <main className={`dashboard ${theme}-theme`}>
      {missedTask && <div className="missed-overlay" role="alertdialog" aria-modal="true"><div className="missed-modal"><div className="missed-icon">!</div><p className="eyebrow">DEADLINE MISSED</p><h2>Time's up.</h2><p><strong>{missedTask.title}</strong> was not finished in time. No excuses — reset your focus and take the next one seriously.</p><div className="missed-actions"><button className="primary-button" onClick={() => setMissedTask(null)}>I'LL DO BETTER</button><button className="cancel-button" onClick={() => { setMissedTask(null); editTask(missedTask) }}>EDIT THIS TASK</button></div></div></div>}
      <nav className="topbar">
        <div className="brand">N<span>/</span>E <small>NO EXCUSES</small></div>
        <div className="top-actions"><button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☼' : '◐'}</button><span className="user-chip">{user?.fullName?.slice(0, 1).toUpperCase() || 'U'}</span><span className="user-name">{user?.fullName || 'Focused human'}</span><button className="logout" onClick={onLogout}>LOG OUT</button></div>
      </nav>
      <div className="dashboard-content">
        <header className="dashboard-header"><div><p className="eyebrow">WEDNESDAY / YOUR COMMAND CENTER</p><h1>Good to see you,<br /><em>{user?.fullName?.split(' ')[0] || 'friend'}.</em></h1></div><div className="date-stamp">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}<br /><span>24 HOUR MODE</span></div></header>
        <section className="stats"><div><strong>{tasks.length.toString().padStart(2, '0')}</strong><span>TOTAL TASKS</span></div><div><strong>{completed.toString().padStart(2, '0')}</strong><span>COMPLETED</span></div><div><strong>{tasks.length ? Math.round((completed / tasks.length) * 100) : 0}<small>%</small></strong><span>FINISH RATE</span></div><div className="next-up"><span>NEXT UP</span><strong>{nextTask ? nextTask.title : 'Nothing pending'}</strong><small>{nextTask ? formatRemaining(nextTask.deadline) : 'Enjoy the quiet.'}</small></div></section>
        <section className={`history-panel ${historyOpen ? 'history-expanded' : ''}`}>
          <button className="history-toggle" onClick={() => setHistoryOpen((open) => !open)} aria-expanded={historyOpen}>
            <span className="history-toggle-icon">↗</span>
            <span><small>PERSONAL RECORD</small><strong>Task history</strong></span>
            <span className="history-toggle-meta">{historyTasks.length} {historyTasks.length === 1 ? 'TASK' : 'TASKS'} <b>{historyOpen ? '−' : '+'}</b></span>
          </button>
          {historyOpen && <div className="history-details">
            <div className="history-heading"><p className="eyebrow">EVERY TASK YOU HAVE WRITTEN</p><span className="history-count">{completed} DONE · {missed} MISSED · {pending} OPEN</span></div>
            <div className="history-actions"><span>{completed} DONE · {missed} MISSED · {pending} OPEN</span><button onClick={deleteAllHistory} disabled={!historyTasks.length}>DELETE ALL</button></div>
            {historyTasks.length ? <div className="history-list">{historyTasks.map((task, index) => {
              const isMissed = !task.completed && new Date(task.deadline).getTime() <= now
              const status = task.completed ? 'COMPLETED' : isMissed ? 'MISSED' : 'OPEN'
              return <div className="history-row" key={task._id}><span className="history-number">{String(index + 1).padStart(2, '0')}</span><div className="history-task"><strong>{task.title}</strong><span>{task.description}</span></div><span className={`history-status ${status.toLowerCase()}`}>{status}</span><time>{new Date(task.deadline).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</time><button className="history-delete" onClick={() => deleteHistoryTask(task._id)}>DELETE</button></div>
            })}</div> : <p className="history-empty">Your written tasks will appear here and stay in your personal record.</p>}
          </div>}
        </section>
        <div className="workspace">
          <section className="task-list-section">
            <div className="section-heading"><div><p className="eyebrow">YOUR LIST</p><h2>Keep moving.</h2></div><div className="filters">{['all', 'active', 'done'].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
            {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
            {error && <div className="form-error">{error}</div>}
            <div className="task-list">{visibleTasks.length ? visibleTasks.map((task, index) => <article className={`task-card ${task.completed ? 'is-done' : ''}`} key={task._id}><div className="task-index">0{index + 1}</div><div className="task-main"><div className="task-title-row"><h3>{task.title}</h3><span className="task-state">{task.completed ? 'DONE' : 'LIVE'}</span></div><p>{task.description}</p><div className="countdown">{task.completed ? 'COMPLETED ON TIME' : formatCountdown(task.deadline, now)}</div><span className={`deadline ${new Date(task.deadline) < new Date() && !task.completed ? 'late' : ''}`}>{task.completed ? '✓ COMPLETED' : `DEADLINE ${new Date(task.deadline).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`}</span></div><div className="task-actions">{!task.completed && <button className="finish-button" onClick={() => completeTask(task._id)}>MARK DONE</button>}<button className="edit-button" onClick={() => editTask(task)}>EDIT</button>            <button className="delete-button" onClick={() => archiveTask(task._id)} aria-label="Remove task">REMOVE</button></div></article>) : <div className="empty-state"><span>✦</span><h3>Clear mind. Open space.</h3><p>Add a task to start your next 24 hours.</p></div>}</div>
          </section>
          <aside className="add-panel"><p className="eyebrow">{editingTask ? 'EDIT COMMITMENT' : 'NEW COMMITMENT'}</p><h2>{editingTask ? <>Refine your<br /><em>next move.</em></> : <>What will you<br /><em>finish today?</em></>}</h2><form onSubmit={saveTask}><label>TASK TITLE<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ship the thing" /></label><label>DESCRIPTION<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Make it specific. Make it real." rows="3" /></label><label>HOW MUCH TIME? <span className="label-hint">MINUTES</span><input required type="number" min="1" step="1" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="2" /></label><p className="deadline-help">Set 2 for a two-minute sprint, 60 for an hour, or any time you need.</p><button className="primary-button" disabled={busy}>{busy ? 'SAVING…' : editingTask ? 'SAVE CHANGES  →' : 'ADD TO MY LIST  +'}</button>{editingTask && <button type="button" className="cancel-button" onClick={cancelEdit}>CANCEL EDIT</button>}</form><div className="quote">“The secret of getting ahead is getting started.”<span>— MARK TWAIN</span></div></aside>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  useEffect(() => { api('/user/profile').then((data) => setUser(data.user)).catch(() => {}).finally(() => setChecking(false)) }, [])
  const logout = useCallback(async () => { await api('/user/logout', { method: 'POST' }).catch(() => {}); setUser(null) }, [])
  if (checking) return <div className="loading-screen">LOADING YOUR SPACE<span>✦</span></div>
  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthScreen onAuthenticated={setUser} />
}

export default App
