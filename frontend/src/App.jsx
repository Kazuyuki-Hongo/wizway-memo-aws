import { useCallback, useEffect, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('ja-JP')
  } catch {
    return iso
  }
}

export default function App() {
  const [hello, setHello] = useState('接続確認中…')
  const [helloError, setHelloError] = useState('')
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [itemsError, setItemsError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!API_URL) {
      setHello('VITE_API_URL 未設定')
      return
    }

    fetch(`${API_URL}/hello`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setHello(data.message || 'OK'))
      .catch((err) => setHelloError(String(err)))
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

  async function removeItem(id) {
    if (!API_URL) return
    setBusy(true)
    setItemsError('')
    try {
      const res = await fetch(`${API_URL}/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadItems()
    } catch (err) {
      setItemsError(String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">wizway-memo-aws · サンプルお題</p>
        <h1>雑メモボード</h1>
        <p className="lead">
          React（ブラウザ）→ API Gateway → Lambda → DynamoDB。
          追加したメモは再読み込みしても残る。
        </p>
        <p className="status">
          API 疎通: {helloError ? <span className="error">{helloError}</span> : hello}
        </p>
      </header>

      <section className="items">
        <h2>メモ一覧</h2>
        <form className="item-form" onSubmit={addItem}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="メモを書く（例: 牛乳買う）"
            maxLength={200}
            disabled={!API_URL || busy}
          />
          <button type="submit" disabled={!API_URL || busy || !title.trim()}>
            追加
          </button>
        </form>
        {itemsError ? <p className="error">{itemsError}</p> : null}
        <ul className="item-list">
          {items.length === 0 ? <li className="muted">まだメモがありません</li> : null}
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span className="muted">{formatTime(item.createdAt)}</span>
              </div>
              <button
                type="button"
                className="ghost"
                disabled={busy}
                onClick={() => removeItem(item.id)}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="meta">API: {API_URL || '(unset)'} · GET/POST /items · DELETE /items/&#123;id&#125;</p>
    </main>
  )
}
