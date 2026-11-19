/** Inhalte der Website v2. Kontakt, Referenzen und Bewertungen kommen weiter aus content.ts. */

/** Hero: Baustellen, die unter dem Namen durchziehen. ground = Grundfarbe aus dem Foto (tools/sample-colors.py, TINT=0.55) */
export const HERO_FRAMES: { img: string; title: string; ground: string; pos?: string }[] = [
  { img: 'sandstein-treppe-garten', title: 'Sandsteintreppe in der Böschung', ground: '#b1aba3', pos: '55% 60%' },
  { img: 'sandsteinmauer-lang', title: 'Mauer aus Buntsandstein', ground: '#bbb6ab', pos: '45% 55%' },
  { img: 'sitzplatz-trockenmauer', title: 'Runder Sitzplatz mit Trockenmauer', ground: '#bdc2ba', pos: '60% 60%' },
  { img: 'sandstein-hochbeet', title: 'Hochbeet aus Sandsteinblöcken', ground: '#adaba7' },
]

/** Leistungen als Liste großer Wörter, beim Überfahren erscheint das Foto im Rahmen */
export const GROUPS: { name: string; items: string[]; text: string; img: string }[] = [
  { name: 'Pflaster und Wege', img: 'pflaster-sandstein-einfahrt', items: ['Hofeinfahrten', 'Garagenvorplätze', 'Gartenwege', 'Rasengitter', 'Entwässerung'], text: 'Mit sauberem Unterbau, damit nach Jahren nichts absackt.' },
  { name: 'Mauern und Naturstein', img: 'sandsteinmauer-lang', items: ['Hangmauern aus Buntsandstein', 'Trockenmauern', 'Hochbeete', 'Gabionen', 'Verblender'], text: 'Gesetzt mit dem Bagger, ausgerichtet von Hand.' },
  { name: 'Treppen und Stufen', img: 'granit-treppe-einfahrt', items: ['Blockstufen aus Granit', 'Betonblockstufen', 'Podeste', 'Hauseingänge'], text: 'Auf Fundament gesetzt, trittsicher und frostfest.' },
  { name: 'Terrassen', img: 'terrasse-platten', items: ['Feinsteinzeug', 'Polygonalplatten', 'Großformatplatten', 'Betonplatten'], text: 'Mit Gefälle, das Wasser vom Haus wegführt.' },
  { name: 'Zäune und Sichtschutz', img: 'sichtschutz-anthrazit', items: ['Doppelstabmatten', 'Sichtschutzstreifen', 'Tore', 'Carports und Gartenhäuser'], text: 'Pfosten einbetoniert, Fluchten gerade.' },
  { name: 'Garten und Pflege', img: 'sitzplatz-trockenmauer', items: ['Neuanlage nach dem Hausbau', 'Rollrasen', 'Beete und Hecken', 'Regelmäßige Pflege'], text: 'Auf Wunsch kümmern wir uns auch danach um den Garten.' },
]

/** Ablauf: ein Verb pro Schritt */
export const STEPS: { verb: string; img: string; text: string; pos?: string }[] = [
  { verb: 'Ansehen', img: 'vorher-garten-sand', text: 'Wir kommen vorbei, sehen uns das Grundstück an und messen auf.' },
  { verb: 'Planen', img: 'weg-treppe-hang', text: 'Sie bekommen ein schriftliches Angebot mit allen Positionen und Mengen.' },
  { verb: 'Bauen', img: 'sandstein-setzen-bagger', text: 'Unsere Kolonne baut, Herr Zaidel ist dabei. Die Baustelle übergeben wir besenrein.' },
  { verb: 'Pflegen', img: 'garten-bank-hecke', text: 'Wenn Sie möchten, schneiden und pflegen wir den Garten danach regelmäßig.' },
]

/**
 * „Was steht in Ihrem Angebot?“: Richtwerte für Mengen (keine Preise).
 * Schichtdicken und Annahmen sind Erfahrungswerte von Dennis, von Zaidel zu bestätigen.
 */
export type Plan = {
  id: string
  label: string
  topic: string
  unit: 'm²' | 'm'
  min: number
  max: number
  start: number
  sizeLabel: string
  rows: (n: number) => [string, number, string][]
}

const r1 = (x: number) => Math.round(x * 10) / 10

export const PLANS: Plan[] = [
  {
    id: 'einfahrt', label: 'Hofeinfahrt pflastern', topic: 'Pflaster / Einfahrt', unit: 'm²', min: 15, max: 200, start: 60, sizeLabel: 'Fläche',
    rows: (a) => [
      ['Baustelle einrichten und räumen', 1, 'psch'],
      ['Boden ausheben, 40 cm tief, und entsorgen', r1(a * 0.4), 'm³'],
      ['Frostschutzschicht einbauen und verdichten, 30 cm', r1(a * 0.3), 'm³'],
      ['Randsteine in Beton setzen', Math.round(6 * Math.sqrt(a / 2)), 'm'],
      ['Splittbett abziehen, 4 cm', a, 'm²'],
      ['Betonsteinpflaster verlegen', a, 'm²'],
      ['Fugen einsanden und abrütteln', a, 'm²'],
    ],
  },
  {
    id: 'terrasse', label: 'Terrasse bauen', topic: 'Terrasse', unit: 'm²', min: 8, max: 80, start: 25, sizeLabel: 'Fläche',
    rows: (a) => [
      ['Baustelle einrichten und räumen', 1, 'psch'],
      ['Boden ausheben, 30 cm tief, und entsorgen', r1(a * 0.3), 'm³'],
      ['Schottertragschicht einbauen und verdichten, 20 cm', r1(a * 0.2), 'm³'],
      ['Randeinfassung setzen', Math.round(3 * Math.sqrt(a / 2)), 'm'],
      ['Platten verlegen, 2 % Gefälle vom Haus weg', a, 'm²'],
      ['Fugen schließen', a, 'm²'],
    ],
  },
  {
    id: 'mauer', label: 'Hangmauer aus Sandstein', topic: 'Mauer / Naturstein', unit: 'm', min: 4, max: 60, start: 12, sizeLabel: 'Länge, bei etwa 1 m Höhe',
    rows: (l) => [
      ['Baustelle einrichten, Bagger an- und abfahren', 1, 'psch'],
      ['Fundamentgraben ausheben, 60 × 50 cm', r1(l * 0.6 * 0.5), 'm³'],
      ['Schotterfundament einbauen und verdichten', r1(l * 0.6 * 0.3), 'm³'],
      ['Buntsandstein-Blöcke liefern und mit dem Bagger setzen', l, 'm²'],
      ['Drainrohr hinter der Mauer verlegen', l, 'm'],
      ['Mit Drainkies hinterfüllen', r1(l * 0.4), 'm³'],
    ],
  },
  {
    id: 'weg', label: 'Gartenweg anlegen', topic: 'Pflaster / Einfahrt', unit: 'm', min: 5, max: 80, start: 20, sizeLabel: 'Länge, bei 1,20 m Breite',
    rows: (l) => [
      ['Baustelle einrichten und räumen', 1, 'psch'],
      ['Boden ausheben, 30 cm tief, und entsorgen', r1(l * 1.2 * 0.3), 'm³'],
      ['Schottertragschicht einbauen und verdichten, 20 cm', r1(l * 1.2 * 0.2), 'm³'],
      ['Rasenkantensteine beidseitig setzen', l * 2, 'm'],
      ['Pflaster verlegen und einsanden', r1(l * 1.2), 'm²'],
    ],
  },
]

export const fmt = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 1 })
