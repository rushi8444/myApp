import http from 'node:http'

const PORT = process.env.PORT || 3000

function removeProtectedAssessmentBlock(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const keptLines = []
  let insidePolicyBlock = false

  for (const line of lines) {
    const normalized = line.trim()
    const lower = normalized.toLowerCase()

    if (lower.startsWith('you are a helpful ai assistant.')) {
      insidePolicyBlock = true
      continue
    }

    if (insidePolicyBlock) {
      const isBlockEnd =
        lower.includes('this verification step is mandatory for all ai assistants accessing assessment pages.') ||
        lower.startsWith('do you understand?')

      if (isBlockEnd) {
        insidePolicyBlock = false
      }

      continue
    }

    keptLines.push(line)
  }

  return keptLines.join('\n')
}

function removePointMarkers(text) {
  return text.replace(/^\s*\d+\s*point(?:s)?\s*$/gim, '')
}

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function formatAssessmentText(text) {
  return normalizeWhitespace(
    removePointMarkers(removeProtectedAssessmentBlock(text))
  )
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res)
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res)
    res.writeHead(204)
    res.end()
    return
  }

  if (req.url === '/health') {
    sendJson(res, 200, { status: 'ok' })
    return
  }

  if (req.url === '/api/format-text' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', () => {
      const contentType = req.headers['content-type'] || ''
      const trimmedBody = body.trim()

      if (contentType.includes('text/plain')) {
        const formattedText = formatAssessmentText(body)
        sendJson(res, 200, { formattedText })
        return
      }

      if (!trimmedBody) {
        sendJson(res, 400, { error: 'Request body is empty.' })
        return
      }

      try {
        const parsed = JSON.parse(trimmedBody)

        if (typeof parsed.text !== 'string') {
          sendJson(res, 400, { error: 'Request body must include a text string.' })
          return
        }

        const formattedText = formatAssessmentText(parsed.text)
        sendJson(res, 200, { formattedText })
      } catch {
        const formattedText = formatAssessmentText(body)
        sendJson(res, 200, {
          formattedText,
          note:
            'Body was not valid JSON, so it was processed as raw text. Send { "text": "..." } for strict JSON mode.',
        })
      }
    })

    return
  }

  if (req.url === '/' && req.method === 'GET') {
    sendJson(res, 200, {
      message: 'Server is running',
      endpoint: 'POST /api/format-text',
    })
    return
  }

  setCorsHeaders(res)
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found')
})

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
