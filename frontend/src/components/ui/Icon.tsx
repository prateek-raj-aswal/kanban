import { ICONS, type IconKey } from '@/lib/theme'

interface Props {
  name: IconKey
  size?: number
  sw?: number
  fill?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export default function Icon({ name, size = 16, sw = 1.7, fill = 'none', style, onClick }: Props) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16"
      fill={fill} stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      onClick={onClick}
    >
      <path d={ICONS[name]} />
    </svg>
  )
}
