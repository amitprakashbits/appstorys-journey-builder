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

/* Canvas node/edge/graph types now live in src/canvas/types.ts (the React Flow
   editor owns its own model). */

export interface ToastState {
  msg: string
  kind: 'ok' | 'err'
  key: number
}
