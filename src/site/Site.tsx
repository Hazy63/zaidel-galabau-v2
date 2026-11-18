import clsx from 'clsx'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Phone, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Mark } from '../Logo'
import { img } from '../crm/format'
import ContactForm, { type Prefill } from './ContactForm'
import { AREA, CATS, CONTACT, PROJECTS } from './content'
import { GROUPS, HERO_FRAMES, PLANS, STEPS, fmt } from './content-v2'
import { scrollToId } from './hooks'
import './v2.css'

// Inhalte nur verstecken, wenn JS läuft: ohne Skript bleibt alles sichtbar
document.documentElement.classList.add('js')

const NAV = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'arbeiten', label: 'Arbeiten' },
  { id: 'ablauf', label: 'Ablauf' },
  { id: 'kontakt', label: 'Kontakt' },
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
function useRise() {
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
    document.querySelectorAll('[data-rise], .drift').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

export default function Site() {
  useRise()
  const [calm, toggleCalm] = useCalm()
  const [menu, setMenu] = useState(false)
  const [prefill, setPrefill] = useState<Prefill>()

  const go = (id: string) => {
    setMenu(false)
    scrollToId(id)
  }

  return (
    <div className="v2">
      <Hero go={go} openMenu={() => setMenu(true)} />
      <Intro />
      <About />
      <Services />
      <Strip />
      <Showcase go={go} />
      <Steps />
      <Estimate
        onAsk={(p) => {
          setPrefill(p)
          go('anfrage')
        }}
      />
      <Quote />
      <Contact />
      <Inquiry prefill={prefill} />
      <Footer go={go} calm={calm} toggleCalm={toggleCalm} />

      {menu && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--inverse)] px-[var(--margin)] pt-5 pb-8 text-white" role="dialog" aria-modal="true" aria-label="Menü">
          <div className="flex items-center justify-between">
            <span className="t-small flex items-center gap-2 font-bold"><Mark className="size-7 text-[var(--accent)]" dot="#fff" /> Zaidel</span>
            <button onClick={() => setMenu(false)} className="grid size-12 place-items-center" aria-label="Menü schließen"><X size={26} strokeWidth={1.5} /></button>
          </div>
          <nav className="mt-16 flex flex-col">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className="press t-head py-2 text-left">{n.label}</button>
            ))}
          </nav>
          <a href={CONTACT.phoneHref} className="btn mt-auto">{CONTACT.phone}</a>
        </div>
      )}
    </div>
  )
}

/* ---------- Hero: der Name als Monument, Baustellen ziehen darunter durch ---------- */

const STEP_SVH = 55

function Hero({ go, openMenu }: { go: (id: string) => void; openMenu: () => void }) {
  const [i, setI] = useState(0)
  const marks = useRef<(HTMLDivElement | null)[]>([])
  const n = HERO_FRAMES.length

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setI(Number((e.target as HTMLElement).dataset.n))),
      { rootMargin: '-50% 0px -50% 0px' },
    )
    marks.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const cur = HERO_FRAMES[i]
  return (
    <section aria-label="Zaidel Garten- und Landschaftsbau" className="relative" style={{ height: `calc(100svh + ${(n - 1) * STEP_SVH}svh)` }}>
      <div className="hero-layer sticky top-0 h-svh overflow-hidden" style={{ backgroundColor: cur.ground }}>
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

        <h1 className="t-monument pointer-events-none absolute inset-x-0 top-[64px] z-10 text-center uppercase md:top-[96px]">Zaidel</h1>
        <div aria-hidden className="name-cut pointer-events-none absolute inset-0 z-10">
          <p className="t-monument absolute inset-x-0 top-[64px] text-center text-white uppercase md:top-[96px]">Zaidel</p>
        </div>

        <div className="wrap absolute inset-x-0 top-0 z-20 flex h-[56px] items-center justify-between md:h-[72px]">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="t-small flex items-center gap-2 font-bold" aria-label="Nach oben">
            <Mark className="size-7 text-[var(--ink)]" dot="#1c211d" /> <span className="hidden sm:inline">Garten- und Landschaftsbau</span>
          </button>
          <nav className="hidden gap-8 font-medium md:flex">
            {NAV.map((x) => (
              <button key={x.id} onClick={() => go(x.id)} className="link-u">{x.label}</button>
            ))}
          </nav>
          <button onClick={openMenu} className="h-11 px-1 font-bold md:hidden">Menü</button>
        </div>

        {/* unten links: Satz und Bildtitel, am Desktop nur in der freien Spalte links vom Foto */}
        <div className="wrap absolute inset-x-0 bottom-5 z-20 md:right-auto md:bottom-8 md:w-[31.5vw]">
          <p className="t-lead max-w-[30ch] font-bold">Garten- und Landschaftsbau in Kleinheubach am Main.</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="t-small font-medium" aria-live="polite">Im Bild: {cur.title}</p>
            <a href={CONTACT.phoneHref} className="btn btn-ink shrink-0 md:hidden"><Phone size={18} strokeWidth={1.75} /> Anrufen</a>
          </div>
        </div>
        {/* unten rechts, rechts vom Foto: die eine Aktion */}
        <div className="wrap absolute right-0 bottom-8 z-20 hidden w-[31.5vw] justify-end md:flex">
          <button onClick={() => go('anfrage')} className="btn btn-ink">
            Vor-Ort-Termin anfragen <ArrowRight size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Marken für den Bildwechsel beim Scrollen */}
      <div className="pointer-events-none absolute inset-x-0 top-0" aria-hidden>
        {HERO_FRAMES.map((f, k) => (
          <div key={f.img} ref={(el) => { marks.current[k] = el }} data-n={k} style={{ height: `${STEP_SVH}svh` }} />
        ))}
      </div>
    </section>
  )
}

/* ---------- Intro: ein Absatz in der rechten Hälfte, ein Foto ---------- */

function Intro() {
  return (
    <section data-rise className="wrap grid grid-cols-12 gap-x-[var(--margin)] py-[clamp(6rem,11vw,10rem)]">
      <p style={d(0)} className="t-lead col-span-12 md:col-span-7 md:col-start-6 md:indent-[3em] pretty">
        Ein kleiner Betrieb aus Kleinheubach. Der Chef baut selbst mit, und was wir setzen, soll nach vielen Wintern noch gerade liegen.
      </p>
      <div style={d(1)} className="col-span-7 col-start-6 mt-12 overflow-hidden md:col-span-3 md:col-start-1 md:mt-[-4vw]">
        <img src={img('pflaster-sandstein-detail', true)} alt="Hof mit Buntsandstein-Einfassung" width={800} height={800} loading="lazy" className="photo drift aspect-[4/5] w-full object-cover md:aspect-square" />
      </div>
      <p style={d(2)} className="t-small col-span-5 col-start-1 row-start-2 self-end md:col-span-2 md:row-start-auto md:mt-24 md:max-w-[180px] md:self-auto">
        Unser Schwerpunkt ist Natur- und Betonwerkstein. Dazu Carports, Gartenhäuser, Erd- und Entwässerungsarbeiten.
      </p>
    </section>
  )
}

/* ---------- Über uns: Foto als Initiale ---------- */

function About() {
  return (
    <section data-rise className="wrap grid grid-cols-12 gap-x-[var(--margin)] pb-[clamp(6rem,10vw,9rem)]">
      <dl style={d(0)} className="t-small order-2 col-span-12 mt-10 grid grid-cols-3 gap-4 md:order-none md:col-span-2 md:mt-1 md:flex md:flex-col md:gap-5">
        <div><dt className="font-bold">Ort</dt><dd>{CONTACT.street}, {CONTACT.city}</dd></div>
        <div><dt className="font-bold">Betrieb</dt><dd>Inhabergeführt</dd></div>
        <div><dt className="font-bold">Telefon</dt><dd><a className="link-u" href={CONTACT.phoneHref}>{CONTACT.phone}</a></dd></div>
      </dl>
      <div style={d(1)} className="t-lead col-span-12 md:col-span-10 md:col-start-3">
        <p className="pretty">
          <img src={img('treppe-bau-mitarbeiter', true)} alt="Mitarbeiter setzen Blockstufen" width={400} height={400} loading="lazy" className="photo float-left mt-1 mr-[0.5em] aspect-square w-[110px] object-cover md:w-[3.6em]" />
          <strong className="font-bold">Dimitri Zaidel</strong> <span className="text-muted">führt den Betrieb selbst. Er kommt zum ersten Termin, misst auf, schreibt das Angebot und ist beim Bau dabei. Sie haben einen Ansprechpartner vom ersten Anruf bis zur Übergabe und kennen die Leute, die bei Ihnen arbeiten.</span>
        </p>
        <p className="text-muted mt-[1.2em] pretty">
          Roter Main-Sandstein steckt in den Altstädten von Miltenberg und Wertheim. Wir setzen ihn als Blockstein für Hangmauern, Treppen und Beeteinfassungen, jeden Block einzeln mit der Steinzange.
        </p>
      </div>
    </section>
  )
}

/* ---------- Leistungen: Namensspalten in einer Größe ---------- */

function Services() {
  const [hover, setHover] = useState<{ name: string; text: string } | null>(null)
  return (
    <section id="leistungen" aria-label="Leistungen" className="scroll-mt-4 bg-[var(--surface)] py-[clamp(6rem,20vh,12rem)]">
      <div data-rise className="wrap grid grid-cols-12 gap-x-[var(--margin)]">
        <h2 style={d(0)} className="t-lead col-span-12 font-bold">Was wir bauen</h2>
        {GROUPS.map((col, c) => (
          <div key={c} style={d(c + 1)} className="col-span-12 mt-12 space-y-10 sm:col-span-4 md:col-span-3 md:mt-24" onMouseLeave={() => setHover(null)}>
            {col.map((g) => (
              <div key={g.name}>
                <h3 className="font-bold">{g.name}</h3>
                <ul className="text-muted mt-[1.25em] space-y-0.5 leading-[1.3] md:leading-[1.25]">
                  {g.items.map((it) => (
                    <li key={it} className="cap hover:text-[var(--ink)]" onMouseEnter={() => setHover({ name: it, text: g.text })}>{it}</li>
                  ))}
                </ul>
                <p className="mt-3 md:hidden">{g.text}</p>
              </div>
            ))}
          </div>
        ))}
        <div className="col-span-3 mt-24 hidden md:block" aria-live="polite">
          {hover ? (
            <p><strong className="font-bold">{hover.name}.</strong> {hover.text}</p>
          ) : (
            <p className="text-muted">Zeigen Sie auf eine Leistung, um mehr zu lesen.</p>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- Arbeiten: kleine Rahmen, viel Fläche ---------- */

function Strip() {
  const [open, setOpen] = useState<number | null>(null)
  const ref = useRef<HTMLUListElement>(null)
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)

  return (
    <section id="arbeiten" aria-label="Arbeiten" className="flex min-h-[80svh] scroll-mt-4 flex-col justify-center md:min-h-svh">
      <h2 className="wrap t-lead mb-6 font-bold">
        Unsere Arbeiten <span className="text-muted font-medium">· {PROJECTS.length} Fotos</span>
      </h2>
      <ul
        ref={ref}
        className="strip wrap flex gap-[5vw] overflow-x-auto"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || !ref.current) return
          drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false }
        }}
        onPointerMove={(e) => {
          const s = drag.current
          if (!s || !ref.current) return
          const dx = e.clientX - s.x
          if (Math.abs(dx) > 5) {
            s.moved = true
            ref.current.classList.add('dragging')
          }
          ref.current.scrollLeft = s.left - dx
        }}
        onPointerUp={() => {
          ref.current?.classList.remove('dragging')
          setTimeout(() => (drag.current = null), 0)
        }}
        onPointerLeave={() => {
          ref.current?.classList.remove('dragging')
          drag.current = null
        }}
      >
        {PROJECTS.map((p, k) => (
          <li key={p.img} className="shrink-0">
            <button
              onClick={() => !drag.current?.moved && setOpen(k)}
              className="frame block h-[calc(34vw*1.5)] w-[34vw] overflow-hidden md:h-[24svh] md:w-[11vw]"
              aria-label={`${p.title} groß ansehen`}
            >
              <img src={img(p.img, true)} alt={p.title} width={480} height={720} loading="lazy" draggable={false} className="photo size-full object-cover" style={p.pos ? { objectPosition: p.pos } : undefined} />
            </button>
          </li>
        ))}
      </ul>
      <p className="wrap t-small text-muted mt-6">Wischen oder ziehen, antippen zum Vergrößern.</p>
      {open !== null && <Lightbox index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </section>
  )
}

const catLabel = (c: string) => CATS.find((x) => x.id === c)?.label ?? ''

function Lightbox({ index, onChange, onClose }: { index: number; onChange: (i: number) => void; onClose: () => void }) {
  const list = PROJECTS
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

function Showcase({ go }: { go: (id: string) => void }) {
  const [tab, setTab] = useState<'vorher' | 'nachher'>('nachher')
  const pics = {
    vorher: { src: 'vorher-garten-sand', alt: 'Vorher: rohes Planum nach dem Hausbau' },
    nachher: { src: 'nachher-garten-zaun', alt: 'Nachher: Mauer, Zaun mit Sichtschutz, Rasengitter und Bepflanzung' },
  }
  return (
    <section aria-label="Vorher und nachher" className="grid bg-[var(--surface)] md:min-h-[88svh] md:grid-cols-2">
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
          <p className="mt-12 max-w-[34ch] pretty">
            Nach dem Hausbau war hier rohes Planum. Wir haben eine Mauer gesetzt, den Zaun mit Sichtschutz gebaut, Stellplätze mit Rasengitter angelegt und bepflanzt.
          </p>
        </div>
        <div style={d(2)} data-still className="grid gap-3 md:grid-cols-2">
          <button onClick={() => go('anfrage')} className="btn btn-ink min-h-[60px] md:min-h-[72px]">Termin anfragen</button>
          <a href={CONTACT.phoneHref} className="btn min-h-[60px] bg-white md:min-h-[72px]">Anrufen</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- Ablauf: ein Verb pro Schritt ---------- */

function Steps() {
  return (
    <section id="ablauf" aria-label="So läuft es ab" className="scroll-mt-0">
      {STEPS.map((s) => (
        <div key={s.verb} className="relative h-svh overflow-clip bg-[var(--inverse)]">
          <img src={img(s.img)} alt="" loading="lazy" className="photo absolute inset-0 size-full object-cover" style={s.pos ? { objectPosition: s.pos } : undefined} />
          <div className="absolute inset-0 bg-[#0d100e]/35" />
          <div className="relative h-full pt-[30svh] pb-[26svh] md:pb-[18svh]">
            <h3 className="verb t-monument py-[0.08em] text-center text-white">{s.verb}</h3>
          </div>
          <p className="absolute right-4 bottom-4 left-4 bg-[#0d100e]/70 p-4 text-white md:right-auto md:bottom-8 md:left-8 md:max-w-[30ch] md:p-5">{s.text}</p>
        </div>
      ))}
    </section>
  )
}

/* ---------- Das Live-Element: was steht in Ihrem Angebot? ---------- */

function Estimate({ onAsk }: { onAsk: (p: Prefill) => void }) {
  const [planId, setPlanId] = useState(PLANS[0].id)
  const plan = PLANS.find((p) => p.id === planId)!
  const [size, setSize] = useState(plan.start)
  const rows = plan.rows(size)

  return (
    <section id="angebot" aria-label="Was steht in Ihrem Angebot?" className="wrap py-[var(--gap-section)]">
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
              onAsk({
                topic: plan.topic,
                message: `Vorhaben: ${plan.label}, etwa ${fmt(size)} ${plan.unit}. Ich hätte gern einen Termin vor Ort und ein Angebot.`,
                stamp: Date.now(),
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

/* ---------- Kundenstimme: über die ganze Breite gesetzt ---------- */

function Quote() {
  // Zwei Zeilen bei jeder Breite (Hausregel), Wörter auf die Breite gespreizt
  const lines = [['„Da', 'merkt', 'man,', 'dass'], ['ein', 'Profi', 'am', 'Werk', 'ist.“']]
  return (
    <section aria-label="Kundenstimme" className="bg-[var(--accent)] py-[clamp(6rem,10vw,9rem)] text-[var(--accent-ink)]">
      <figure data-rise className="wrap">
        <blockquote style={d(0)} className="t-head flex flex-col gap-[0.35em]">
          {lines.map((l, k) => (
            <span key={k} className="flex justify-between">
              {l.map((w) => <span key={w}>{w}</span>)}
            </span>
          ))}
        </blockquote>
        <figcaption style={d(1)} className="mt-16 flex flex-col gap-1 md:flex-row md:justify-between">
          <span className="font-bold">Dietmar Kraus</span>
          <span className="md:text-center">Google-Bewertung</span>
          <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="link-u inline-flex items-center gap-1 md:justify-end">5,0 von 5 aus 3 Google-Bewertungen <ArrowUpRight size={16} strokeWidth={1.75} /></a>
        </figcaption>
        {/* § 5b Abs. 3 UWG: Hinweis zur Echtheit direkt am Bewertungsblock */}
        <p style={d(2)} className="mt-8 max-w-[58ch]">Wörtlich aus unserem Google-Profil, Stand November 2026. Wir prüfen nicht selbst, ob Bewertungen von echten Kunden stammen. Wie Google prüft, steht in dessen Richtlinien.</p>
      </figure>
    </section>
  )
}

/* ---------- Kontakt: die Telefonnummer als Display-Schrift ---------- */

function Contact() {
  return (
    <section id="kontakt" aria-label="Kontakt" className="wrap flex scroll-mt-0 flex-col justify-between gap-24 bg-[var(--inverse)] pt-12 pb-8 text-white md:min-h-[80svh] md:pt-8">
      <p className="t-lead max-w-[26ch] font-bold">Rufen Sie an. Wir kommen vorbei und sagen Ihnen ehrlich, was geht.</p>
      <div>
        <a href={CONTACT.phoneHref} className="t-phone tnum block font-medium whitespace-nowrap transition-colors duration-200 hover:text-[var(--accent)]">{CONTACT.phone}</a>
        <div className="t-small mt-12 flex md:mt-[10vh] flex-col gap-3 text-[var(--inverse-muted)] md:flex-row md:justify-between">
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

function Inquiry({ prefill }: { prefill?: Prefill }) {
  return (
    <section id="anfrage" aria-label="Anfrage" className="wrap scroll-mt-0 bg-[var(--inverse)] pt-[clamp(5rem,9vw,8rem)] pb-[var(--gap-section)] text-white">
      <div data-rise className="grid grid-cols-12 gap-x-[var(--margin)] gap-y-12">
        <div style={d(0)} className="col-span-12 md:col-span-5">
          <h2 className="t-lead font-bold">Lieber schreiben? Gern mit Fotos.</h2>
          <p className="mt-6 max-w-[40ch] text-[var(--inverse-muted)]">Erzählen Sie kurz, was Sie vorhaben. Ein paar Handyfotos vom Garten helfen uns, den Termin vorzubereiten.</p>
          <p className="t-small mt-12 font-bold">Wir arbeiten unter anderem in</p>
          <p className="t-small mt-2 max-w-[44ch] text-[var(--inverse-muted)]">{AREA.join(', ')}.</p>
        </div>
        <div style={d(1)} data-still className="col-span-12 md:col-span-7">
          <ContactForm prefill={prefill} />
        </div>
      </div>
    </section>
  )
}

/* ---------- Footer: Spalten oben, Name unten ---------- */

function Footer({ go, calm, toggleCalm }: { go: (id: string) => void; calm: boolean; toggleCalm: () => void }) {
  return (
    <footer className="grid min-h-[80svh] grid-rows-[auto_1fr_auto] bg-[#121512] text-white">
      <div className="wrap grid grid-cols-2 gap-8 pt-10 md:grid-cols-4">
        <div>
          <p className="font-bold">Zaidel Garten- und Landschaftsbau</p>
          <p className="text-[var(--inverse-muted)]">{CONTACT.owner}<br />{CONTACT.street}<br />{CONTACT.zip} {CONTACT.city}</p>
        </div>
        <nav className="flex flex-col items-start">
          <p className="font-bold">Seite</p>
          {NAV.slice(0, 3).map((n) => <button key={n.id} onClick={() => go(n.id)} className="link-u text-[var(--inverse-muted)]">{n.label}</button>)}
          <button onClick={() => go('angebot')} className="link-u text-[var(--inverse-muted)]">Was steht im Angebot?</button>
        </nav>
        <div className="flex flex-col items-start">
          <p className="font-bold">Kontakt</p>
          <a className="link-u text-[var(--inverse-muted)]" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          <a className="link-u text-[var(--inverse-muted)]" href={CONTACT.mobileHref}>{CONTACT.mobile}</a>
          <a className="link-u text-[var(--inverse-muted)]" href={`mailto:${CONTACT.email}`}>E-Mail schreiben</a>
        </div>
        <div className="flex flex-col items-start">
          <p className="font-bold">Rechtliches</p>
          <Link to="/impressum" className="link-u text-[var(--inverse-muted)]">Impressum</Link>
          <Link to="/datenschutz" className="link-u text-[var(--inverse-muted)]">Datenschutz</Link>
          <Link to="/app" className="link-u text-[var(--inverse-muted)]">Team-Login</Link>
          <button onClick={toggleCalm} className="link-u text-[var(--inverse-muted)]" aria-pressed={!calm}>Effekte {calm ? 'an' : 'aus'}</button>
        </div>
      </div>
      <div />
      <div className="wrap pb-5">
        <p aria-hidden className="t-monument -mb-[0.04em] text-center uppercase">Zaidel</p>
        <p className="t-small mt-4 text-[var(--inverse-muted)]">© {new Date().getFullYear()} {CONTACT.owner} · Vorführversion</p>
      </div>
    </footer>
  )
}
