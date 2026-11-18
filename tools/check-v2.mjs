// Prüft Website v2: Screenshots an festen Stellen + Live-Element (Angebot) bis ins Auftragsbuch
// Aufruf: node tools/check-v2.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://localhost:4174/'
const out = 'shots/v2'
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--force-prefers-reduced-motion=0'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let fail = 0
const ok = (c, msg) => { console.log(c ? 'OK  ' : 'FAIL', msg); if (!c) fail++ }

// Abmahnfallen B2/B3: frischer Besuch, nur laden und scrollen. Keine fremden Server, kein Speicher.
{
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  const foreign = new Set()
  const host = new URL(base).host
  p.on('request', (r) => { const u = new URL(r.url()); if (!['data:', 'blob:'].includes(u.protocol) && u.host !== host) foreign.add(u.host) })
  await p.goto(base, { waitUntil: 'networkidle0' })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } })
  await wait(800)
  const store = await p.evaluate(async () => ({ ls: localStorage.length, ss: sessionStorage.length, cookie: document.cookie, idb: (await indexedDB.databases()).map((d) => d.name) }))
  ok(foreign.size === 0, `B2: keine Anfragen an fremde Server (${[...foreign].join(', ')})`)
  ok(store.ls === 0 && store.ss === 0 && !store.cookie && store.idb.length === 0, `B3: kein Speicher nach Laden ${JSON.stringify(store)}`)
  await ctx.close()
}

for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await browser.newPage()
  await p.setViewport(vp)
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
  await p.goto(base, { waitUntil: 'networkidle0' })
  await p.evaluate(() => localStorage.setItem('zaidel-fx', 'on'))
  await p.reload({ waitUntil: 'networkidle0' })

  // Hero: Bildwechsel beim Scrollen
  const t0 = await p.$eval('[aria-live=polite]', (e) => e.textContent)
  await p.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9))
  await wait(1200)
  const t1 = await p.$eval('[aria-live=polite]', (e) => e.textContent)
  ok(t0 !== t1, `${name}: Hero wechselt Bild (${t0} -> ${t1})`)
  await p.screenshot({ path: `${out}/${name}-hero2.png` })

  for (const id of ['arbeiten', 'angebot', 'kontakt', 'anfrage']) {
    await p.evaluate((id) => document.getElementById(id).scrollIntoView(), id)
    await wait(1300)
    await p.screenshot({ path: `${out}/${name}-${id}.png` })
  }
  // Abschnitt mit Zitat und Footer
  await p.evaluate(() => document.querySelector('[aria-label=Kundenstimme]').scrollIntoView())
  await wait(1300)
  await p.screenshot({ path: `${out}/${name}-zitat.png` })
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await wait(1300)
  await p.screenshot({ path: `${out}/${name}-footer.png` })

  // Angebots-Überschrift darf von nichts verdeckt sein
  await p.evaluate(() => document.getElementById('angebot').scrollIntoView())
  await wait(600)
  const covered = await p.evaluate(() => {
    const h = document.querySelector('#angebot h2').getBoundingClientRect()
    const el = document.elementFromPoint(h.left + h.width / 2, h.top + h.height / 2)
    return el?.closest('#angebot') ? null : el?.outerHTML.slice(0, 80)
  })
  ok(!covered, `${name}: Angebots-Überschrift frei ${covered ?? ''}`)

  // Live-Element: Hangmauer 20 m wählen, übernehmen, Formular abschicken
  await p.evaluate(() => [...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.includes('Hangmauer')).click())
  await p.evaluate(() => {
    const r = document.querySelector('#angebot input[type=range]')
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    set.call(r, '20')
    r.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await wait(200)
  const menge = await p.evaluate(() => [...document.querySelectorAll('#angebot tbody tr')].map((tr) => tr.textContent).find((t) => t.includes('Drainrohr')))
  ok(menge?.includes('20'), `${name}: Rechner zeigt Drainrohr 20 m (${menge})`)
  await p.evaluate(() => [...document.querySelectorAll('#angebot button')].find((b) => b.textContent.includes('Mit diesen Angaben')).click())
  await wait(1200)
  const msg = await p.$eval('#anfrage textarea', (t) => t.value)
  ok(msg.includes('Hangmauer aus Sandstein, etwa 20 m'), `${name}: Formular vorbelegt`)
  const topic = await p.evaluate(() => [...document.querySelectorAll('#anfrage [aria-pressed=true]')].map((b) => b.textContent).join())
  ok(topic.includes('Mauer'), `${name}: Thema gewählt (${topic})`)
  await p.type('#anfrage input[autocomplete=name]', `Test ${name}`)
  await p.type('#anfrage input[type=tel]', '0170 1234567')
  await p.click('#anfrage input[type=checkbox]')
  await p.evaluate(() => [...document.querySelectorAll('#anfrage button')].find((b) => b.textContent.includes('Anfrage senden')).click())
  await p.waitForFunction(() => document.body.innerText.includes('Im Auftragsbuch ansehen'), { timeout: 8000 })
  ok(true, `${name}: Anfrage gesendet`)
  await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.textContent.includes('Im Auftragsbuch ansehen')).click())
  await wait(1500)
  const hash = await p.evaluate(() => location.hash)
  ok(hash.includes('/app/auftraege/'), `${name}: Auftragsbuch geöffnet (${hash})`)

  // Überlauf
  await p.goto(base, { waitUntil: 'networkidle0' })
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  ok(over <= 0, `${name}: kein Überlauf (${over})`)
  ok(errs.length === 0, `${name}: keine JS-Fehler ${errs.join(' | ')}`)
  await p.close()
}
await browser.close()
console.log(fail ? `${fail} FAIL` : 'alles OK')
process.exit(fail ? 1 : 0)
