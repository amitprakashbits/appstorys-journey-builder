import { createContext, useContext, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  BaseEdge,
  Handle,
  MarkerType,
  Position,
  ReactFlowProvider,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useStore,
} from 'reactflow'
import type { EdgeProps, NodeProps } from 'reactflow'
import 'reactflow/dist/style.css'
import type { AppNodeData, AudienceMode, EventCondition, ExitCondition, NodeKind, TriggerType } from '../types'

const CONNECTOR = '#F0AA7B'

const STEP_DEFS: Record<NodeKind, { cls: string; label: string; title: string; meta: string; sw: string }> = {
  story: { cls: 'k-story', label: 'Story', title: 'US Stocks intro story', meta: '4 slides · CTR —', sw: 'var(--purple)' },
  push: { cls: 'k-push', label: 'Push notification', title: 'Complete your RFI', meta: 'High priority · CTR —', sw: 'var(--blue)' },
  cond: { cls: 'k-cond', label: 'Condition', title: 'KYC complete?', meta: 'YES / NO branch', sw: 'var(--amber)' },
  delay: { cls: 'k-delay', label: 'Wait / delay', title: 'Wait 24 hours', meta: 'Respects DND window', sw: 'var(--tx3)' },
}

const NODE_GAP = 300
let nodeSeq = 0

/* Entry-trigger summary flows to the entry node without going through node data,
   so the wizard trigger config can update it live. */
const EntryBadgeContext = createContext<string>('')

/* ── custom node — wraps the existing .node card markup 1:1 ────── */
function AppFlowNode({ id, data }: NodeProps<AppNodeData>) {
  const def = STEP_DEFS[data.kind]
  const entryBadge = useContext(EntryBadgeContext)
  /* entry = no incoming edge, terminal = no outgoing edge (read from the store) */
  const isEntry = useStore(s => !s.edges.some(e => e.target === id))
  const isTerminal = useStore(s => !s.edges.some(e => e.source === id))
  return (
    <div className={`node ${isEntry ? 'is-entry' : ''}`}>
      <Handle type="target" position={Position.Left} className="rf-handle" isConnectable={false} />
      {isEntry && (
        <div className="node-entry-badge">
          <span className="live-dot" /> {entryBadge}
        </div>
      )}
      <div className={`node-kind ${def.cls}`}>{def.label}</div>
      <div className="node-title">{data.title}</div>
      <div className="node-meta">{data.meta}</div>
      <Handle
        type="source"
        position={Position.Right}
        className={`rf-handle ${isTerminal ? 'terminal' : ''}`}
        isConnectable={false}
      />
    </div>
  )
}

/* ── custom edge — connector color; P6 extends this with hover-＋ ─ */
function AppEdge(props: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 10,
  })
  return <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={{ stroke: CONNECTOR, strokeWidth: 2 }} />
}

const nodeTypes = { app: AppFlowNode }
const edgeTypes = { app: AppEdge }
const defaultEdgeOptions = {
  type: 'app',
  markerEnd: { type: MarkerType.ArrowClosed, color: CONNECTOR, width: 16, height: 16 },
}

/* ── node palette (reused for empty-state + bottom bar) ────────── */
function Palette(props: { onPick: (k: NodeKind) => void; className?: string }) {
  return (
    <div className={`palette ${props.className ?? ''}`} onClick={e => e.stopPropagation()}>
      {(Object.keys(STEP_DEFS) as NodeKind[]).map(k => (
        <button key={k} onClick={() => props.onPick(k)}>
          <span className="sw" style={{ background: STEP_DEFS[k].sw }} /> {STEP_DEFS[k].label}
        </button>
      ))}
    </div>
  )
}

type CanvasProps = {
  journeyName: string
  triggerType: TriggerType
  eventConds: EventCondition[]
  exitConds: ExitCondition[]
  exitDelayNum: number
  exitDelayUnit: string
  audMode: AudienceMode
  onBackToSetup: () => void
  toast: (m: string, k?: 'ok' | 'err') => void
}

function CanvasInner(props: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNodeData>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [emptyPaletteOpen, setEmptyPaletteOpen] = useState(false)
  const [barPaletteOpen, setBarPaletteOpen] = useState(false)
  const [live, setLive] = useState(false)
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  /* entry-trigger summary — attaches to the first node as a badge */
  const entryBadge = useMemo(() => {
    const base: Record<TriggerType, string> = { event: 'On event', fixed: 'At fixed time', exit: 'On journey exit' }
    let t = base[props.triggerType]
    if (props.triggerType === 'event') t += ' · ' + props.eventConds[0].event
    else if (props.triggerType === 'fixed') t += ' · 7 Jul 2026, 11:56 pm'
    else t += ' · ' + props.exitConds[0].journey
    return t
  }, [props.triggerType, props.eventConds, props.exitConds])

  const addStep = (kind: NodeKind) => {
    const def = STEP_DEFS[kind]
    const id = `n${++nodeSeq}`
    const last = nodes[nodes.length - 1]
    const position = last ? { x: last.position.x + NODE_GAP, y: last.position.y } : { x: 0, y: 0 }
    setNodes(prev => [...prev, { id, type: 'app', position, data: { kind, title: def.title, meta: def.meta } }])
    if (last) setEdges(prev => [...prev, { id: `e-${last.id}-${id}`, source: last.id, target: id, type: 'app' }])
    setEmptyPaletteOpen(false)
    setBarPaletteOpen(false)
    props.toast(`${def.label} step added`)
    window.setTimeout(() => fitView({ duration: 300, padding: 0.25 }), 0)
  }

  const tryPublish = () => {
    if (nodes.length === 0) {
      props.toast('Add at least one action step before publishing', 'err')
      return
    }
    if (props.triggerType === 'event' && props.eventConds[0].event === 'Select an event') {
      props.toast('Entry trigger is missing an event — pick one in step 2', 'err')
      return
    }
    setLive(true)
    props.toast('Journey published — now live for new entries')
  }

  return (
    <div className="screen canvas-screen">
      {/* page toolbar — stays above the canvas, unchanged */}
      <div className="canvas-toolbar">
        <button className="btn" onClick={props.onBackToSetup}>
          ← Back to setup
        </button>
        <span className="cname">{props.journeyName}</span>
        <span className={`status ${live ? 'live' : ''}`}>{live ? 'LIVE' : 'DRAFT'}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => props.toast('Draft saved')}>
          Save draft
        </button>
        <button className="btn primary" onClick={tryPublish}>
          Publish journey
        </button>
      </div>

      <div className="canvas-shell" onClick={() => (setEmptyPaletteOpen(false), setBarPaletteOpen(false))}>
        <EntryBadgeContext.Provider value={entryBadge}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={1.75}
            panOnScroll
            selectionOnDrag
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color="#DADDE3" />
          </ReactFlow>
        </EntryBadgeContext.Provider>

        {/* empty journey → a single centered ＋ button, nothing else */}
        {nodes.length === 0 && (
          <div className="canvas-empty" onClick={e => e.stopPropagation()}>
            <button
              className="add-node"
              onClick={() => setEmptyPaletteOpen(o => !o)}
              aria-label="Add first step"
            >
              <span className="plus">＋</span> Add first step
            </button>
            {emptyPaletteOpen && <Palette onPick={addStep} className="up" />}
          </div>
        )}

        {/* bottom-center floating toolbar: zoom / fit / add */}
        <div className="canvas-bottom-bar" onClick={e => e.stopPropagation()}>
          <button className="cbtn" onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out">
            −
          </button>
          <button className="cbtn" onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in">
            ＋
          </button>
          <button className="cbtn" onClick={() => fitView({ duration: 300, padding: 0.3 })} aria-label="Fit view" title="Fit view">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} width={15} height={15}>
              <path d="M4 9V5a1 1 0 011-1h4M15 4h4a1 1 0 011 1v4M20 15v4a1 1 0 01-1 1h-4M9 20H5a1 1 0 01-1-1v-4" />
            </svg>
          </button>
          <span className="cbar-sep" />
          <div className="cbar-add">
            <button className="cbtn add primary" onClick={() => setBarPaletteOpen(o => !o)} disabled={nodes.length === 0}>
              <span className="plus">＋</span> Add step
            </button>
            {barPaletteOpen && <Palette onPick={addStep} className="up" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}
