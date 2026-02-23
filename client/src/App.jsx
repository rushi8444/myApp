import { useState } from 'react'
import './App.css'

function App() {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!value.trim()) {
      setError('Please enter text first.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:3000/api/format-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: value }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to format text.')
        return
      }

      setValue(data.formattedText || '')
    } catch {
      setError('Unable to reach API server. Make sure it is running on port 3000.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="form-card">
        <h1>Coursera Text Formatter</h1>
        <p className="subtitle">Paste your content and get a clean formatted version.</p>

        <form className="home-form" onSubmit={handleSubmit}>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter text"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Formatting...' : 'Submit'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </section>
    </main>
  )
}

export default App
