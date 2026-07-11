import { createContext, useContext } from 'react'

export interface CanvasContextValue {
  entryId: string | null
  entryBadge: string
  reducedMotion: boolean
  /* node toolbar actions */
  onEditNode: (id: string) => void
  onDuplicateNode: (id: string) => void
  onTestNode: (id: string) => void
  onDeleteNode: (id: string) => void
  /* edge midpoint "+" — opens the palette anchored at a screen point */
  onInsertOnEdge: (edgeId: string, clientX: number, clientY: number) => void
}

const noop = () => {}

export const CanvasContext = createContext<CanvasContextValue>({
  entryId: null,
  entryBadge: '',
  reducedMotion: false,
  onEditNode: noop,
  onDuplicateNode: noop,
  onTestNode: noop,
  onDeleteNode: noop,
  onInsertOnEdge: noop,
})

export const useCanvasContext = () => useContext(CanvasContext)
