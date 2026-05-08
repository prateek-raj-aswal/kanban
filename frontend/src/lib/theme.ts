export const T = {
  canvas: '#f5f7fa',
  sidebar: '#ffffff',
  sidebarBorder: '#e7eaef',
  topbar: '#ffffff',
  topbarBorder: '#e7eaef',
  column: '#eef1f5',
  card: '#ffffff',
  cardBorder: '#e2e6ec',
  cardShadow: '0 1px 2px rgba(15,23,42,.04), 0 1px 1px rgba(15,23,42,.03)',
  text: '#0f172a',
  textMuted: '#475569',
  textFaint: '#94a3b8',
  accent: '#2563eb',
  accentSoft: '#dbeafe',
  accentText: '#ffffff',
  danger: '#dc2626',
  warn: '#d97706',
  ok: '#16a34a',
  hover: '#f1f5f9',
  chipBg: '#f1f5f9',
  chipText: '#334155',
  selectedBg: '#dbeafe',
  selectedText: '#1d4ed8',
} as const

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
} as const

export type IconKey = keyof typeof ICONS

export function darkenHex(hex: string, t: number): string {
  const c = parseInt(hex.slice(1), 16)
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255
  const m = (x: number) => Math.round(x * (1 - t)).toString(16).padStart(2, '0')
  return '#' + m(r) + m(g) + m(b)
}
