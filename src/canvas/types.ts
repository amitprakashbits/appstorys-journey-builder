import type { Edge, Node } from 'reactflow'

/* ── node kinds ──────────────────────────────────────────────────
   Adding a kind: extend NodeKind, add a config variant below, and add a
   NODE_KINDS entry in registry.ts. The switch in makeDefaultConfig() and any
   `kind`-exhaustive code then fails to compile until the new kind is handled. */
export type NodeKind = 'story' | 'push' | 'cond' | 'delay'

export interface StoryConfig {
  kind: 'story'
  campaignId: string | null
  campaignName: string
}
export interface PushConfig {
  kind: 'push'
  title: string
  body: string
  priority: 'high' | 'normal'
  deepLink: string
}
export interface CondRow {
  id: string
  property: string
  operator: string
  value: string
}
export interface CondConfig {
  kind: 'cond'
  rows: CondRow[]
  yesLabel: string
  noLabel: string
}
export interface DelayConfig {
  kind: 'delay'
  amount: number
  unit: 'Minutes' | 'Hours' | 'Days'
  respectDnd: boolean
}
export type JourneyNodeConfig = StoryConfig | PushConfig | CondConfig | DelayConfig

/* Data carried by every canvas node. `isEntry` is derived at render time from
   the graph's entry id, not stored here. */
export interface JourneyNodeData {
  kind: NodeKind
  title: string
  meta: string
  config: JourneyNodeConfig
}

/* React Flow node/edge specialised to our data. Position lives on the RF node
   (`node.position`) — that is the persisted spatial layout. */
export type JourneyNode = Node<JourneyNodeData, 'journey'>

export interface JourneyEdgeData {
  /* for Condition sources: which branch this edge leaves from */
  branch?: 'yes' | 'no'
}
export type JourneyEdge = Edge<JourneyEdgeData>

/* Snapshot the history stack stores. */
export interface GraphSnapshot {
  nodes: JourneyNode[]
  edges: JourneyEdge[]
  entryId: string | null
}
