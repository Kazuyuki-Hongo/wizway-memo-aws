import { useEffect, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export default function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState('')

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

  return (
    <main className="page">
      <h1>wizway-hello-aws</h1>
      <p className="label">GET /hello</p>
      {error ? <p className="error">{error}</p> : <p className="hello">{message}</p>}
      <p className="meta">API: {API_URL || '(unset)'}</p>
    </main>
  )
}
