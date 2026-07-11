import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  BackgroundVariant,
  MarkerType,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  useStore,
} from 'reactflow'
import type { Connection, EdgeTypes, NodeTypes, ReactFlowInstance, XYPosition } from 'reactflow'
import 'reactflow/dist/style.css'
import type { AudienceMode, EventCondition, ExitCondition, TriggerType } from '../types'
import { NODE_KINDS } from './registry'
import { useJourneyGraph } from './useJourneyGraph'
import { JourneyNodeView } from './nodes/JourneyNodeView'
import { JourneyEdgeView } from './edges/JourneyEdgeView'
import { NodePalette, DND_MIME } from './NodePalette'
import { NodeEditorSheet } from './NodeEditorSheet'
import { CanvasContext } from './context'
import { EdgeDnDContext } from './edges/edgeDnd'
import { layeredLayout } from './layout'
import type { JourneyNodeData, NodeKind } from './types'

const CONNECTOR = '#F0AA7B'
const BRAND = '#FB6514'

const nodeTypes: NodeTypes = { journey: JourneyNodeView }
const edgeTypes: EdgeTypes = { journey: JourneyEdgeView }
const defaultEdgeOptions = {
  type: 'journey',
  markerEnd: { type: MarkerType.ArrowClosed, color: CONNECTOR, width: 16, height: 16 },
}
const connectionLineStyle = { stroke: BRAND, strokeWidth: 2, strokeDasharray: '6 5' }

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

type PaletteState =
  | { mode: 'free'; x: number; y: number; flow: XYPosition }
  | { mode: 'edge'; x: number; y: number; edgeId: string }
  | { mode: 'connect'; x: number; y: number; flow: XYPosition; source: string; sourceHandle: string | null }
  | null

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function CanvasInner(props: CanvasProps) {
  const g = useJourneyGraph()
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow()
  const zoom = useStore(s => s.transform[2])
  const shellRef = useRef<HTMLDivElement>(null)
  const [live, setLive] = useState(false)
  const [snap, setSnap] = useState(false)
  const [palette, setPalette] = useState<PaletteState>(null)
  const [dropEdgeId, setDropEdgeId] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const connectRef = useRef<{ source: string; sourceHandle: string | null } | null>(null)
  const edgeUpdateOk = useRef(true)
  const reduced = useMemo(prefersReducedMotion, [])

  const entryBadge = useMemo(() => {
    const base: Record<TriggerType, string> = { event: 'On event', fixed: 'At fixed time', exit: 'On journey exit' }
    let t = base[props.triggerType]
    if (props.triggerType === 'event') t += ' · ' + props.eventConds[0].event
    else if (props.triggerType === 'fixed') t += ' · 7 Jul 2026, 11:56 pm'
    else t += ' · ' + props.exitConds[0].journey
    return t
  }, [props.triggerType, props.eventConds, props.exitConds])

  /* screen (client) point → coords inside the canvas shell, for popovers */
  const toShell = useCallback((clientX: number, clientY: number) => {
    const r = shellRef.current?.getBoundingClientRect()
    return { x: clientX - (r?.left ?? 0), y: clientY - (r?.top ?? 0) }
  }, [])

  /* ── connection handling ─────────────────────────────────────── */
  const onConnect = useCallback(
    (c: Connection) => {
      g.connect(c) // already validated by isValidConnection; silent success
    },
    [g],
  )

  const onConnectStart = useCallback((_: unknown, params: { nodeId: string | null; handleId: string | null; handleType: string | null }) => {
    if (params.handleType === 'source' && params.nodeId) {
      connectRef.current = { source: params.nodeId, sourceHandle: params.handleId }
    }
  }, [])

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const pending = connectRef.current
      connectRef.current = null
      if (!pending) return
      const target = event.target as HTMLElement
      const onPane = target?.classList?.contains('react-flow__pane')
      const clientX = 'clientX' in event ? event.clientX : event.changedTouches[0].clientX
      const clientY = 'clientY' in event ? event.clientY : event.changedTouches[0].clientY
      if (onPane) {
        // dropped on empty canvas → open palette, then create node + connection
        const flow = screenToFlowPosition({ x: clientX, y: clientY })
        const s = toShell(clientX, clientY)
        setPalette({ mode: 'connect', x: s.x, y: s.y, flow, source: pending.source, sourceHandle: pending.sourceHandle })
        return
      }
      // dropped on a handle/node that RF rejected as invalid → explain why
      const handleEl = target?.closest?.('.react-flow__handle') as HTMLElement | null
      const nodeEl = target?.closest?.('.react-flow__node') as HTMLElement | null
      const targetId = nodeEl?.getAttribute('data-id') ?? undefined
      if (targetId) {
        const conn: Connection = {
          source: pending.source,
          sourceHandle: pending.sourceHandle,
          target: targetId,
          targetHandle: handleEl?.getAttribute('data-handleid') ?? null,
        }
        if (!g.isValidConnection(conn)) {
          const reason =
            conn.target === conn.source
              ? "a node can't connect to itself"
              : conn.target === g.entryId
                ? "the entry step can't receive a connection"
                : 'that would duplicate an edge or create a loop'
          props.toast(`Can't connect — ${reason}`, 'err')
        }
      }
    },
    [screenToFlowPosition, toShell, g, props],
  )

  /* ── palette drag-and-drop onto canvas / edges ───────────────── */
  const onDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DND_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const edgeEl = el?.closest('[data-edge-id]') as HTMLElement | null
    setDropEdgeId(edgeEl?.getAttribute('data-edge-id') ?? null)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      const kind = e.dataTransfer.getData(DND_MIME) as NodeKind
      if (!kind || !NODE_KINDS[kind]) return
      e.preventDefault()
      if (dropEdgeId) {
        g.insertOnEdge(dropEdgeId, kind)
        props.toast(`${NODE_KINDS[kind].label} inserted`)
      } else {
        const flow = screenToFlowPosition({ x: e.clientX, y: e.clientY })
        g.addNode(kind, flow)
        props.toast(`${NODE_KINDS[kind].label} added`)
      }
      setDropEdgeId(null)
    },
    [dropEdgeId, g, screenToFlowPosition, props],
  )

  /* ── palette open helpers ────────────────────────────────────── */
  const openEmptyPalette = useCallback(() => {
    const r = shellRef.current?.getBoundingClientRect()
    const cx = (r?.width ?? 600) / 2
    const cy = (r?.height ?? 400) / 2
    const flow = screenToFlowPosition({ x: (r?.left ?? 0) + cx, y: (r?.top ?? 0) + cy })
    setPalette({ mode: 'free', x: cx - 100, y: cy - 40, flow })
  }, [screenToFlowPosition])

  const onInsertOnEdge = useCallback(
    (edgeId: string, clientX: number, clientY: number) => {
      const s = toShell(clientX, clientY)
      setPalette({ mode: 'edge', x: s.x, y: s.y, edgeId })
    },
    [toShell],
  )

  const onPalettePick = useCallback(
    (kind: NodeKind) => {
      if (!palette) return
      if (palette.mode === 'free') {
        g.addNode(kind, palette.flow)
        props.toast(`${NODE_KINDS[kind].label} added`)
      } else if (palette.mode === 'edge') {
        g.insertOnEdge(palette.edgeId, kind)
        props.toast(`${NODE_KINDS[kind].label} inserted`)
      } else {
        g.addNodeWithConnection(kind, palette.flow, palette.source, palette.sourceHandle)
        props.toast(`${NODE_KINDS[kind].label} connected`)
      }
      setPalette(null)
    },
    [palette, g, props],
  )

  /* ── keyboard power-user layer ───────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)) return
      const mod = e.metaKey || e.ctrlKey
      if (e.key === 'Escape') {
        setPalette(null)
        setShowHelp(false)
        g.clearSelection()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        g.deleteSelection()
      } else if (mod && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault()
        g.duplicateSelection()
      } else if (mod && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        g.selectAll()
      } else if (mod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        if (e.shiftKey) g.redo()
        else g.undo()
      } else if (mod && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault()
        g.redo()
      } else if (e.key.startsWith('Arrow')) {
        const step = e.shiftKey ? 22 * 5 : 22
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
        if (d) {
          e.preventDefault()
          g.nudgeSelection(d[0], d[1])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [g])

  /* ── tidy up (dagre) ─────────────────────────────────────────── */
  const tidyUp = useCallback(() => {
    if (!g.nodes.length) return
    const positions = layeredLayout(g.nodes, g.edges)
    const shell = shellRef.current
    if (shell && !reduced) {
      shell.classList.add('tidying')
      window.setTimeout(() => shell.classList.remove('tidying'), 340)
    }
    g.setLayout(positions)
    window.setTimeout(() => fitView({ duration: reduced ? 0 : 300, padding: 0.3 }), reduced ? 0 : 40)
  }, [g, fitView, reduced])

  /* ── publish validation on the graph ─────────────────────────── */
  const tryPublish = () => {
    if (g.nodes.length === 0) {
      props.toast('Add at least one action step before publishing', 'err')
      return
    }
    if (props.triggerType === 'event' && props.eventConds[0].event === 'Select an event') {
      props.toast('Entry trigger is missing an event — pick one in step 2', 'err')
      return
    }
    const orphan = g.nodes.find(
      n => n.data.kind === 'cond' && !['yes', 'no'].every(h => g.edges.some(e => e.source === n.id && e.sourceHandle === h)),
    )
    if (orphan) {
      props.toast(`Condition “${orphan.data.title}” has an unconnected YES/NO branch`, 'err')
      return
    }
    setLive(true)
    props.toast('Journey published — now live for new entries')
  }

  const ctxValue = useMemo(
    () => ({
      entryId: g.entryId,
      entryBadge,
      reducedMotion: reduced,
      onEditNode: (id: string) => setEditingId(id),
      onDuplicateNode: (id: string) => g.duplicateNode(id),
      onTestNode: () => props.toast('Test sent to your test device'),
      onDeleteNode: (id: string) => g.deleteNode(id),
      onInsertOnEdge,
    }),
    [g, entryBadge, reduced, onInsertOnEdge, props],
  )

  const editingNode = editingId ? g.nodes.find(n => n.id === editingId) ?? null : null

  return (
    <div className="screen canvas-screen">
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

      <div className="canvas-shell" ref={shellRef} onDragOver={onDragOver} onDrop={onDrop} onDragLeave={() => setDropEdgeId(null)}>
        <CanvasContext.Provider value={ctxValue}>
          <EdgeDnDContext.Provider value={dropEdgeId}>
            <ReactFlow
              nodes={g.nodes}
              edges={g.edges}
              onNodesChange={g.onNodesChange}
              onEdgesChange={g.onEdgesChange}
              onNodeDragStart={g.beginInteraction}
              onNodeDoubleClick={(_e, node) => setEditingId(node.id)}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onEdgeUpdateStart={() => {
                edgeUpdateOk.current = false
              }}
              onEdgeUpdate={(oldEdge, newConnection) => {
                edgeUpdateOk.current = true
                g.reconnect(oldEdge, newConnection)
              }}
              onEdgeUpdateEnd={(_e, edge) => {
                // onEdgeUpdate only fires on a valid handle drop; if it didn't, the
                // edge end was dropped on empty canvas → detach it (undo-able).
                if (!edgeUpdateOk.current) g.detachEdge(edge.id)
                edgeUpdateOk.current = true
              }}
              isValidConnection={g.isValidConnection}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              connectionLineStyle={connectionLineStyle}
              connectionRadius={24}
              edgesUpdatable
              snapToGrid={snap}
              snapGrid={[22, 22]}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.25}
              maxZoom={1.75}
              panOnScroll
              selectionOnDrag
              panOnDrag={[1, 2]}
              panActivationKeyCode="Space"
              selectionKeyCode={null}
              multiSelectionKeyCode="Shift"
              deleteKeyCode={null}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#DADDE3" />
              <MiniMap
                pannable
                zoomable
                className="journey-minimap"
                nodeColor={(n) => NODE_KINDS[(n.data as JourneyNodeData).kind].color}
                nodeStrokeWidth={0}
                maskColor="rgba(251,101,20,0.06)"
              />
            </ReactFlow>
          </EdgeDnDContext.Provider>
        </CanvasContext.Provider>

        {/* empty journey → a single centered ＋ */}
        {g.nodes.length === 0 && (
          <div className="canvas-empty">
            <button className="add-node" onClick={openEmptyPalette} aria-label="Add your first step">
              <span className="plus">＋</span>
            </button>
            <div className="canvas-empty-hint">Add your first step</div>
          </div>
        )}

        {/* bottom-center floating toolbar */}
        <div className="canvas-bottom-bar">
          <button className="cbtn add" onClick={openEmptyPalette} aria-label="Add step" title="Add a step">
            <span className="plus">＋</span> Add step
          </button>
          <span className="cbar-sep" />
          <button className="cbtn" onClick={() => zoomOut()} aria-label="Zoom out" title="Zoom out">
            −
          </button>
          <span className="cbar-zoom">{Math.round(zoom * 100)}%</span>
          <button className="cbtn" onClick={() => zoomIn()} aria-label="Zoom in" title="Zoom in">
            ＋
          </button>
          <button className="cbtn" onClick={() => fitView({ duration: reduced ? 0 : 300, padding: 0.3 })} aria-label="Fit view" title="Fit view">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} width={15} height={15}>
              <path d="M4 9V5a1 1 0 011-1h4M15 4h4a1 1 0 011 1v4M20 15v4a1 1 0 01-1 1h-4M9 20H5a1 1 0 01-1-1v-4" />
            </svg>
          </button>
          <span className="cbar-sep" />
          <button className={`cbtn ${snap ? 'on' : ''}`} onClick={() => setSnap(s => !s)} aria-label="Toggle snap to grid" title="Snap to grid">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} width={15} height={15}>
              <path d="M4 9h16M4 15h16M9 4v16M15 4v16" />
            </svg>
          </button>
          <button className="cbtn" onClick={tidyUp} aria-label="Tidy up layout" title="Tidy up">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} width={15} height={15}>
              <path d="M4 6h8M4 12h16M4 18h11" />
            </svg>
          </button>
          <span className="cbar-sep" />
          <button className="cbtn" onClick={g.undo} disabled={!g.canUndo} aria-label="Undo" title="Undo (⌘Z)">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} width={15} height={15}>
              <path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-1" />
            </svg>
          </button>
          <button className="cbtn" onClick={g.redo} disabled={!g.canRedo} aria-label="Redo" title="Redo (⇧⌘Z)">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} width={15} height={15}>
              <path d="M15 7l5 5-5 5M20 12H9a5 5 0 000 10h1" />
            </svg>
          </button>
          <span className="cbar-sep" />
          <button className={`cbtn ${showHelp ? 'on' : ''}`} onClick={() => setShowHelp(h => !h)} aria-label="Keyboard shortcuts" title="Shortcuts">
            ?
          </button>
          {showHelp && <ShortcutsPopover onClose={() => setShowHelp(false)} />}
        </div>

        {palette && <NodePalette x={palette.x} y={palette.y} onPick={onPalettePick} onClose={() => setPalette(null)} />}

        {editingNode && (
          <NodeEditorSheet
            key={editingNode.id}
            node={editingNode}
            onSave={patch => {
              g.updateNodeData(editingNode.id, patch)
              props.toast('Changes saved')
            }}
            onClose={() => setEditingId(null)}
            onSendTest={() => props.toast('Test sent to your test device')}
          />
        )}
      </div>
    </div>
  )
}

const SHORTCUTS: [string, string][] = [
  ['Drag handle → node', 'Connect'],
  ['Drag handle → canvas', 'Connect + add'],
  ['Hover edge → ＋', 'Insert inline'],
  ['Delete / Backspace', 'Delete selection'],
  ['⌘/Ctrl + D', 'Duplicate'],
  ['⌘/Ctrl + Z', 'Undo'],
  ['⇧ ⌘/Ctrl + Z', 'Redo'],
  ['⌘/Ctrl + A', 'Select all'],
  ['Arrows / ⇧Arrows', 'Nudge selection'],
  ['Space + drag', 'Pan'],
  ['⌘/Ctrl + scroll', 'Zoom'],
]

function ShortcutsPopover({ onClose }: { onClose: () => void }) {
  return (
    <div className="shortcuts-pop" onMouseLeave={onClose}>
      <div className="shortcuts-title">Keyboard & mouse</div>
      {SHORTCUTS.map(([k, v]) => (
        <div className="shortcut-row" key={k}>
          <kbd>{k}</kbd>
          <span>{v}</span>
        </div>
      ))}
    </div>
  )
}

export default function JourneyCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  )
}

export type { CanvasProps, ReactFlowInstance }
