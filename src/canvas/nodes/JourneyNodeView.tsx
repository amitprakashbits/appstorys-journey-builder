import { memo } from 'react'
import { Handle, NodeToolbar, Position, useStore } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { NODE_KINDS } from '../registry'
import { useCanvasContext } from '../context'
import type { JourneyNodeData } from '../types'

/* toolbar icons — small, currentColor stroke */
const I = {
  edit: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />,
  dup: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </>
  ),
  test: <path d="M8 5v14l11-7z" />,
  del: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />,
}

function ToolbarBtn(props: { d: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button className={`ntb-btn ${props.danger ? 'danger' : ''}`} title={props.label} aria-label={props.label} onClick={props.onClick}>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} width={15} height={15}>
        {props.d}
      </svg>
    </button>
  )
}

function JourneyNodeViewBase({ id, data, selected }: NodeProps<JourneyNodeData>) {
  const def = NODE_KINDS[data.kind]
  const ctx = useCanvasContext()
  const isEntry = ctx.entryId === id

  /* outgoing edges by handle, read from the store (updates as edges change) */
  const outgoing = useStore(s => s.edges.filter(e => e.source === id).map(e => e.sourceHandle ?? '__single__'))
  const hasOut = (handle: string) => outgoing.includes(handle)

  return (
    <div className={`node ${isEntry ? 'is-entry' : ''} ${selected ? 'is-selected' : ''}`}>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
        <div className="node-toolbar">
          <ToolbarBtn d={I.edit} label="Edit" onClick={() => ctx.onEditNode(id)} />
          <ToolbarBtn d={I.dup} label="Duplicate" onClick={() => ctx.onDuplicateNode(id)} />
          <ToolbarBtn d={I.test} label="Send test" onClick={() => ctx.onTestNode(id)} />
          <ToolbarBtn d={I.del} label="Delete" danger onClick={() => ctx.onDeleteNode(id)} />
        </div>
      </NodeToolbar>

      <Handle type="target" position={Position.Left} className="rf-handle target" />

      {isEntry && (
        <div className="node-entry-badge">
          <span className="live-dot" /> {ctx.entryBadge}
        </div>
      )}
      <div className={`node-kind ${def.cls}`}>{def.label}</div>
      <div className="node-title">{data.title}</div>
      <div className="node-meta">{data.meta}</div>

      {def.branches ? (
        <div className="node-branches">
          {def.branches.map((b, i) => (
            <div className="branch-row" key={b.id}>
              <span className={`branch-chip ${b.tone}`}>{b.label}</span>
              <Handle
                type="source"
                id={b.id}
                position={Position.Right}
                className={`rf-handle source ${hasOut(b.id) ? '' : 'terminal'}`}
                style={{ top: `calc(100% - ${(def.branches!.length - i) * 24 - 8}px)` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <Handle type="source" position={Position.Right} className={`rf-handle source ${hasOut('__single__') ? '' : 'terminal'}`} />
      )}
    </div>
  )
}

export const JourneyNodeView = memo(JourneyNodeViewBase)
