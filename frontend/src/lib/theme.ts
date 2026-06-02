export const T = {
  canvas:        'var(--canvas)',
  sidebar:       'var(--sidebar)',
  sidebarBorder: 'var(--sidebar-border)',
  topbar:        'var(--topbar)',
  topbarBorder:  'var(--topbar-border)',
  column:        'var(--column)',
  card:          'var(--card)',
  cardBorder:    'var(--card-border)',
  cardShadow:    'var(--card-shadow)',
  text:          'var(--text)',
  textMuted:     'var(--text-muted)',
  textFaint:     'var(--text-faint)',
  accent:        'var(--accent)',
  accentSoft:    'var(--accent-soft)',
  accentText:    'var(--accent-text)',
  danger:        'var(--danger)',
  warn:          'var(--warn)',
  ok:            'var(--ok)',
  hover:         'var(--hover)',
  chipBg:        'var(--chip-bg)',
  chipText:      'var(--chip-text)',
  selectedBg:    'var(--selected-bg)',
  selectedText:  'var(--selected-text)',
} as const

type ThemeTokens = {
  canvas: string; sidebar: string; sidebarBorder: string
  topbar: string; topbarBorder: string
  column: string; card: string; cardBorder: string; cardShadow: string
  text: string; textMuted: string; textFaint: string
  accent: string; accentSoft: string; accentText: string
  danger: string; warn: string; ok: string
  hover: string; chipBg: string; chipText: string
  selectedBg: string; selectedText: string
}

export type ThemeName = 'light' | 'midnight' | 'graphite'

export const THEMES: Record<ThemeName, ThemeTokens> = {
  light: {
    canvas:        '#f5f7fa',
    sidebar:       '#ffffff',
    sidebarBorder: '#e7eaef',
    topbar:        '#ffffff',
    topbarBorder:  '#e7eaef',
    column:        '#eef1f5',
    card:          '#ffffff',
    cardBorder:    '#e2e6ec',
    cardShadow:    '0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.03)',
    text:          '#0f172a',
    textMuted:     '#475569',
    textFaint:     '#94a3b8',
    accent:        '#2563eb',
    accentSoft:    '#dbeafe',
    accentText:    '#ffffff',
    danger:        '#dc2626',
    warn:          '#d97706',
    ok:            '#16a34a',
    hover:         '#f1f5f9',
    chipBg:        '#f1f5f9',
    chipText:      '#334155',
    selectedBg:    '#dbeafe',
    selectedText:  '#1d4ed8',
  },
  midnight: {
    canvas:        '#0f1117',
    sidebar:       '#161b27',
    sidebarBorder: '#1e2533',
    topbar:        '#161b27',
    topbarBorder:  '#1e2533',
    column:        '#1a2236',
    card:          '#1e2a42',
    cardBorder:    '#253045',
    cardShadow:    '0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.2)',
    text:          '#e2e8f0',
    textMuted:     '#94a3b8',
    textFaint:     '#475569',
    accent:        '#3b82f6',
    accentSoft:    '#1e3a5f',
    accentText:    '#ffffff',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#4ade80',
    hover:         '#1e2a3d',
    chipBg:        '#253045',
    chipText:      '#94a3b8',
    selectedBg:    '#1e3a5f',
    selectedText:  '#60a5fa',
  },
  graphite: {
    canvas:        '#1a1a1a',
    sidebar:       '#222222',
    sidebarBorder: '#2d2d2d',
    topbar:        '#222222',
    topbarBorder:  '#2d2d2d',
    column:        '#2a2a2a',
    card:          '#2f2f2f',
    cardBorder:    '#3a3a3a',
    cardShadow:    '0 1px 2px rgba(0,0,0,.3), 0 1px 1px rgba(0,0,0,.2)',
    text:          '#e4e4e7',
    textMuted:     '#a1a1aa',
    textFaint:     '#52525b',
    accent:        '#818cf8',
    accentSoft:    '#312e81',
    accentText:    '#ffffff',
    danger:        '#f87171',
    warn:          '#fbbf24',
    ok:            '#4ade80',
    hover:         '#333333',
    chipBg:        '#3a3a3a',
    chipText:      '#a1a1aa',
    selectedBg:    '#312e81',
    selectedText:  '#a5b4fc',
  },
}

export function applyTheme(name: ThemeName) {
  const t = THEMES[name]
  const r = document.documentElement
  r.style.setProperty('--canvas',        t.canvas)
  r.style.setProperty('--sidebar',       t.sidebar)
  r.style.setProperty('--sidebar-border',t.sidebarBorder)
  r.style.setProperty('--topbar',        t.topbar)
  r.style.setProperty('--topbar-border', t.topbarBorder)
  r.style.setProperty('--column',        t.column)
  r.style.setProperty('--card',          t.card)
  r.style.setProperty('--card-border',   t.cardBorder)
  r.style.setProperty('--card-shadow',   t.cardShadow)
  r.style.setProperty('--text',          t.text)
  r.style.setProperty('--text-muted',    t.textMuted)
  r.style.setProperty('--text-faint',    t.textFaint)
  r.style.setProperty('--accent',        t.accent)
  r.style.setProperty('--accent-soft',   t.accentSoft)
  r.style.setProperty('--accent-text',   t.accentText)
  r.style.setProperty('--danger',        t.danger)
  r.style.setProperty('--warn',          t.warn)
  r.style.setProperty('--ok',            t.ok)
  r.style.setProperty('--hover',         t.hover)
  r.style.setProperty('--chip-bg',       t.chipBg)
  r.style.setProperty('--chip-text',     t.chipText)
  r.style.setProperty('--selected-bg',   t.selectedBg)
  r.style.setProperty('--selected-text', t.selectedText)
}

export const ICONS = {
  search:   'M7 12.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM14 14l-3-3',
  plus:     'M8 3v10M3 8h10',
  filter:   'M2 4h12M4 8h8M6 12h4',
  sort:     'M3 5h10M5 9h8M7 13h6',
  grid:     'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z',
  list:     'M3 4h10M3 8h10M3 12h10',
  cal:      'M3 4h10v9H3zM3 6h10M6 2v3M10 2v3',
  timeline: 'M2 4h6M5 8h9M2 12h6',
  star:     'M8 2l1.7 3.6 3.8.4-2.9 2.7.9 3.9L8 10.6 4.5 12.6l.9-3.9L2.5 6l3.8-.4Z',
  chevron:  'M6 4l4 4-4 4',
  chevLeft: 'M10 4l-4 4 4 4',
  chevDown: 'M4 6l4 4 4-4',
  more:     'M3.5 8h.01M8 8h.01M12.5 8h.01',
  msg:      'M2.5 4.5h11v6h-3l-2.5 2-1-2H2.5z',
  attach:   'M11 5L6 10a2 2 0 0 0 2.8 2.8L13 8.5a3.5 3.5 0 0 0-5-5L4 7.5',
  check:    'M3 8l3.5 3.5L13 5',
  clock:    'M8 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM8 4.5V8l2.5 1.5',
  link:     'M7 9a2 2 0 0 0 2.8 0L12 6.8a2 2 0 0 0-2.8-2.8L8 5.2M9 7a2 2 0 0 0-2.8 0L4 9.2a2 2 0 0 0 2.8 2.8L8 10.8',
  user:     'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 14c.6-2.6 2.6-4 5-4s4.4 1.4 5 4',
  inbox:    'M2 8h4l1 2h2l1-2h4M2 8l1.5-4h9L14 8v5H2z',
  cog:      'M8 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8 1v2M8 13v2M3 8H1M15 8h-2M4.5 4.5L3 3M13 13l-1.5-1.5M4.5 11.5L3 13M13 3l-1.5 1.5',
  flag:     'M4 13V3M4 3h7l-1.5 2.5L11 8H4',
  trash:    'M3 5h10M5 5V3h6v2M6 8v4M10 8v4M4 5l1 8h6l1-8',
  sun:      'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M3.2 12.8l1.1-1.1M11.7 4.3l1.1-1.1',
  moon:     'M12 12.5a6 6 0 0 1-6-10 6.5 6.5 0 1 0 6 10Z',
  palette:  'M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8ZM5 8h.01M8 5h.01M11 8h.01M8 11h.01',
  grip:     'M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01',
  logout:   'M10 3H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4M13 8H6M11 5l3 3-3 3',
} as const

export type IconKey = keyof typeof ICONS

export function darkenHex(hex: string, t: number): string {
  const c = parseInt(hex.slice(1), 16)
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255
  const m = (x: number) => Math.round(x * (1 - t)).toString(16).padStart(2, '0')
  return '#' + m(r) + m(g) + m(b)
}
