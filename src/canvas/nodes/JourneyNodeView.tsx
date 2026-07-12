import { memo } from 'react'
import { Handle, NodeToolbar, Position, useStore } from 'reactflow'
import type { NodeProps } from 'reactflow'
import { NODE_TYPES, branchesFor, cardRows, validity } from '../registry'
import { NodeGlyph } from '../icons'
import { useCanvasContext } from '../context'
import type { JourneyNodeData } from '../types'

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
  const def = NODE_TYPES[data.kind]
  const ctx = useCanvasContext()
  const isEntry = ctx.entryId === id
  const branches = branchesFor(data.kind, data.config)
  const rows = cardRows(data.kind, data.config)
  const valid = validity(data.kind, data.config)

  const outgoing = useStore(s => s.edges.filter(e => e.source === id).map(e => e.sourceHandle ?? '__single__'))
  const hasOut = (handle: string) => outgoing.includes(handle)

  return (
    <div className={`node ${isEntry ? 'is-entry' : ''} ${selected ? 'is-selected' : ''} ${valid.ok ? '' : 'needs-setup'}`}>
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
      <div className="node-kind" style={{ color: def.color }}>
        <span className="node-glyph">
          <NodeGlyph kind={data.kind} size={13} />
        </span>
        {def.name}
        {!valid.ok && <span className="needs-dot" title={valid.msg} />}
      </div>
      <div className="node-title">{data.title}</div>
      {rows.length > 0 && (
        <div className="node-rows">
          {rows.map((r, i) => (
            <div className="node-row" key={i}>
              {r.k && <span className="node-row-k">{r.k}</span>}
              <span className={`node-row-v tone-${r.tone ?? 'default'} ${r.k ? '' : 'full'}`}>{r.v}</span>
            </div>
          ))}
        </div>
      )}
      {!valid.ok && <div className="node-needs">Needs setup — {valid.msg}</div>}

      {branches.length > 0 ? (
        <>
          <div className="node-branches">
            {branches.map(b => (
              <span className={`branch-chip ${b.tone}`} key={b.id}>
                {b.label}
              </span>
            ))}
          </div>
          {branches.map((b, i) => (
            <Handle
              key={b.id}
              type="source"
              id={b.id}
              position={Position.Right}
              className={`rf-handle source ${hasOut(b.id) ? '' : 'terminal'}`}
              style={{ top: `${((i + 1) / (branches.length + 1)) * 100}%` }}
            />
          ))}
        </>
      ) : (
        <Handle type="source" position={Position.Right} className={`rf-handle source ${hasOut('__single__') ? '' : 'terminal'}`} />
      )}
    </div>
  )
}

export const JourneyNodeView = memo(JourneyNodeViewBase)
