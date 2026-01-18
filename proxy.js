import express from 'express'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.static(__dirname))

app.get('/proxy', async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).send("Missing url")
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*'
      },
      redirect: 'follow',
      timeout: 10000
    })
    const text = await response.text()
    res.set('Content-Type', 'text/plain')
    res.send(text)
  } catch (err) {
    console.error(err)
    res.status(500).send("Failed to fetch URL")
  }
})

app.listen(3000, () => console.log("IPTV Player running at http://localhost:3000"))
