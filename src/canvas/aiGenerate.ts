import { makeDefaultConfig } from './registry'
import { newCondition } from '../components/ConditionBuilder'
import type { JourneyNodeConfig, NodeKind } from './types'

/* A generated node/edge spec the graph can hydrate. Mock "AI" for the
   prototype — swap generate*() for a real LLM call returning this shape. */
export interface GenNode {
  kind: NodeKind
  title: string
  config: JourneyNodeConfig
}
export interface GenEdge {
  from: number
  to: number
  branch?: string
}
export interface FlowSpec {
  note: string
  nodes: GenNode[]
  edges: GenEdge[]
}

let aiSeq = 0
const build = (kind: NodeKind, title: string, patch: Record<string, unknown> = {}): GenNode => ({
  kind,
  title,
  config: { ...makeDefaultConfig(kind), ...patch } as JourneyNodeConfig,
})

const nice = (s: string) => {
  const t = s.trim().replace(/\s+/g, ' ')
  if (!t) return 'your users'
  return t.length > 42 ? t.slice(0, 42) + '…' : t
}
const detectChannel = (p: string): NodeKind => {
  const lc = p.toLowerCase()
  if (lc.includes('email')) return 'email'
  if (lc.includes('sms') || lc.includes('text message')) return 'sms'
  if (lc.includes('whatsapp')) return 'whatsapp'
  return 'push'
}
const msgConfig = (kind: NodeKind, headline: string, body: string): Record<string, unknown> => {
  if (kind === 'email') return { subject: headline, templateId: 'ai_draft', fromName: 'Tickertape' }
  if (kind === 'sms') return { body: `${headline} — ${body}`.slice(0, 160), senderId: 'TICKR' }
  if (kind === 'whatsapp') return { templateId: 'ai_draft', phoneField: 'phone', params: headline }
  return { title: headline, body, deepLink: '' }
}

/* ── whole journey ────────────────────────────────────────────── */
export function generateJourney(prompt: string): FlowSpec {
  const lc = prompt.toLowerCase()
  const channel = detectChannel(prompt)
  const theme = nice(prompt)
  const isWinback = /(winback|win back|dormant|churn|re-?engage|inactive|lapsed)/.test(lc)
  const isOnboard = /(onboard|welcome|new user|sign ?up|first)/.test(lc) || !isWinback

  const condEvent = /kyc/.test(lc) ? 'KYC_Completed' : /invest|sip|stock|gold/.test(lc) ? 'First_Investment_Complete' : 'App_Opened'

  const welcome = isWinback ? `We miss you` : `Welcome — ${theme}`
  const yesTitle = isWinback ? `Great to have you back` : `You're all set 🎉`
  const noTitle = isWinback ? `Here's an offer to return` : `Finish setting up`

  const nodes: GenNode[] = [
    build('modal', welcome, { source: 'create', campaignId: `c-ai-${++aiSeq}`, campaignName: welcome, size: 'md', dismissible: true }),
    build('delay', isWinback ? 'Wait 3 days' : 'Wait 1 day', { amount: isWinback ? 3 : 1, unit: 'Days', respectDnd: true }),
    build('cond', 'Converted?', {
      conditions: [{ ...newCondition(), event: condEvent }],
      yesLabel: 'Yes',
      noLabel: 'No',
    }),
    build(channel, yesTitle, msgConfig(channel, yesTitle, `Thanks for engaging with ${theme}.`)),
    build(channel, noTitle, msgConfig(channel, noTitle, `A quick nudge about ${theme}.`)),
  ]
  const edges: GenEdge[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3, branch: 'yes' },
    { from: 2, to: 4, branch: 'no' },
  ]
  const note = `A ${nodes.length}-step ${isWinback ? 'win-back' : 'onboarding'} journey: an in-app welcome, a wait, then a ${condEvent} check that branches into ${channel} follow-ups.`
  return { note, nodes, edges }
}

/* ── single campaign draft ────────────────────────────────────── */
export function generateCampaign(prompt: string): { note: string; node: GenNode } {
  const channel = detectChannel(prompt)
  const theme = nice(prompt)
  const headline = /off|sale|discount|deal/.test(prompt.toLowerCase()) ? `Don't miss out — ${theme}` : theme.charAt(0).toUpperCase() + theme.slice(1)
  const body = `${headline}. Tap to learn more.`
  const node = build(channel, headline, msgConfig(channel, headline, body))
  const label = channel === 'push' ? 'push notification' : channel
  const note = `Drafted a ${label}: “${headline}”.`
  return { note, node }
}
