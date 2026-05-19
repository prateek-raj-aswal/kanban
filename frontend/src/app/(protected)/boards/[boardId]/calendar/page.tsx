import CalendarView from '@/components/board/CalendarView'

interface Props {
  params: { boardId: string }
}

export default function CalendarPage({ params }: Props) {
  return <CalendarView boardId={params.boardId} />
}
