import { memo, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import { useCanvasContext } from '../context'
import { useDropEdgeId } from './edgeDnd'
import type { JourneyEdgeData } from '../types'

const CONNECTOR = '#F0AA7B'

function JourneyEdgeViewBase(props: EdgeProps<JourneyEdgeData>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected } = props
  const ctx = useCanvasContext()
  const dropEdgeId = useDropEdgeId()
  const [hovered, setHovered] = useState(false)

  const [path, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition })
  const isDropTarget = dropEdgeId === id
  const showPlus = hovered || isDropTarget

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: isDropTarget ? '#FB6514' : CONNECTOR,
          strokeWidth: isDropTarget ? 3 : selected ? 2.5 : 2,
          filter: isDropTarget ? 'drop-shadow(0 0 3px rgba(253,95,3,.30))' : undefined,
        }}
      />
      {/* wide invisible hit path so hovering the thin edge is forgiving */}
      <path
        d={path}
        data-edge-id={id}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          className={`edge-plus-wrap ${showPlus ? 'show' : ''}`}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            className="edge-plus"
            aria-label="Insert step here"
            onClick={e => {
              e.stopPropagation()
              ctx.onInsertOnEdge(id)
            }}
          >
            ＋
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const JourneyEdgeView = memo(JourneyEdgeViewBase)
