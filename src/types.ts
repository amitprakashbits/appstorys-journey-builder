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

export interface FlowNode {
  id: number
  kind: 'story' | 'push' | 'cond' | 'delay'
  title: string
  meta: string
}

export interface ToastState {
  msg: string
  kind: 'ok' | 'err'
  key: number
}
