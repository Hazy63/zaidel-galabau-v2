// End-to-End-Prüfung der Kernabläufe. Aufruf: node tools/e2e.mjs [baseUrl]
import puppeteer from 'puppeteer-core'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:4173/'
mkdirSync('shots', { recursive: true })
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
await p.setViewport({ width: 1280, height: 900 })
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
p.on('dialog', (d) => d.accept())
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const ok = (cond, msg) => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`)
  if (!cond) process.exitCode = 1
}
const clickText = async (sel, text) => {
  const h = await p.evaluateHandle((s, t) => [...document.querySelectorAll(s)].find((e) => e.textContent.trim().includes(t)), sel, text)
  if (!h.asElement()) throw new Error(`nicht gefunden: ${sel} "${text}"`)
  await h.asElement().click()
}
const go = async (url) => {
  await p.evaluate((u) => (location.href = u), url)
  await wait(900)
}
const tiny = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
writeFileSync('shots/_test.png', Buffer.from(tiny, 'base64'))

// frischer Zustand
await p.goto(base, { waitUntil: 'networkidle0' })
await p.evaluate(() => new Promise((r) => { localStorage.clear(); const q = indexedDB.deleteDatabase('zaidel-auftragsbuch'); q.onsuccess = q.onerror = q.onblocked = () => r() }))
await p.reload({ waitUntil: 'networkidle0' })

// 1) Kontaktformular -> Anfrage im CRM (v2: Formular im Abschnitt #anfrage)
// sofort springen: die Seite scrollt sonst weich über viele Bildschirme, während schon geklickt wird
await p.evaluate(() => document.getElementById('anfrage').scrollIntoView({ behavior: 'instant' }))
await wait(1000)
await clickText('#anfrage button', 'Terrasse')
await p.type('#anfrage input[placeholder^="Ihr Name"]', 'Erika Muster')
await p.type('#anfrage input[placeholder="Telefon"]', '0171 1234567')
await p.type('#anfrage input[placeholder="Ort"]', 'Miltenberg')
await p.type('#anfrage textarea', 'Terrasse ca. 25 m², gerne Naturstein.')
const fileInput = await p.$('#anfrage input[type=file]')
await fileInput.uploadFile('shots/_test.png')
await p.click('#anfrage input[type=checkbox]')
await clickText('#anfrage button', 'Anfrage senden')
await wait(1200)
const done = await p.evaluate(() => document.body.innerText.includes('Danke, Erika'))
ok(done, 'Formular abgeschickt, Danke-Seite')
await clickText('a', 'Im Auftragsbuch ansehen')
await wait(800)
ok(await p.evaluate(() => document.body.innerText.includes('Anmelden')), 'Auftragsbuch verlangt Login')

// Login per PIN
await clickText('button', 'Büro Zaidel')
for (const k of '1234') await p.keyboard.press(k)
await wait(1000)
await p.goto(base + '#/app/auftraege?status=anfrage', { waitUntil: 'networkidle0' })
// auf den Inhalt warten statt fester Pause (war mit 500 ms gelegentlich zu knapp)
const listed = await p
  .waitForFunction(() => document.body.innerText.includes('Terrasse') && document.body.innerText.includes('Erika Muster'), { timeout: 6000 })
  .then(() => true, () => false)
ok(listed, 'Website-Anfrage steht als Auftrag in Liste')
if (!listed) console.log('  sichtbar:', await p.evaluate(() => location.hash + ' | ' + document.body.innerText.slice(0, 300).replace(/\s+/g, ' ')))
await clickText('a', 'Erika Muster')
await wait(600)
const jobUrl = p.url()
ok(await p.evaluate(() => document.body.innerText.includes('Terrasse ca. 25 m²')), 'Nachricht im Auftrag')

// 2) Foto hochladen
await go(jobUrl.split('?')[0] + '?tab=fotos')
await wait(400)
const nBefore = await p.evaluate(() => document.querySelectorAll('img').length)
const gal = (await p.$$('input[type=file]'))[1]
await gal.uploadFile('shots/_test.png')
await wait(1200)
const nAfter = await p.evaluate(() => document.querySelectorAll('img').length)
ok(nAfter === nBefore + 1, `Foto hochgeladen (${nBefore} -> ${nAfter})`)

// 3) Notiz
await go(jobUrl.split('?')[0] + '?tab=notizen')
await p.type('textarea', 'Rückruf erledigt, Termin Freitag 10 Uhr.')
await p.keyboard.press('Enter')
await wait(600)
ok(await p.evaluate(() => document.body.innerText.includes('Termin Freitag 10 Uhr')), 'Notiz gespeichert')

// 4) Angebot aus Katalog, versenden, annehmen, in Rechnung umwandeln
await go(jobUrl.split('?')[0] + '?tab=dokumente')
await clickText('button', 'Angebot erstellen')
await wait(800)
await clickText('button', 'Aus Leistungskatalog')
await wait(300)
await clickText('[role=dialog] button', 'Natursteinpflaster Granit')
await clickText('[role=dialog] button', 'Baustelleneinrichtung')
await p.click('[role=dialog] button[aria-label="Schließen"]')
await wait(900)
const offerUrl = p.url()
const sel = await p.$('select')
await sel.select('angenommen')
await wait(800)
await clickText('button', 'Vorschau')
await wait(300)
const gross = await p.evaluate(() => [...document.querySelectorAll('dd')].map((d) => d.textContent.replace(/\s/g, ' ')).pop())
ok(gross === '675,92 €', `Angebotssumme brutto korrekt (${gross}, erwartet 675,92 € = (118+450)×1,19)`)
const pdf = await p.pdf({ format: 'A4', printBackground: true })
writeFileSync('shots/angebot-test.pdf', pdf)
ok(pdf.length > 20000, `PDF erzeugt (${Math.round(pdf.length / 1024)} KB)`)
await clickText('button', 'In Rechnung umwandeln')
await wait(900)
ok(p.url() !== offerUrl && (await p.evaluate(() => document.body.innerText.includes('Rechnung RE-'))), 'Rechnung aus Angebot erstellt')
await go(jobUrl.split('?')[0])
await wait(400)
ok(await p.evaluate(() => document.body.innerText.includes('Beauftragt')), 'Auftragsstatus nach Annahme: Beauftragt')

// 5) Mitarbeiter sieht keine Preise
await p.evaluate(() => localStorage.setItem('zaidel-session', 'u-tim'))
await p.goto(base + '#/app/auftraege/j1/dokument/d1', { waitUntil: 'domcontentloaded' })
await p.reload({ waitUntil: 'domcontentloaded' })
await wait(500)
const txt = await p.evaluate(() => document.body.innerText)
ok(!txt.includes('Gesamtbetrag') && txt.includes('Preise ausgeblendet'), 'Mitarbeiter: Angebot ohne Preise')
await p.goto(base + '#/app', { waitUntil: 'domcontentloaded' })
await wait(400)
ok(!(await p.evaluate(() => document.body.innerText.includes('Offene Rechnungen'))), 'Mitarbeiter: keine Umsatz-Kacheln')

await b.close()
ok(errs.length === 0, `keine JS-Fehler ${errs.join(' | ')}`)
