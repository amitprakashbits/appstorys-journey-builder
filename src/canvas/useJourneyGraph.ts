import { useCallback, useRef, useState } from 'react'
import { applyEdgeChanges, applyNodeChanges, updateEdge } from 'reactflow'
import type { Connection, EdgeChange, NodeChange, XYPosition } from 'reactflow'
import { NODE_KINDS, makeDefaultConfig } from './registry'
import type { GraphSnapshot, JourneyEdge, JourneyNode, NodeKind } from './types'

const HISTORY_LIMIT = 50

let seq = 0
const nid = () => `n${++seq}`
const eid = () => `e${++seq}`

function makeNode(kind: NodeKind, position: XYPosition): JourneyNode {
  const def = NODE_KINDS[kind]
  return {
    id: nid(),
    type: 'journey',
    position,
    data: { kind, title: def.defaultTitle, meta: def.defaultMeta, config: makeDefaultConfig(kind) },
  }
}

function makeEdge(source: string, target: string, sourceHandle?: string | null): JourneyEdge {
  const branch = sourceHandle === 'yes' || sourceHandle === 'no' ? sourceHandle : undefined
  return {
    id: eid(),
    source,
    target,
    type: 'journey',
    sourceHandle: sourceHandle ?? undefined,
    data: branch ? { branch } : {},
  }
}

const clone = (g: GraphSnapshot): GraphSnapshot => structuredClone(g)

/* Would adding source→target create a cycle? True if `source` is already
   reachable from `target` along existing edges. */
function createsCycle(edges: JourneyEdge[], source: string, target: string): boolean {
  const out = new Map<string, string[]>()
  for (const e of edges) (out.get(e.source) ?? out.set(e.source, []).get(e.source)!).push(e.target)
  const stack = [target]
  const seen = new Set<string>()
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === source) return true
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const nxt of out.get(cur) ?? []) stack.push(nxt)
  }
  return false
}

export interface JourneyGraph {
  nodes: JourneyNode[]
  edges: JourneyEdge[]
  entryId: string | null
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  beginInteraction: () => void
  addNode: (kind: NodeKind, position: XYPosition) => string
  addNodeWithConnection: (kind: NodeKind, position: XYPosition, source: string, sourceHandle?: string | null) => void
  insertOnEdge: (edgeId: string, kind: NodeKind) => void
  connect: (c: Connection) => boolean
  reconnect: (oldEdge: JourneyEdge, newConnection: Connection) => boolean
  detachEdge: (edgeId: string) => void
  deleteSelection: () => void
  duplicateSelection: () => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => void
  nudgeSelection: (dx: number, dy: number) => void
  selectAll: () => void
  clearSelection: () => void
  setLayout: (positions: Record<string, XYPosition>) => void
  isValidConnection: (c: Connection) => boolean
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

export function useJourneyGraph(): JourneyGraph {
  const [graph, setGraph] = useState<GraphSnapshot>({ nodes: [], edges: [], entryId: null })
  const ref = useRef(graph)
  ref.current = graph
  const past = useRef<GraphSnapshot[]>([])
  const future = useRef<GraphSnapshot[]>([])
  const [, bump] = useState(0)
  const touch = () => bump(v => v + 1)

  const pushHistory = useCallback(() => {
    past.current.push(clone(ref.current))
    if (past.current.length > HISTORY_LIMIT) past.current.shift()
    future.current = []
    touch()
  }, [])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setGraph(g => ({ ...g, nodes: applyNodeChanges(changes, g.nodes) as JourneyNode[] })),
    [],
  )
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setGraph(g => ({ ...g, edges: applyEdgeChanges(changes, g.edges) as JourneyEdge[] })),
    [],
  )

  const addNode = useCallback(
    (kind: NodeKind, position: XYPosition) => {
      pushHistory()
      const node = makeNode(kind, position)
      setGraph(g => ({ ...g, nodes: [...g.nodes, node], entryId: g.entryId ?? node.id }))
      return node.id
    },
    [pushHistory],
  )

  const addNodeWithConnection = useCallback(
    (kind: NodeKind, position: XYPosition, source: string, sourceHandle?: string | null) => {
      pushHistory()
      const node = makeNode(kind, position)
      const edge = makeEdge(source, node.id, sourceHandle)
      setGraph(g => ({ ...g, nodes: [...g.nodes, node], edges: [...g.edges, edge], entryId: g.entryId ?? source }))
    },
    [pushHistory],
  )

  const insertOnEdge = useCallback(
    (edgeId: string, kind: NodeKind) => {
      const g0 = ref.current
      const edge = g0.edges.find(e => e.id === edgeId)
      const a = edge && g0.nodes.find(n => n.id === edge.source)
      const b = edge && g0.nodes.find(n => n.id === edge.target)
      if (!edge || !a || !b) return
      pushHistory()
      const mid: XYPosition = { x: (a.position.x + b.position.x) / 2, y: (a.position.y + b.position.y) / 2 }
      const node = makeNode(kind, mid)
      setGraph(g => {
        const nodes = g.nodes
          .map(n => (n.id !== a.id && n.position.x >= b.position.x ? { ...n, position: { ...n.position, x: n.position.x + 170 } } : n))
          .concat(node)
        const edges = g.edges
          .filter(e => e.id !== edgeId)
          .concat(makeEdge(a.id, node.id, edge.sourceHandle), makeEdge(node.id, b.id))
        return { ...g, nodes, edges }
      })
    },
    [pushHistory],
  )

  const isValidConnection = useCallback((c: Connection) => {
    const g = ref.current
    if (!c.source || !c.target) return false
    if (c.source === c.target) return false
    if (c.target === g.entryId) return false
    if (
      g.edges.some(
        e => e.source === c.source && e.target === c.target && (e.sourceHandle ?? null) === (c.sourceHandle ?? null),
      )
    )
      return false
    if (createsCycle(g.edges, c.source, c.target)) return false
    return true
  }, [])

  const connect = useCallback(
    (c: Connection) => {
      if (!isValidConnection(c)) return false
      pushHistory()
      setGraph(g => ({ ...g, edges: [...g.edges, makeEdge(c.source!, c.target!, c.sourceHandle)] }))
      return true
    },
    [isValidConnection, pushHistory],
  )

  const reconnect = useCallback(
    (oldEdge: JourneyEdge, newConnection: Connection) => {
      if (!isValidConnection(newConnection)) return false
      pushHistory()
      setGraph(g => ({ ...g, edges: updateEdge(oldEdge, newConnection, g.edges) as JourneyEdge[] }))
      return true
    },
    [isValidConnection, pushHistory],
  )

  const detachEdge = useCallback(
    (edgeId: string) => {
      pushHistory()
      setGraph(g => ({ ...g, edges: g.edges.filter(e => e.id !== edgeId) }))
    },
    [pushHistory],
  )

  const deleteSelection = useCallback(() => {
    const g0 = ref.current
    const selNodes = new Set(g0.nodes.filter(n => n.selected).map(n => n.id))
    const selEdges = new Set(g0.edges.filter(e => e.selected).map(e => e.id))
    if (!selNodes.size && !selEdges.size) return
    pushHistory()
    setGraph(g => {
      const nodes = g.nodes.filter(n => !selNodes.has(n.id))
      const edges = g.edges.filter(e => !selEdges.has(e.id) && !selNodes.has(e.source) && !selNodes.has(e.target))
      const entryId =
        g.entryId && selNodes.has(g.entryId) ? (nodes.find(n => !edges.some(e => e.target === n.id))?.id ?? null) : g.entryId
      return { nodes, edges, entryId }
    })
  }, [pushHistory])

  const deleteNode = useCallback(
    (id: string) => {
      pushHistory()
      setGraph(g => {
        const nodes = g.nodes.filter(n => n.id !== id)
        const edges = g.edges.filter(e => e.source !== id && e.target !== id)
        const entryId = g.entryId === id ? (nodes.find(n => !edges.some(e => e.target === n.id))?.id ?? null) : g.entryId
        return { nodes, edges, entryId }
      })
    },
    [pushHistory],
  )

  const duplicateNode = useCallback(
    (id: string) => {
      const src = ref.current.nodes.find(n => n.id === id)
      if (!src) return
      pushHistory()
      const copyId = nid()
      const copy: JourneyNode = {
        ...src,
        id: copyId,
        selected: true,
        position: { x: src.position.x + 40, y: src.position.y + 40 },
        data: { ...src.data, config: structuredClone(src.data.config) },
      }
      setGraph(g => ({ ...g, nodes: [...g.nodes.map(n => ({ ...n, selected: false })), copy] }))
    },
    [pushHistory],
  )

  const duplicateSelection = useCallback(() => {
    const g0 = ref.current
    const sel = g0.nodes.filter(n => n.selected)
    if (!sel.length) return
    pushHistory()
    const idMap = new Map<string, string>()
    const copies: JourneyNode[] = sel.map(n => {
      const id = nid()
      idMap.set(n.id, id)
      return {
        ...n,
        id,
        selected: true,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        data: { ...n.data, config: structuredClone(n.data.config) },
      }
    })
    const copyEdges: JourneyEdge[] = g0.edges
      .filter(e => idMap.has(e.source) && idMap.has(e.target))
      .map(e => ({ ...e, id: eid(), source: idMap.get(e.source)!, target: idMap.get(e.target)!, selected: false }))
    setGraph(g => ({
      ...g,
      nodes: [...g.nodes.map(n => ({ ...n, selected: false })), ...copies],
      edges: [...g.edges, ...copyEdges],
    }))
  }, [pushHistory])

  const lastNudge = useRef(0)
  const nudgeSelection = useCallback(
    (dx: number, dy: number) => {
      const g0 = ref.current
      if (!g0.nodes.some(n => n.selected)) return
      const now = performance.now()
      if (now - lastNudge.current > 500) pushHistory()
      lastNudge.current = now
      setGraph(g => ({
        ...g,
        nodes: g.nodes.map(n => (n.selected ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)),
      }))
    },
    [pushHistory],
  )

  const selectAll = useCallback(
    () =>
      setGraph(g => ({
        ...g,
        nodes: g.nodes.map(n => ({ ...n, selected: true })),
        edges: g.edges.map(e => ({ ...e, selected: true })),
      })),
    [],
  )
  const clearSelection = useCallback(
    () =>
      setGraph(g => ({
        ...g,
        nodes: g.nodes.map(n => ({ ...n, selected: false })),
        edges: g.edges.map(e => ({ ...e, selected: false })),
      })),
    [],
  )

  const setLayout = useCallback(
    (positions: Record<string, XYPosition>) => {
      pushHistory()
      setGraph(g => ({ ...g, nodes: g.nodes.map(n => (positions[n.id] ? { ...n, position: positions[n.id] } : n)) }))
    },
    [pushHistory],
  )

  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(clone(ref.current))
    setGraph(prev)
    touch()
  }, [])
  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    past.current.push(clone(ref.current))
    setGraph(next)
    touch()
  }, [])

  return {
    nodes: graph.nodes,
    edges: graph.edges,
    entryId: graph.entryId,
    onNodesChange,
    onEdgesChange,
    beginInteraction: pushHistory,
    addNode,
    addNodeWithConnection,
    insertOnEdge,
    connect,
    reconnect,
    detachEdge,
    deleteSelection,
    duplicateSelection,
    deleteNode,
    duplicateNode,
    nudgeSelection,
    selectAll,
    clearSelection,
    setLayout,
    isValidConnection,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}
