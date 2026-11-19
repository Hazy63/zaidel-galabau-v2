import clsx from 'clsx'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Phone, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Mark } from '../Logo'
import { img } from '../crm/format'
import ContactForm, { type Prefill } from './ContactForm'
import { AREA, CATS, CONTACT, PROJECTS } from './content'
import { GROUPS, HERO_FRAMES, PLANS, STEPS, fmt } from './content-v2'
import './v2.css'

// Inhalte nur verstecken, wenn JS läuft: ohne Skript bleibt alles sichtbar
document.documentElement.classList.add('js')

type Page = 'start' | 'arbeiten' | 'ablauf' | 'kontakt'

const NAV: { to: string; label: string }[] = [
  { to: '/arbeiten', label: 'Arbeiten' },
  { to: '/ablauf', label: 'Ablauf und Angebot' },
  { to: '/kontakt', label: 'Kontakt' },
]

const d = (n: number) => ({ '--i': n }) as CSSProperties

/** Effekte: folgt der Systemeinstellung, lässt sich im Footer umschalten */
function useCalm() {
  const [calm, setCalm] = useState(() => {
    const saved = localStorage.getItem('zaidel-fx')
    if (saved) return saved === 'off'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    document.documentElement.classList.toggle('calm', calm)
  }, [calm])
  const toggle = () => {
    localStorage.setItem('zaidel-fx', calm ? 'on' : 'off')
    setCalm(!calm)
  }
  return [calm, toggle] as const
}

/** Abschnitte treten einmal ein, sobald sie sichtbar werden */
function useRise(page: Page) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    document.querySelectorAll('[data-rise]:not(.is-in), .drift:not(.is-in)').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [page])
}

export default function Site({ page }: { page: Page }) {
  useRise(page)
  const [calm, toggleCalm] = useCalm()
  const [menu, setMenu] = useState(false)
  const loc = useLocation()

  useEffect(() => setMenu(false), [loc.pathname])
  useEffect(() => {
    document.title = { start: 'Zaidel Garten- und Landschaftsbau · Kleinheubach', arbeiten: 'Arbeiten · Zaidel', ablauf: 'Ablauf und Angebot · Zaidel', kontakt: 'Kontakt · Zaidel' }[page]
  }, [page])

  return (
    <div className="v2">
      {page === 'start' ? (
        <>
          <Hero calm={calm} openMenu={() => setMenu(true)} />
          <About />
          <Services />
          <Quote />
          <CallBand />
        </>
      ) : page === 'arbeiten' ? (
        <>
          <Bar openMenu={() => setMenu(true)} />
          <PageHead title="Unsere Arbeiten" ground="#bbb6ab">Fotos von unseren Baustellen. Antippen, um ein Foto groß zu sehen.</PageHead>
          <Gallery />
          <Showcase />
        </>
      ) : page === 'ablauf' ? (
        <>
          <Bar openMenu={() => setMenu(true)} />
          <PageHead title="So läuft es ab" ground="#bdc2ba">Vom ersten Anruf bis zur fertigen Baustelle. Und was in Ihrem Angebot stehen wird.</PageHead>
          <Steps />
          <Estimate />
        </>
      ) : (
        <>
          <Bar openMenu={() => setMenu(true)} dark />
          <Contact />
          <Inquiry />
        </>
      )}
      <Footer calm={calm} toggleCalm={toggleCalm} />

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--inverse)] px-[var(--margin)] pt-5 pb-8 text-white" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="flex items-center justify-between">
            <Link to="/" className="t-small flex items-center gap-2 font-bold"><Mark className="size-7 text-[var(--accent)]" dot="#fff" /> Zaidel</Link>
            <button onClick={() => setMenu(false)} className="grid size-12 place-items-center" aria-label="Menü schließen"><X size={26} strokeWidth={1.5} /></button>
          </div>
          <nav className="mt-16 flex flex-col">
            <Link to="/" className="press t-head py-2">Start</Link>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="press t-head py-2">{n.label}</Link>
            ))}
          </nav>
          <a href={CONTACT.phoneHref} className="btn mt-auto">{CONTACT.phone}</a>
        </div>
      )}
    </div>
  )
}

/* ---------- Kopfzeile: auf dem Start im Hero, sonst ein schlichter Balken ---------- */

function NavLinks({ dark }: { dark?: boolean }) {
  return (
    <nav className="hidden items-center gap-8 font-medium md:flex">
      {NAV.map((x) => (
        <NavLink key={x.to} to={x.to} className={({ isActive }) => clsx('link-u', isActive && 'font-bold underline decoration-2 underline-offset-8')}>{x.label}</NavLink>
      ))}
      <a href={CONTACT.phoneHref} className={clsx('btn min-h-11 px-4', dark ? '' : 'btn-ink')}><Phone size={16} strokeWidth={1.75} /> {CONTACT.phone}</a>
    </nav>
  )
}

function Bar({ openMenu, dark }: { openMenu: () => void; dark?: boolean }) {
  return (
    <header className={clsx('wrap sticky top-0 z-40 flex h-[64px] items-center justify-between md:h-[76px]', dark ? 'bg-[var(--inverse)] text-white' : 'bg-[var(--bg)]')}>
      <Link to="/" className="t-small flex items-center gap-2 font-bold" aria-label="Zur Startseite">
        <Mark className={clsx('size-7', dark ? 'text-[var(--accent)]' : 'text-[var(--ink)]')} dot={dark ? '#fff' : '#1c211d'} /> Zaidel <span className="hidden font-medium sm:inline">Garten- und Landschaftsbau</span>
      </Link>
      <NavLinks dark={dark} />
      <div className="flex items-center gap-4 md:hidden">
        <a href={CONTACT.phoneHref} className={clsx('btn min-h-11 px-3', dark ? '' : 'btn-ink')}><Phone size={16} strokeWidth={1.75} /> Anrufen</a>
        <button onClick={openMenu} className="h-11 px-1 font-bold">Menü</button>
      </div>
    </header>
  )
}

function PageHead({ title, ground, children }: { title: string; ground: string; children: ReactNode }) {
  return (
    <section data-rise className="wrap flex flex-col justify-end pt-20 pb-10 md:min-h-[42svh] md:pb-14" style={{ backgroundColor: ground }}>
      <h1 style={d(0)} className="t-head">{title}</h1>
      <p style={d(1)} className="t-lead mt-6 max-w-[40ch] font-bold">{children}</p>
    </section>
  )
}

/* ---------- Hero: der Name als Monument, die Baustellen wechseln von selbst ---------- */

function Hero({ calm, openMenu }: { calm: boolean; openMenu: () => void }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = HERO_FRAMES.length
  const running = !calm && !paused

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      if (!document.hidden) setI((x) => (x + 1) % n)
    }, 5500)
    return () => clearInterval(t)
  }, [running, n])

  const cur = HERO_FRAMES[i]
  return (
    <section aria-label="Zaidel Garten- und Landschaftsbau" className="hero-layer relative h-svh min-h-[560px] overflow-hidden" style={{ backgroundColor: cur.ground }}>
      {/* Bildstapel: jedes neue Foto wird von unten eingesetzt wie ein Stein */}
      <div className="absolute inset-x-4 top-[104px] bottom-[176px] md:inset-x-auto md:top-[90px] md:bottom-0 md:left-1/2 md:w-[37vw] md:-translate-x-1/2">
        {HERO_FRAMES.map((f, k) => (
          <div key={f.img} className="hero-frame absolute inset-0 overflow-hidden" data-state={k < i ? 'prev' : k === i ? 'on' : 'next'} style={{ zIndex: k }}>
            <img
              src={img(f.img)}
              alt={f.title}
              width={1200}
              height={1800}
              className="photo size-full object-cover"
              style={f.pos ? { objectPosition: f.pos } : undefined}
              fetchPriority={k === 0 ? 'high' : 'low'}
              loading={k < 2 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* dunkle Kopie unten, die echte Überschrift oben: weiß nur dort, wo das Foto sie schneidet */}
      <p aria-hidden className="t-monument pointer-events-none absolute inset-x-0 top-[64px] z-10 text-center uppercase md:top-[96px]">Zaidel</p>
      <div className="name-cut pointer-events-none absolute inset-0 z-10">
        <h1 className="t-monument absolute inset-x-0 top-[64px] text-center text-white uppercase md:top-[96px]">Zaidel</h1>
      </div>

      <div className="wrap absolute inset-x-0 top-0 z-20 flex h-[56px] items-center justify-between md:h-[72px]">
        <Link to="/" className="t-small flex items-center gap-2 font-bold" aria-label="Zur Startseite">
          <Mark className="size-8 text-[var(--ink)]" dot="#1c211d" />
        </Link>
        <NavLinks />
        <button onClick={openMenu} className="h-11 px-1 font-bold md:hidden">Menü</button>
      </div>

      {/* unten links: Satz und Bildtitel, am Desktop nur in der freien Spalte links vom Foto */}
      <div className="wrap absolute inset-x-0 bottom-5 z-20 md:right-auto md:bottom-8 md:w-[31.5vw]">
        <p className="t-lead max-w-[30ch] font-bold">Garten- und Landschaftsbau in Kleinheubach am Main.</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="t-small flex items-center gap-2 font-medium">
            {!calm && (
              <button onClick={() => setPaused(!paused)} className="press grid size-8 place-items-center bg-[var(--ink)] text-white" aria-label={paused ? 'Bildwechsel fortsetzen' : 'Bildwechsel anhalten'}>
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            )}
            <span aria-live="polite">Im Bild: {cur.title}</span>
          </p>
          <a href={CONTACT.phoneHref} className="btn btn-ink shrink-0 md:hidden"><Phone size={18} strokeWidth={1.75} /> Anrufen</a>
        </div>
      </div>
      <div className="wrap absolute right-0 bottom-8 z-20 hidden w-[31.5vw] justify-end md:flex">
        <Link to="/kontakt" className="btn btn-ink">Vor-Ort-Termin anfragen <ArrowRight size={18} strokeWidth={1.75} /></Link>
      </div>
    </section>
  )
}

/* ---------- Über uns: ein Satz, dann Dimitri mit Foto als Initiale ---------- */

function About() {
  return (
    <section data-rise className="wrap grid grid-cols-12 gap-x-[var(--margin)] gap-y-10 py-[clamp(5rem,9vw,8rem)]">
      <dl style={d(2)} className="t-small order-2 col-span-12 grid grid-cols-3 gap-4 md:order-none md:col-span-2 md:mt-2 md:flex md:flex-col md:gap-5">
        <div><dt className="font-bold">Ort</dt><dd>{CONTACT.street}, {CONTACT.city}</dd></div>
        <div><dt className="font-bold">Betrieb</dt><dd>Inhabergeführt</dd></div>
        <div><dt className="font-bold">Telefon</dt><dd><a className="link-u" href={CONTACT.phoneHref}>{CONTACT.phone}</a></dd></div>
      </dl>
      <div className="t-lead col-span-12 md:col-span-9 md:col-start-4">
        <p style={d(0)} className="font-bold pretty">Ein kleiner Betrieb aus Kleinheubach. Der Chef baut selbst mit, und was wir setzen, soll nach vielen Wintern noch gerade liegen.</p>
        <p style={d(1)} className="mt-[1em] pretty">
          <img src={img('treppe-bau-mitarbeiter', true)} alt="Mitarbeiter setzen Blockstufen" width={400} height={400} loading="lazy" className="photo float-left mt-1 mr-[0.5em] aspect-square w-[96px] object-cover md:w-[3.6em]" />
          <strong className="font-bold">Dimitri Zaidel</strong> <span className="text-muted">kommt zum ersten Termin, misst auf, schreibt das Angebot und ist beim Bau dabei. Hangmauern setzt er aus rotem Main-Sandstein, jeden Block einzeln mit der Steinzange.</span>
        </p>
      </div>
    </section>
  )
}

/* ---------- Leistungen: große Wörter, das Foto erscheint im festen Rahmen ---------- */

function Services() {
  const [k, setK] = useState(0)
  const g = GROUPS[k]
  return (
    <section id="leistungen" aria-label="Leistungen" className="scroll-mt-4 bg-[var(--surface)] py-[clamp(5rem,9vw,8rem)]">
      <div className="wrap grid grid-cols-12 gap-x-[var(--margin)]">
        <h2 className="t-lead order-1 col-span-12 font-bold md:order-none md:col-span-7">Was wir bauen</h2>
        <ul data-rise className="order-3 col-span-12 mt-6 md:order-none md:col-span-7 md:mt-10">
          {GROUPS.map((x, n) => (
            <li key={x.name} style={d(n)}>
              <button
                onMouseEnter={() => setK(n)}
                onFocus={() => setK(n)}
                onClick={() => setK(n)}
                aria-pressed={n === k}
                className={clsx('svc block w-full py-2 text-left transition-colors duration-150 md:py-2.5', n === k ? 'text-[var(--ink)]' : 'text-[var(--muted)]')}
              >
                <span className="svc-name block font-extrabold">{x.name}</span>
              </button>
            </li>
          ))}
        </ul>
        {/* fester Rahmen: zeigt das Foto der gewählten Leistung */}
        <figure className="order-2 col-span-12 mt-6 md:order-none md:col-span-5 md:mt-10 md:self-start">
          <div className="relative aspect-[4/3] overflow-hidden">
            {GROUPS.map((x, n) => (
              <img key={x.img} src={img(x.img, true)} alt={x.name} loading="lazy" className={clsx('photo absolute inset-0 size-full object-cover transition-opacity duration-300', n === k ? 'opacity-100' : 'opacity-0')} aria-hidden={n !== k} />
            ))}
          </div>
          <figcaption className="mt-4" aria-live="polite">
            <strong className="font-bold">{g.name}.</strong> {g.text}
            <span className="t-small text-muted mt-2 block">{g.items.join(' · ')}</span>
          </figcaption>
        </figure>
        <p className="order-4 col-span-12 mt-8 md:order-none md:col-span-7">
          <Link to="/arbeiten" className="link-u inline-flex items-center gap-2 font-bold">Alle Arbeiten ansehen <ArrowRight size={18} strokeWidth={1.75} /></Link>
        </p>
      </div>
    </section>
  )
}

/* ---------- Kundenstimme: über die ganze Breite gesetzt ---------- */

function Quote() {
  // ruhig gesetzt: kein Farbblock mehr, der Abschluss läuft auf Weiß und dann auf dem hellen Grund aus
  return (
    <section aria-label="Kundenstimme" className="wrap bg-white pt-[clamp(5rem,9vw,8rem)] pb-[clamp(4rem,7vw,6rem)]">
      <figure data-rise className="grid grid-cols-12 gap-x-[var(--margin)] gap-y-8">
        <blockquote style={d(0)} className="t-lead balance col-span-12 font-bold md:col-span-8">„Da merkt man, dass ein Profi am Werk ist.“</blockquote>
        <figcaption style={d(1)} className="col-span-12 flex flex-col gap-1 md:col-span-4 md:items-end md:text-right">
          <span className="font-bold">Dietmar Kraus, Google-Bewertung</span>
          <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="link-u inline-flex items-center gap-1 text-[var(--muted)]">5,0 von 5 aus 3 Google-Bewertungen <ArrowUpRight size={16} strokeWidth={1.75} /></a>
        </figcaption>
        {/* § 5b Abs. 3 UWG: Hinweis zur Echtheit direkt am Bewertungsblock */}
        <p style={d(2)} className="col-span-12 max-w-[62ch] text-[var(--muted)]">Wörtlich aus unserem Google-Profil, Stand November 2026. Wir prüfen nicht selbst, ob Bewertungen von echten Kunden stammen. Wie Google prüft, steht in dessen Richtlinien.</p>
      </figure>
    </section>
  )
}

/* ---------- Start: Anruf als Abschluss, geht nahtlos in den Footer über ---------- */

function CallBand() {
  return (
    <section aria-label="Anrufen" className="wrap bg-[var(--surface)] pt-[clamp(4rem,7vw,6rem)]">
      <div data-rise>
        <p style={d(0)} className="t-lead max-w-[26ch] font-bold">Rufen Sie an. Wir kommen vorbei und sagen Ihnen ehrlich, was geht.</p>
        <a style={d(1)} href={CONTACT.phoneHref} className="t-phone tnum mt-10 block font-medium whitespace-nowrap transition-colors duration-200 hover:text-[#5f8a4c]">{CONTACT.phone}</a>
        <div style={d(2)} data-still className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/kontakt" className="btn">Lieber schreiben <ArrowRight size={18} strokeWidth={1.75} /></Link>
          <Link to="/ablauf" className="btn btn-ink">Was steht im Angebot?</Link>
        </div>
      </div>
    </section>
  )
}

/* ---------- Arbeiten: kleine Rahmen, Filter als Text ---------- */

function Gallery() {
  const [cat, setCat] = useState<string>('alle')
  const [open, setOpen] = useState<number | null>(null)
  const list = PROJECTS.filter((p) => cat === 'alle' || p.cat === cat)
  return (
    <section aria-label="Fotos" className="wrap py-[clamp(4rem,7vw,6rem)]">
      <div role="tablist" aria-label="Filter" className="flex flex-wrap gap-x-6 gap-y-1">
        {CATS.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={clsx('press py-2 transition-colors', cat === c.id ? 'font-bold text-[var(--ink)] underline decoration-2 underline-offset-8' : 'text-muted hover:text-[var(--ink)]')}>
            {c.label}
          </button>
        ))}
      </div>
      <ul key={cat} data-rise className="mt-10 grid grid-cols-3 gap-2 sm:grid-cols-5 md:gap-[1.2vw] lg:grid-cols-7">
        {list.map((p, k) => (
          <li key={p.img} style={d(k % 7)}>
            <button onClick={() => setOpen(k)} className="frame block aspect-[2/3] w-full overflow-hidden" aria-label={`${p.title} groß ansehen`}>
              <img src={img(p.img, true)} alt={p.title} width={480} height={720} loading="lazy" className="photo size-full object-cover" style={p.pos ? { objectPosition: p.pos } : undefined} />
            </button>
          </li>
        ))}
      </ul>
      <p className="t-small text-muted mt-6">{list.length} Fotos</p>
      {open !== null && list[open] && <Lightbox list={list} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  )
}

const catLabel = (c: string) => CATS.find((x) => x.id === c)?.label ?? ''

function Lightbox({ list, index, onChange, onClose }: { list: typeof PROJECTS; index: number; onChange: (i: number) => void; onClose: () => void }) {
  const n = list.length
  const prev = useCallback(() => onChange((index - 1 + n) % n), [index, n, onChange])
  const next = useCallback(() => onChange((index + 1) % n), [index, n, onChange])
  const [touchX, setTouchX] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [next, prev, onClose])

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    for (const s of [1, -1]) new Image().src = img(list[(index + s + n) % n].img)
  }, [index, n, list])

  const p = list[index]
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#101311] text-white" onClick={onClose} role="dialog" aria-modal="true" aria-label={p.title}>
      <div className="wrap flex h-16 items-center justify-between">
        <span className="t-small">{index + 1} von {n}</span>
        <button ref={closeRef} className="grid size-12 place-items-center" aria-label="Schließen"><X size={26} strokeWidth={1.5} /></button>
      </div>
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return
          const dx = e.changedTouches[0].clientX - touchX
          if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
          setTouchX(null)
        }}
      >
        <img key={p.img} src={img(p.img)} alt={p.title} className="photo lb-img max-h-full max-w-full object-contain" />
        <button onClick={prev} className="press absolute left-3 hidden size-12 place-items-center bg-white/10 hover:bg-white/20 md:grid" aria-label="Vorheriges Foto"><ChevronLeft size={24} strokeWidth={1.5} /></button>
        <button onClick={next} className="press absolute right-3 hidden size-12 place-items-center bg-white/10 hover:bg-white/20 md:grid" aria-label="Nächstes Foto"><ChevronRight size={24} strokeWidth={1.5} /></button>
      </div>
      <div className="wrap py-5" onClick={(e) => e.stopPropagation()}>
        <p>{p.title} <span className="text-white/75">· {catLabel(p.cat)}</span></p>
        <p className="t-small mt-1 text-white/75 md:hidden">Wischen zum Blättern</p>
      </div>
    </div>
  )
}

/* ---------- Vorher / Nachher: quadratische Tafel, wenig Text ---------- */

function Showcase() {
  const [tab, setTab] = useState<'vorher' | 'nachher'>('nachher')
  const pics = {
    vorher: { src: 'vorher-garten-sand', alt: 'Vorher: rohes Planum nach dem Hausbau' },
    nachher: { src: 'nachher-garten-zaun', alt: 'Nachher: Mauer, Zaun mit Sichtschutz, Rasengitter und Bepflanzung' },
  }
  return (
    <section aria-label="Vorher und nachher" className="grid bg-[var(--surface)] md:min-h-[80svh] md:grid-cols-2">
      <div className="relative m-4 aspect-square self-center md:m-10">
        {(['vorher', 'nachher'] as const).map((t) => (
          <img key={t} src={img(pics[t].src)} alt={pics[t].alt} loading="lazy" className={clsx('photo absolute inset-0 size-full object-cover transition-opacity duration-500', tab === t ? 'opacity-100' : 'opacity-0')} aria-hidden={tab !== t} />
        ))}
      </div>
      <div data-rise className="flex flex-col justify-between gap-10 px-4 pb-6 md:px-10 md:py-10">
        <div style={d(0)} data-still role="tablist" aria-label="Ansicht" className="flex gap-6">
          {(['vorher', 'nachher'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={clsx('press py-2 capitalize transition-colors', tab === t ? 'font-bold text-[var(--ink)] underline decoration-2 underline-offset-8' : 'text-muted')}>
              {t}
            </button>
          ))}
        </div>
        <div style={d(1)}>
          <h2 className="t-lead font-bold">Derselbe Garten</h2>
          <p className="mt-10 max-w-[34ch] pretty">Nach dem Hausbau war hier rohes Planum. Wir haben eine Mauer gesetzt, den Zaun mit Sichtschutz gebaut, Stellplätze mit Rasengitter angelegt und bepflanzt.</p>
        </div>
        <div style={d(2)} data-still className="grid gap-3 md:grid-cols-2">
          <Link to="/kontakt" className="btn btn-ink min-h-[60px] md:min-h-[72px]">Termin anfragen</Link>
          <a href={CONTACT.phoneHref} className="btn min-h-[60px] bg-white md:min-h-[72px]">Anrufen</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- Ablauf: vier Verben auf vier Fotos, zwei mal zwei ---------- */

function Steps() {
  return (
    <section aria-label="Die vier Schritte" className="grid md:grid-cols-2">
      {STEPS.map((s, k) => (
        <div key={s.verb} data-rise className="relative aspect-[4/3] overflow-hidden bg-[var(--inverse)] md:aspect-auto md:h-[56svh]">
          <img src={img(s.img)} alt="" loading="lazy" className="photo drift absolute inset-0 size-full object-cover" style={s.pos ? { objectPosition: s.pos } : undefined} />
          <div className="absolute inset-0 bg-[#0d100e]/35" />
          <h2 style={d(0)} className="t-head absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-white">{s.verb}</h2>
          <p style={d(1)} className="absolute right-4 bottom-4 left-4 bg-[#0d100e]/70 p-4 text-white md:right-auto md:max-w-[34ch]">
            <span className="sr-only">Schritt {k + 1}: </span>{s.text}
          </p>
        </div>
      ))}
    </section>
  )
}

/* ---------- Das Live-Element: was steht in Ihrem Angebot? ---------- */

function Estimate() {
  const navigate = useNavigate()
  const [planId, setPlanId] = useState(PLANS[0].id)
  const plan = PLANS.find((p) => p.id === planId)!
  const [size, setSize] = useState(plan.start)
  const rows = plan.rows(size)

  return (
    <section id="angebot" aria-label="Was steht in Ihrem Angebot?" className="wrap py-[clamp(5rem,9vw,8rem)]">
      <div data-rise className="grid grid-cols-12 gap-x-[var(--margin)] gap-y-12">
        <h2 style={d(0)} className="t-head col-span-12 balance">Was steht im Angebot?</h2>
        <div style={d(1)} data-still className="col-span-12 md:col-span-5">
          <p className="max-w-[44ch]">Bei uns steht jede Arbeit einzeln im Angebot, mit Menge. Wählen Sie ein Vorhaben und die Größe, dann sehen Sie, woraus es besteht.</p>
          <div role="radiogroup" aria-label="Vorhaben" className="mt-10 flex flex-col items-start">
            {PLANS.map((p) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={p.id === planId}
                onClick={() => {
                  setPlanId(p.id)
                  setSize(p.start)
                }}
                className={clsx('press t-lead py-1.5 text-left transition-colors', p.id === planId ? 'font-bold text-[var(--ink)]' : 'text-muted hover:text-[var(--ink)]')}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="mt-10 block">
            <span className="block">{plan.sizeLabel}: <strong className="tnum t-lead font-bold">{fmt(size)} {plan.unit}</strong></span>
            <input type="range" min={plan.min} max={plan.max} value={size} onChange={(e) => setSize(Number(e.target.value))} className="mt-4 h-11 w-full accent-[var(--ink)]" />
          </label>
        </div>
        <div style={d(2)} data-still className="col-span-12 md:col-span-7">
          <table className="tnum w-full text-left">
            <thead>
              <tr className="t-small border-b-2 border-[var(--ink)]">
                <th className="py-3 font-bold">Leistung</th>
                <th className="py-3 text-right font-bold">Menge</th>
                <th className="w-16 py-3 pl-3 font-bold">Einheit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([t, q, u]) => (
                <tr key={t} /* echte Tabelle, Linien erlaubt. taste-skill-ignore */ className="border-b border-[#d5d8d3]">
                  <td className="py-3 pr-4">{t}</td>
                  <td className="py-3 text-right font-bold">{fmt(q)}</td>
                  <td className="py-3 pl-3">{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="t-small mt-4 max-w-[60ch]">Richtwerte zur Orientierung, ohne Preise. Die echten Mengen messen wir beim Termin vor Ort auf, danach bekommen Sie das Angebot schriftlich.</p>
          <button
            onClick={() =>
              navigate('/kontakt', {
                state: {
                  prefill: {
                    topic: plan.topic,
                    message: `Vorhaben: ${plan.label}, etwa ${fmt(size)} ${plan.unit}. Ich hätte gern einen Termin vor Ort und ein Angebot.`,
                    stamp: Date.now(),
                  } satisfies Prefill,
                },
              })
            }
            className="btn btn-ink mt-8"
          >
            Mit diesen Angaben anfragen <ArrowRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ---------- Kontakt: die Telefonnummer als Display-Schrift, dann das Formular ---------- */

function Contact() {
  return (
    <section id="kontakt" aria-label="Kontakt" data-rise className="wrap flex flex-col justify-between gap-16 bg-[var(--inverse)] pt-12 pb-10 text-white md:min-h-[62svh] md:pt-16">
      <h1 style={d(0)} className="t-lead max-w-[26ch] font-bold">Rufen Sie an. Wir kommen vorbei und sagen Ihnen ehrlich, was geht.</h1>
      <div style={d(1)}>
        <a href={CONTACT.phoneHref} className="t-phone tnum block font-medium whitespace-nowrap transition-colors duration-200 hover:text-[var(--accent)]">{CONTACT.phone}</a>
        <div className="t-small mt-10 flex flex-col gap-3 text-[var(--inverse-muted)] md:flex-row md:justify-between">
          <span>Mobil <a className="link-u text-white" href={CONTACT.mobileHref}>{CONTACT.mobile}</a> · {CONTACT.street}, {CONTACT.zip} {CONTACT.city}</span>
          <span className="flex gap-6">
            <a className="link-u text-white" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a className="link-u text-white" href={CONTACT.maps} target="_blank" rel="noreferrer">Route planen</a>
          </span>
        </div>
      </div>
    </section>
  )
}

function Inquiry() {
  const loc = useLocation()
  const prefill = (loc.state as { prefill?: Prefill } | null)?.prefill
  const ref = useRef<HTMLElement>(null)
  // Vom Angebots-Rechner gekommen: direkt zum Formular
  useEffect(() => {
    if (prefill) ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [prefill])
  return (
    <section ref={ref} id="anfrage" aria-label="Anfrage" className="wrap scroll-mt-16 bg-[var(--inverse)] pt-[clamp(4rem,7vw,6rem)] pb-[clamp(5rem,9vw,8rem)] text-white">
      <div data-rise className="grid grid-cols-12 gap-x-[var(--margin)] gap-y-12">
        <div style={d(0)} className="col-span-12 md:col-span-5">
          <h2 className="t-lead font-bold">Lieber schreiben? Gern mit Fotos.</h2>
          <p className="mt-6 max-w-[40ch] text-[var(--inverse-muted)]">Erzählen Sie kurz, was Sie vorhaben. Ein paar Handyfotos vom Garten helfen uns, den Termin vorzubereiten.</p>
          <p className="mt-10 font-bold">Wir arbeiten unter anderem in</p>
          <p className="mt-1 max-w-[44ch] text-[var(--inverse-muted)]">{AREA.join(', ')}.</p>
          <p className="mt-10 font-bold">Zuletzt fertig</p>
          <ul data-rise className="mt-3 grid grid-cols-4 gap-2">
            {PROJECTS.slice(0, 4).map((p, k) => (
              <li key={p.img} style={d(k)}>
                <Link to="/arbeiten" className="frame block aspect-[2/3] overflow-hidden" aria-label={`${p.title}, zu allen Arbeiten`}>
                  <img src={img(p.img, true)} alt={p.title} width={240} height={360} loading="lazy" className="photo size-full object-cover" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div style={d(1)} data-still className="col-span-12 md:col-span-7">
          <ContactForm prefill={prefill} />
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer: Spalten oben, Name unten ---------- */

function Footer({ calm, toggleCalm }: { calm: boolean; toggleCalm: () => void }) {
  return (
    <footer className="foot bg-[var(--surface)] text-[var(--ink)]">
      <div className="wrap grid grid-cols-2 gap-8 pt-[clamp(4rem,7vw,6rem)] md:grid-cols-4">
        <div>
          <p className="font-bold">Zaidel Garten- und Landschaftsbau</p>
          <p className="text-[var(--muted)]">{CONTACT.owner}<br />{CONTACT.street}<br />{CONTACT.zip} {CONTACT.city}</p>
        </div>
        <nav className="flex flex-col items-start">
          <p className="font-bold">Seiten</p>
          <Link to="/" className="link-u text-[var(--muted)]">Start</Link>
          {NAV.map((n) => <Link key={n.to} to={n.to} className="link-u text-[var(--muted)]">{n.label}</Link>)}
        </nav>
        <div className="flex flex-col items-start">
          <p className="font-bold">Kontakt</p>
          <a className="link-u text-[var(--muted)]" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a className="link-u text-[var(--muted)]" href={CONTACT.mobileHref}>{CONTACT.mobile}</a>
          <a className="link-u text-[var(--muted)]" href={`mailto:${CONTACT.email}`}>E-Mail schreiben</a>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-bold">Rechtliches</p>
          <Link to="/impressum" className="link-u text-[var(--muted)]">Impressum</Link>
          <Link to="/datenschutz" className="link-u text-[var(--muted)]">Datenschutz</Link>
          <Link to="/app" className="link-u text-[var(--muted)]">Team-Login</Link>
          <button onClick={toggleCalm} className="link-u text-[var(--muted)]" aria-pressed={!calm}>Effekte {calm ? 'an' : 'aus'}</button>
        </div>
      </div>
      <p className="wrap t-small mt-16 text-[var(--muted)]">© {new Date().getFullYear()} {CONTACT.owner} · Vorführversion</p>
      {/* der Name läuft unten aus dem Bild: leise Unterschrift statt Paukenschlag */}
      <div aria-hidden data-rise className="foot-name wrap mt-6 overflow-hidden">
        <p className="t-monument text-center uppercase">Zaidel</p>
      </div>
    </footer>
  )
}
