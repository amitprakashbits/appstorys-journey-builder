import type { Edge, Node } from 'reactflow'

/* ── node kinds ──────────────────────────────────────────────────
   Every kind has: a config shape (ConfigByKind), a registry entry
   (registry.ts), an icon (icons.tsx) and an editor (editors/). Adding a kind
   without all four is a compile error via the exhaustive maps/switches. */
export type NodeKind =
  // Campaigns — in-app messaging
  | 'animations'
  | 'bottomsheet'
  | 'carousel'
  | 'spotlight'
  | 'floater'
  | 'gamification'
  | 'modal'
  | 'pagepop'
  | 'pinnedbanner'
  | 'tooltip'
  | 'video'
  | 'widgets'
  // Messages
  | 'push'
  | 'whatsapp'
  | 'email'
  | 'sms'
  // Branching
  | 'cond'
  | 'randomsplit'
  // Delay
  | 'delay'
  // Data
  | 'setattr'
  | 'segment'
  // Flow control
  | 'jump'

export type NodeFamily = 'campaign' | 'message' | 'branching' | 'delay' | 'data' | 'flow'

/* shared building blocks */
export interface CondRow {
  id: string
  property: string
  operator: string
  value: string
}
export interface SplitPath {
  id: string
  label: string
  weight: number
}
/* Campaign types are "create a new campaign of this type, or import an existing
   one"; content is edited in the campaign flow (handoff). */
export interface CampaignBase {
  source: 'create' | 'import'
  campaignId: string | null
  campaignName: string
}

/* ── per-kind config shapes ──────────────────────────────────── */
export interface ConfigByKind {
  animations: CampaignBase & { loop: boolean }
  bottomsheet: CampaignBase & { height: 'half' | 'full'; dismissible: boolean }
  carousel: CampaignBase & { cards: number; autoplay: boolean }
  spotlight: CampaignBase & { anchor: string; style: 'pulse' | 'ring' }
  floater: CampaignBase & { position: 'br' | 'bl'; label: string }
  gamification: CampaignBase & { game: 'spin' | 'scratch' | 'slot'; reward: string }
  modal: CampaignBase & { size: 'sm' | 'md' | 'lg'; dismissible: boolean }
  pagepop: CampaignBase & { dismissible: boolean }
  pinnedbanner: CampaignBase & { position: 'top' | 'bottom'; dismissible: boolean }
  tooltip: CampaignBase & { anchor: string; placement: 'top' | 'bottom' | 'left' | 'right' }
  video: CampaignBase & { url: string; autoplay: boolean }
  widgets: CampaignBase & { widgetId: string }

  push: { title: string; body: string; deepLink: string; priority: 'high' | 'normal' }
  whatsapp: { templateId: string; phoneField: string; params: string }
  email: { subject: string; templateId: string; fromName: string }
  sms: { body: string; senderId: string }

  cond: { rows: CondRow[]; yesLabel: string; noLabel: string }
  randomsplit: { paths: SplitPath[] }

  delay: { amount: number; unit: 'Minutes' | 'Hours' | 'Days'; respectDnd: boolean }

  setattr: { attribute: string; value: string }
  segment: { action: 'add' | 'remove'; segment: string }

  jump: { targetId: string | null }
}

export type NodeConfig<K extends NodeKind = NodeKind> = ConfigByKind[K]
export type JourneyNodeConfig = ConfigByKind[NodeKind]

export interface JourneyNodeData {
  kind: NodeKind
  title: string
  meta: string
  config: JourneyNodeConfig
}

export type JourneyNode = Node<JourneyNodeData, 'journey'>

export interface JourneyEdgeData {
  branch?: string
}
export type JourneyEdge = Edge<JourneyEdgeData>

export interface GraphSnapshot {
  nodes: JourneyNode[]
  edges: JourneyEdge[]
  entryId: string | null
}

/* an output branch (source handle) on a node */
export interface Branch {
  id: string
  label: string
  tone: 'yes' | 'no' | 'neutral'
}
