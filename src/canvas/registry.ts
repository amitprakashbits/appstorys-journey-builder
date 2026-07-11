import type { JourneyNodeConfig, NodeKind } from './types'

export interface Branch {
  id: 'yes' | 'no'
  label: string
  tone: 'yes' | 'no'
}

export interface NodeKindDef {
  kind: NodeKind
  label: string
  cls: string // existing .node-kind color class in index.css
  color: string // accent hex (for minimap / swatches)
  category: 'Messaging' | 'Logic'
  description: string
  defaultTitle: string
  defaultMeta: string
  /* Condition splits its output into labelled branches; other kinds have a
     single implicit source handle. */
  branches?: Branch[]
}

export const NODE_KINDS: Record<NodeKind, NodeKindDef> = {
  story: {
    kind: 'story',
    label: 'Story',
    cls: 'k-story',
    color: '#8B5CF6',
    category: 'Messaging',
    description: 'Show a full-screen story campaign',
    defaultTitle: 'US Stocks intro story',
    defaultMeta: '4 slides · CTR —',
  },
  push: {
    kind: 'push',
    label: 'Push notification',
    cls: 'k-push',
    color: '#3B82F6',
    category: 'Messaging',
    description: 'Send a push notification',
    defaultTitle: 'Complete your RFI',
    defaultMeta: 'High priority · CTR —',
  },
  cond: {
    kind: 'cond',
    label: 'Condition',
    cls: 'k-cond',
    color: '#F59E0B',
    category: 'Logic',
    description: 'Branch on a property or event',
    defaultTitle: 'KYC complete?',
    defaultMeta: 'YES / NO branch',
    branches: [
      { id: 'yes', label: 'YES', tone: 'yes' },
      { id: 'no', label: 'NO', tone: 'no' },
    ],
  },
  delay: {
    kind: 'delay',
    label: 'Wait / delay',
    cls: 'k-delay',
    color: '#6B7280',
    category: 'Logic',
    description: 'Pause the journey for a period',
    defaultTitle: 'Wait 24 hours',
    defaultMeta: 'Respects DND window',
  },
}

export const PALETTE_CATEGORIES: { name: NodeKindDef['category']; kinds: NodeKind[] }[] = [
  { name: 'Messaging', kinds: ['story', 'push'] },
  { name: 'Logic', kinds: ['cond', 'delay'] },
]

let cfgSeq = 0

/* Exhaustive over NodeKind — a new kind without a case is a compile error. */
export function makeDefaultConfig(kind: NodeKind): JourneyNodeConfig {
  switch (kind) {
    case 'story':
      return { kind, campaignId: null, campaignName: 'US Stocks intro story' }
    case 'push':
      return { kind, title: 'Complete your RFI', body: '', priority: 'high', deepLink: '' }
    case 'cond':
      return {
        kind,
        rows: [{ id: `r${++cfgSeq}`, property: 'KYC status', operator: 'is', value: 'Complete' }],
        yesLabel: 'YES',
        noLabel: 'NO',
      }
    case 'delay':
      return { kind, amount: 24, unit: 'Hours', respectDnd: true }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}
