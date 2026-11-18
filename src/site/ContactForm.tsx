import clsx from 'clsx'
import { ArrowRight, Check, ImagePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const TOPICS = ['Pflaster / Einfahrt', 'Mauer / Naturstein', 'Treppe', 'Terrasse', 'Zaun / Sichtschutz', 'Garten neu anlegen', 'Gartenpflege', 'Sonstiges']

const field =
  'w-full border border-white/30 bg-white/[0.07] px-4 py-3 text-white placeholder:text-white/60 focus:border-moss-300 focus:bg-white/10'

export type Prefill = { topic: string; message: string; stamp: number }

export default function ContactForm({ prefill }: { prefill?: Prefill }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', street: '', zip: '', city: '', message: '' })
  const [topics, setTopics] = useState<string[]>([])

  // Angaben aus „Was steht in Ihrem Angebot?“ übernehmen
  useEffect(() => {
    if (!prefill) return
    setTopics((t) => (t.includes(prefill.topic) ? t : [...t, prefill.topic]))
    setF((x) => ({ ...x, message: prefill.message }))
  }, [prefill])
  const [files, setFiles] = useState<File[]>([])
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [jobId, setJobId] = useState<string>()

  const valid = f.name.trim() && (f.phone.trim() || f.email.trim()) && f.message.trim() && consent

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setState('sending')
    const [{ db, log, nextNumber, uid }, { ensureSeed }, { shrinkImage }] = await Promise.all([import('../crm/db'), import('../crm/seed'), import('../crm/ui')])
    await ensureSeed()
    const customerId = uid()
    await db.customers.add({ id: customerId, kind: 'privat', name: f.name.trim(), street: f.street, zip: f.zip, city: f.city || '–', phone: f.phone, email: f.email, createdAt: Date.now() })
    const id = uid()
    const title = topics.length ? `${topics.join(', ')}` : 'Anfrage über die Website'
    await db.jobs.add({
      id,
      number: await nextNumber('A'),
      title,
      customerId,
      status: 'anfrage',
      street: f.street,
      zip: f.zip,
      city: f.city || '–',
      description: `Anfrage über die Website:\n„${f.message.trim()}“`,
      services: [],
      assignees: [],
      source: 'website',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    for (const file of files) {
      await db.photos.add({ id: uid(), jobId: id, phase: 'vorher', blob: await shrinkImage(file), caption: 'Vom Kunden mitgeschickt', userId: 'u-buero', createdAt: Date.now() })
    }
    await log('u-buero', 'Neue Anfrage über die Website', id)
    setJobId(id)
    setState('done')
  }

  if (state === 'done')
    return (
      <div className="bg-white/[0.07] p-8">
        <div className="grid size-12 place-items-center bg-moss-300 text-moss-950"><Check size={24} strokeWidth={2.5} /></div>
        <h3 className="mt-5 text-2xl font-bold text-white">Danke, {f.name.split(' ')[0]}.</h3>
        <p className="mt-2 text-white/80">Ihre Anfrage ist bei uns angekommen. Wir melden uns in der Regel innerhalb von zwei Werktagen, meistens telefonisch.</p>
        <div className="mt-6 bg-moss-300 p-4 text-moss-950">
          <strong>Demo:</strong> Die Anfrage liegt jetzt als neuer Auftrag im Auftragsbuch, mit Kontaktdaten{files.length ? ' und Fotos' : ''}.
          <Link to={`/app/auftraege/${jobId}`} className="mt-2 flex items-center gap-1.5 font-bold hover:underline">Im Auftragsbuch ansehen <ArrowRight size={15} /></Link>
        </div>
      </div>
    )

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <div className="mb-2 font-medium text-white/80">Worum geht es?</div>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTopics(topics.includes(t) ? topics.filter((x) => x !== t) : [...topics, t])}
              aria-pressed={topics.includes(t)}
              className={clsx('press h-11 px-3.5 transition-colors', topics.includes(t) ? 'bg-moss-300 font-medium text-moss-950' : 'bg-white/[0.07] text-white hover:bg-white/15')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={clsx(field, 'sm:col-span-2')} placeholder="Ihr Name *" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        <input className={field} placeholder="Telefon" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
        <input className={field} placeholder="E-Mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
        <input className={clsx(field, 'sm:col-span-2')} placeholder="Straße (wo soll gebaut werden?)" value={f.street} onChange={(e) => setF({ ...f, street: e.target.value })} autoComplete="street-address" />
        <input className={field} placeholder="PLZ" inputMode="numeric" value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value })} autoComplete="postal-code" />
        <input className={field} placeholder="Ort" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} autoComplete="address-level2" />
        <textarea className={clsx(field, 'sm:col-span-2')} rows={4} placeholder="Was haben Sie vor? Größe, Wünsche, Zeitraum … *" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
      </div>

      <div>
        {/* echte Ablagefläche für Dateien, darum gestrichelt. taste-skill-ignore */}
        <label className="flex cursor-pointer items-center gap-3 border border-dashed border-white/40 px-4 py-3 text-white/85 hover:border-white/70">
          <ImagePlus size={18} />
          <span>Fotos vom Garten anhängen <span className="text-white/70">(optional)</span></span>
          <input type="file" accept="image/*" multiple hidden onChange={(e) => (setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, 6)), (e.target.value = ''))} />
        </label>
        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-white/10 t-small py-1 pr-1.5 pl-3 text-white">
                {file.name.length > 22 ? file.name.slice(0, 20) + '…' : file.name}
                <button type="button" onClick={() => setFiles(files.filter((_, k) => k !== i))} className="grid size-5 place-items-center rounded-full hover:bg-white/15" aria-label="Entfernen"><X size={12} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <label className="t-small flex items-start gap-3 text-white/80">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-moss-300" />
        <span>Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden. Details in der <Link to="/datenschutz" className="underline">Datenschutzerklärung</Link>.</span>
      </label>

      <button disabled={!valid || state === 'sending'} className="btn w-full disabled:opacity-50 sm:w-auto">
        {state === 'sending' ? 'Wird gesendet …' : <>Anfrage senden <ArrowRight size={17} /></>}
      </button>
      <p className="t-small text-white/75">* Pflichtfelder. Telefon oder E-Mail reicht.</p>
    </form>
  )
}
