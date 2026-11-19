// Prüft Website v2 (vier Seiten): Länge, Screenshots, Hero-Wechsel, Leistungen, Live-Element bis ins Auftragsbuch,
// Abmahnfallen B2/B3. Aufruf: node tools/check-v2.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
const base = process.argv[2] ?? 'http://localhost:4174/'
const out = 'shots/v2'
mkdirSync(out, { recursive: true })
const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let fail = 0
const ok = (c, msg) => { console.log(c ? 'OK  ' : 'FAIL', msg); if (!c) fail++ }
const PAGES = { start: '', arbeiten: '#/arbeiten', ablauf: '#/ablauf', kontakt: '#/kontakt' }

// Abmahnfallen B2/B3: frischer Besuch, nur laden und scrollen. Keine fremden Server, kein Speicher.
{
  const ctx = await browser.createBrowserContext()
  const p = await ctx.newPage()
  const foreign = new Set()
  const host = new URL(base).host
  p.on('request', (r) => { const u = new URL(r.url()); if (!['data:', 'blob:'].includes(u.protocol) && u.host !== host) foreign.add(u.host) })
  for (const h of Object.values(PAGES)) {
    await p.goto(base + h, { waitUntil: 'networkidle0' })
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 50)) } })
  }
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

  // Länge jeder Seite in Bildschirmen + Screenshot jedes Bildschirms
  for (const [pg, h] of Object.entries(PAGES)) {
    await p.goto(base + h, { waitUntil: 'networkidle0' })
    await p.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')))
    await wait(600)
    const screens = await p.evaluate(() => document.documentElement.scrollHeight / window.innerHeight)
    console.log(`     ${name} ${pg}: ${screens.toFixed(1)} Bildschirme`)
    ok(screens < 7, `${name} ${pg}: unter 7 Bildschirmen`)
    for (let s = 0; s * vp.height < screens * vp.height; s++) {
      await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), s * vp.height)
      await wait(900)
      await p.screenshot({ path: `${out}/${name}-${pg}-${s}.png` })
    }
    const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    ok(over <= 0, `${name} ${pg}: kein Überlauf (${over})`)
  }

  // Hero wechselt von selbst
  await p.goto(base, { waitUntil: 'networkidle0' })
  const t0 = await p.$eval('[aria-live=polite]', (e) => e.textContent)
  await wait(6200)
  const t1 = await p.$eval('[aria-live=polite]', (e) => e.textContent)
  ok(t0 !== t1, `${name}: Hero wechselt von selbst (${t0} -> ${t1})`)

  // Leistungen: Auswahl wechselt das Foto
  await p.evaluate(() => [...document.querySelectorAll('#leistungen button')].find((b) => b.textContent.includes('Terrassen')).click())
  await wait(400)
  const cap = await p.$eval('#leistungen figcaption', (e) => e.textContent)
  ok(cap.startsWith('Terrassen'), `${name}: Leistung gewählt (${cap.slice(0, 30)})`)

  // Live-Element: Hangmauer 20 m, übernehmen -> Kontaktseite vorbelegt -> absenden -> Auftragsbuch
  await p.goto(base + PAGES.ablauf, { waitUntil: 'networkidle0' })
  await p.evaluate(() => [...document.querySelectorAll('[role=radio]')].find((b) => b.textContent.includes('Hangmauer')).click())
  await p.evaluate(() => {
    const r = document.querySelector('#angebot input[type=range]')
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(r, '20')
    r.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await wait(200)
  const menge = await p.evaluate(() => [...document.querySelectorAll('#angebot tbody tr')].map((tr) => tr.textContent).find((t) => t.includes('Drainrohr')))
  ok(menge?.includes('20'), `${name}: Rechner zeigt Drainrohr 20 m`)
  await p.evaluate(() => [...document.querySelectorAll('#angebot button')].find((b) => b.textContent.includes('Mit diesen Angaben')).click())
  await wait(1200)
  ok((await p.evaluate(() => location.hash)).startsWith('#/kontakt'), `${name}: weiter zur Kontaktseite`)
  const msg = await p.$eval('#anfrage textarea', (t) => t.value)
  ok(msg.includes('Hangmauer aus Sandstein, etwa 20 m'), `${name}: Formular vorbelegt`)
  const topic = await p.evaluate(() => [...document.querySelectorAll('#anfrage [aria-pressed=true]')].map((b) => b.textContent).join())
  ok(topic.includes('Mauer'), `${name}: Thema gewählt (${topic})`)
  await p.type('#anfrage input[autocomplete=name]', `Test ${name}`)
  await p.type('#anfrage input[type=tel]', '0170 1234567')
  await p.click('#anfrage input[type=checkbox]')
  await p.evaluate(() => [...document.querySelectorAll('#anfrage button')].find((b) => b.textContent.includes('Anfrage senden')).click())
  await p.waitForFunction(() => document.body.innerText.includes('Im Auftragsbuch ansehen'), { timeout: 8000 })
  await p.evaluate(() => [...document.querySelectorAll('a')].find((a) => a.textContent.includes('Im Auftragsbuch ansehen')).click())
  await wait(1500)
  const hash = await p.evaluate(() => location.hash)
  ok(hash.includes('/app/auftraege/'), `${name}: Auftragsbuch geöffnet (${hash})`)

  ok(errs.length === 0, `${name}: keine JS-Fehler ${errs.join(' | ')}`)
  await p.close()
}
await browser.close()
console.log(fail ? `${fail} FAIL` : 'alles OK')
process.exit(fail ? 1 : 0)
