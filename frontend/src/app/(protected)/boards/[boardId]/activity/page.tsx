import BoardActivityView from '@/components/board/BoardActivityView'

interface Props {
  params: { boardId: string }
}

export default function BoardActivityPage({ params }: Props) {
  return <BoardActivityView boardId={params.boardId} />
}
