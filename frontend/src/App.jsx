import { useCallback, useEffect, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [itemsError, setItemsError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!API_URL) {
      setMessage('(VITE_API_URL 未設定 — ローカル確認用)')
      return
    }

    fetch(`${API_URL}/hello`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setMessage(data.message || JSON.stringify(data)))
      .catch((err) => setError(String(err)))
  }, [])

  const loadItems = useCallback(async () => {
    if (!API_URL) return
    setItemsError('')
    try {
      const res = await fetch(`${API_URL}/items`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      setItemsError(String(err))
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  async function addItem(e) {
    e.preventDefault()
    if (!API_URL || !title.trim()) return
    setBusy(true)
    setItemsError('')
    try {
      const res = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTitle('')
      await loadItems()
    } catch (err) {
      setItemsError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <h1>wizway-hello-aws</h1>
      <p className="label">GET /hello</p>
      {error ? <p className="error">{error}</p> : <p className="hello">{message}</p>}

      <section className="items">
        <h2>Items（DynamoDB）</h2>
        <p className="label">GET / POST /items — クラウドでは表に残る</p>
        <form className="item-form" onSubmit={addItem}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            disabled={!API_URL || busy}
          />
          <button type="submit" disabled={!API_URL || busy || !title.trim()}>
            追加
          </button>
        </form>
        {itemsError ? <p className="error">{itemsError}</p> : null}
        <ul className="item-list">
          {items.length === 0 ? <li className="muted">まだありません</li> : null}
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span className="muted">{item.createdAt}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="meta">API: {API_URL || '(unset)'}</p>
    </main>
  )
}
