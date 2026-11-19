// Screenshots vom Seitenende (letzte 2 Bildschirme) aller vier Seiten. Aufruf: node tools/shot-end.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173/'
mkdirSync('shots/end', { recursive: true })
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
for (const [w, h] of [[1440, 900], [390, 844]]) {
  await p.setViewport({ width: w, height: h })
  for (const page of ['', 'arbeiten', 'ablauf', 'kontakt']) {
    await p.goto(base + '#/' + page, { waitUntil: 'networkidle0' })
    await p.evaluate(() => document.documentElement.classList.add('calm'))
    const H = await p.evaluate(() => document.documentElement.scrollHeight)
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), H - 2 * h)
    await new Promise((r) => setTimeout(r, 400))
    await p.screenshot({ path: `shots/end/${page || 'start'}-${w}.png`, fullPage: false, clip: { x: 0, y: H - 2 * h, width: w, height: 2 * h }, captureBeyondViewport: true })
  }
}
await b.close()
console.log('ok')
