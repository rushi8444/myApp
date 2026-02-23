import { useState } from 'react'
import './App.css'

function App() {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isFormatted, setIsFormatted] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy text.')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!value.trim()) {
      setError('Please enter text first.')
      return
    }

    setError('')
    setIsSubmitting(true)
    https://my-app-seven-sigma-11.vercel.app/
    try {
      const response = await fetch('https://my-app-seven-sigma-11.vercel.app/api/format-text', {
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
      setIsFormatted(true)
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
            onChange={(event) => {
              setValue(event.target.value)
              setIsFormatted(false)
            }}
            placeholder="Enter text"
          />
          <div className="button-group">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Formatting...' : 'Submit'}
            </button>
            {isFormatted && (
              <button type="button" onClick={handleCopy} className="copy-btn" disabled={isSubmitting}>
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            )}
          </div>
          {error && <p className="error-text">{error}</p>}
        </form>
      </section>
    </main>
  )
}

export default App
