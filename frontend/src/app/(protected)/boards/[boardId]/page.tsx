import BoardView from '@/components/board/BoardView'

interface Props {
  params: { boardId: string }
}

export default function BoardDetailPage({ params }: Props) {
  return <BoardView boardId={params.boardId} />
}
