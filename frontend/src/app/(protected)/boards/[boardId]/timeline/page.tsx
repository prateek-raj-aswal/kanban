import TimelineView from '@/components/board/TimelineView'

interface Props {
  params: { boardId: string }
}

export default function TimelinePage({ params }: Props) {
  return <TimelineView boardId={params.boardId} />
}
