/* ── Journey setup wizard — shared model ─────────────────────────── */

export type StepId = 1 | 2 | 3 | 'canvas'

export type TriggerType = 'event' | 'fixed' | 'exit'

export type FixedSchedule = 'asap' | 'date' | 'daily' | 'weekly' | 'monthly'

export interface Goal {
  id: number
  name: string
  event: string
  window: string
}

export interface EventCondition {
  id: number
  event: string
}

export interface ExitCondition {
  id: number
  journey: string
  exitStage: string
}

export interface Rule {
  id: number
  property: string
  operator: string
  value: string
}

export type AudienceMode = 'all' | 'seg' | 'rules'

export type NodeKind = 'story' | 'push' | 'cond' | 'delay'

export interface FlowNode {
  id: number
  kind: NodeKind
  title: string
  meta: string
}

/* Data carried by each React Flow node. `isEntry` / `isTerminal` are derived
   from the edge set on every render (never stored); `entryBadge` is the
   wizard trigger summary, present only on the entry node. */
export interface AppNodeData {
  kind: NodeKind
  title: string
  meta: string
  isEntry?: boolean
  isTerminal?: boolean
  entryBadge?: string
}

export interface ToastState {
  msg: string
  kind: 'ok' | 'err'
  key: number
}
