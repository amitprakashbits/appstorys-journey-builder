import dagre from 'dagre'
import type { XYPosition } from 'reactflow'
import type { JourneyEdge, JourneyNode } from './types'

const NODE_W = 232
const NODE_H = 116

/* Left-to-right layered layout. Condition branches are biased so the YES edge
   sits above the NO edge (dagre visits edges in insertion order per rank). */
export function layeredLayout(nodes: JourneyNode[], edges: JourneyEdge[]): Record<string, XYPosition> {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 44, ranksep: 96, marginx: 24, marginy: 24 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }))

  const ordered = [...edges].sort((a, b) => {
    const rank = (e: JourneyEdge) => (e.data?.branch === 'yes' ? 0 : e.data?.branch === 'no' ? 1 : 0)
    return rank(a) - rank(b)
  })
  ordered.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  const positions: Record<string, XYPosition> = {}
  nodes.forEach(n => {
    const p = g.node(n.id)
    if (p) positions[n.id] = { x: Math.round(p.x - NODE_W / 2), y: Math.round(p.y - NODE_H / 2) }
  })
  return positions
}
