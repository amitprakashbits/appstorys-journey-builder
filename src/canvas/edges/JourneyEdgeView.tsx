import { memo, useState } from 'react'
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useStore } from 'reactflow'
import type { EdgeProps } from 'reactflow'
import { branchesFor } from '../registry'
import { useCanvasContext } from '../context'
import { useDropEdgeId } from './edgeDnd'
import type { JourneyEdgeData, JourneyNodeData } from '../types'

const CONNECTOR = '#F0AA7B'

function JourneyEdgeViewBase(props: EdgeProps<JourneyEdgeData>) {
  const { id, source, sourceHandleId, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, selected } = props
  const ctx = useCanvasContext()
  const dropEdgeId = useDropEdgeId()
  const [hovered, setHovered] = useState(false)

  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 14 })
  const isDropTarget = dropEdgeId === id
  const showPlus = hovered || isDropTarget

  /* branch label (Yes / No / arm) read from the source node — sits on the edge */
  const srcData = useStore(s => s.nodeInternals.get(source)?.data as JourneyNodeData | undefined)
  const branch = srcData && sourceHandleId ? branchesFor(srcData.kind, srcData.config).find(b => b.id === sourceHandleId) : undefined

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: isDropTarget || hovered || selected ? '#FB6514' : CONNECTOR,
          strokeWidth: isDropTarget ? 3.25 : hovered || selected ? 2.75 : 2,
          filter: isDropTarget || hovered || selected ? 'drop-shadow(0 1px 3px rgba(253,95,3,.28))' : undefined,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease, filter 0.15s ease',
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

      {branch && (
        <EdgeLabelRenderer>
          <div className={`edge-branch ${branch.tone}`} style={{ transform: `translate(-50%, -50%) translate(${sourceX}px, ${sourceY + 24}px)` }}>
            {branch.label}
          </div>
        </EdgeLabelRenderer>
      )}

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
