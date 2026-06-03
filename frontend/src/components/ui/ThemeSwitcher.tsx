'use client'
import { useThemeStore } from '@/store/themeStore'
import { THEMES, type ThemeName } from '@/lib/theme'

const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  midnight: 'Midnight',
  graphite: 'Graphite',
  ocean: 'Ocean',
  sunset: 'Sunset',
  forest: 'Forest',
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {(Object.keys(THEMES) as ThemeName[]).map(name => (
        <button
          key={name}
          title={THEME_LABELS[name]}
          onClick={() => setTheme(name)}
          style={{
            width: 16, height: 16, borderRadius: '50%',
            background: THEMES[name].accent,
            border: theme === name
              ? `2px solid ${THEMES[name].text}`
              : '2px solid transparent',
            cursor: 'pointer', padding: 0, flexShrink: 0,
            outline: theme === name ? `1px solid ${THEMES[name].accent}` : 'none',
            outlineOffset: 1,
          }}
        />
      ))}
    </div>
  )
}
