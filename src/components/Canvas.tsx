import JourneyCanvas from '../canvas/JourneyCanvas'
import type { AudienceMode, EventCondition, ExitCondition, TriggerType } from '../types'

/* Thin adapter: the journey canvas now lives under src/canvas/ (n8n-like
   free-form editor built on React Flow). App.tsx keeps importing this. */
export default function Canvas(props: {
  journeyName: string
  triggerType: TriggerType
  eventConds: EventCondition[]
  exitConds: ExitCondition[]
  exitDelayNum: number
  exitDelayUnit: string
  audMode: AudienceMode
  onBackToSetup: () => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  return <JourneyCanvas {...props} />
}
