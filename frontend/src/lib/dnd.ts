export function computeNewPosition(sortedPositions: number[], insertIndex: number): number {
  if (sortedPositions.length === 0) return 1000
  if (insertIndex === 0) return sortedPositions[0] / 2
  if (insertIndex >= sortedPositions.length) return sortedPositions[sortedPositions.length - 1] + 1000
  return (sortedPositions[insertIndex - 1] + sortedPositions[insertIndex]) / 2
}
