import type { Branch, CampaignBase, CardRow, ConfigByKind, JourneyNodeConfig, NodeFamily, NodeKind, Validity } from './types'

export interface NodeTypeDef {
  kind: NodeKind
  family: NodeFamily
  name: string
  description: string
  color: string
  defaultTitle: string
}

/* accent colour per family (node cards + minimap + palette tiles) */
export const FAMILY_COLOR: Record<NodeFamily, string> = {
  campaign: '#FB6514',
  message: '#3B82F6',
  action: '#F59E0B',
  ai: '#8B5CF6',
  usercond: '#F59E0B',
  branching: '#F59E0B',
  delay: '#6B7280',
  data: '#8B5CF6',
  flow: '#10B981',
}

export const FAMILY_LABEL: Record<NodeFamily, string> = {
  campaign: 'Campaigns',
  message: 'Messages',
  action: 'Action conditions',
  ai: 'AI tools',
  usercond: 'User conditions',
  branching: 'Split user path',
  delay: 'Delay',
  data: 'Data',
  flow: 'Flow control',
}

const T = (kind: NodeKind, family: NodeFamily, name: string, description: string, defaultTitle: string, color?: string): NodeTypeDef => ({
  kind,
  family,
  name,
  description,
  color: color ?? FAMILY_COLOR[family],
  defaultTitle,
})

export const NODE_TYPES: Record<NodeKind, NodeTypeDef> = {
  // Campaigns — in-app messaging
  animations: T('animations', 'campaign', 'Animations', 'Lottie & motion overlays', 'Welcome animation'),
  bottomsheet: T('bottomsheet', 'campaign', 'Bottom Sheet', 'Slide-up panel from the bottom', 'Bottom sheet'),
  carousel: T('carousel', 'campaign', 'Carousel', 'Swipeable multi-card set', 'Feature carousel'),
  spotlight: T('spotlight', 'campaign', 'Element Spotlight', 'Highlight a specific UI element', 'Spotlight'),
  floater: T('floater', 'campaign', 'Floater', 'Persistent floating button', 'Floating button'),
  gamification: T('gamification', 'campaign', 'Gamification', 'Spin, scratch & reward games', 'Spin the wheel'),
  modal: T('modal', 'campaign', 'Modal', 'Centered popup dialog', 'Welcome modal'),
  pagepop: T('pagepop', 'campaign', 'Page Pop', 'Full-screen takeover', 'Full-screen takeover'),
  pinnedbanner: T('pinnedbanner', 'campaign', 'Pinned Banner', 'Sticky top strip', 'Pinned banner'),
  tooltip: T('tooltip', 'campaign', 'Tooltip', 'Anchored hint bubble', 'Feature tooltip'),
  video: T('video', 'campaign', 'Video', 'Embedded video message', 'Product video'),
  widgets: T('widgets', 'campaign', 'Widgets', 'Embedded native widget', 'Home widget'),
  // Messages
  push: T('push', 'message', 'Push Notification', 'Re-engage with a system push', 'Complete your RFI'),
  whatsapp: T('whatsapp', 'message', 'WhatsApp', 'Message via WhatsApp Business', 'WhatsApp nudge'),
  email: T('email', 'message', 'Email', 'Send a templated email', 'Onboarding email'),
  sms: T('sms', 'message', 'SMS', 'Send a plain text message', 'SMS reminder'),
  // Action conditions (message interaction)
  msg_seen: T('msg_seen', 'action', 'Has seen mobile in-app message', 'Branch on whether the user saw a message', 'Seen in-app message'),
  msg_clicked: T('msg_clicked', 'action', 'Has clicked mobile in-app message', 'Branch on whether the user clicked a message', 'Clicked in-app message'),
  msg_closed: T('msg_closed', 'action', 'Has closed mobile in-app message', 'Branch on whether the user closed a message', 'Closed in-app message'),
  // AI tools
  path_optimizer: T('path_optimizer', 'ai', 'Intelligent path optimizer', 'Dynamically select user path to maximize engagement', 'Path optimizer'),
  // User conditions
  check_attr: T('check_attr', 'usercond', 'Check User Attribute', 'Split users based on their user property', 'Check attribute'),
  has_done_event: T('has_done_event', 'usercond', 'Has done event', 'Split users based on the event(s) performed', 'Has done event'),
  // Split user path (branching)
  cond: T('cond', 'branching', 'Conditional Split', 'Split users into paths based on performed events & properties', 'KYC complete?'),
  randomsplit: T('randomsplit', 'branching', 'A/B Split', 'Randomly split users into multiple paths for experimentation', 'A/B split', '#8B5CF6'),
  // Delay
  delay: T('delay', 'delay', 'Delay', 'Wait a set time before the next node', 'Wait 24 hours'),
  // Data
  setattr: T('setattr', 'data', 'Update Backend Attribute', 'Set or change a user attribute', 'Set attribute'),
  segment: T('segment', 'data', 'Add / update a Live Segment', 'Add or remove users from a segment', 'Update segment'),
  // Flow control
  jump: T('jump', 'flow', 'Jump / Go to node', 'Send the user to another node', 'Go to node'),
}

/* palette category rail order + membership */
export const FAMILY_ORDER: NodeFamily[] = ['campaign', 'message', 'action', 'ai', 'usercond', 'branching', 'delay', 'data', 'flow']
export const KINDS_BY_FAMILY: Record<NodeFamily, NodeKind[]> = FAMILY_ORDER.reduce(
  (acc, fam) => {
    acc[fam] = (Object.keys(NODE_TYPES) as NodeKind[]).filter(k => NODE_TYPES[k].family === fam)
    return acc
  },
  {} as Record<NodeFamily, NodeKind[]>,
)

let seq = 0
const campaignBase = (): CampaignBase => ({ source: 'import', campaignId: null, campaignName: '' })

/* exhaustive: a new kind without a case is a compile error */
export function makeDefaultConfig(kind: NodeKind): JourneyNodeConfig {
  switch (kind) {
    case 'animations':
      return { ...campaignBase(), loop: true }
    case 'bottomsheet':
      return { ...campaignBase(), height: 'half', dismissible: true }
    case 'carousel':
      return { ...campaignBase(), cards: 3, autoplay: false }
    case 'spotlight':
      return { ...campaignBase(), anchor: '', style: 'pulse' }
    case 'floater':
      return { ...campaignBase(), position: 'br', label: '' }
    case 'gamification':
      return { ...campaignBase(), game: 'spin', reward: '' }
    case 'modal':
      return { ...campaignBase(), size: 'md', dismissible: true }
    case 'pagepop':
      return { ...campaignBase(), dismissible: true }
    case 'pinnedbanner':
      return { ...campaignBase(), position: 'top', dismissible: true }
    case 'tooltip':
      return { ...campaignBase(), anchor: '', placement: 'bottom' }
    case 'video':
      return { ...campaignBase(), url: '', autoplay: false }
    case 'widgets':
      return { ...campaignBase(), widgetId: '' }
    case 'push':
      return { title: 'Complete your RFI', body: '', deepLink: '', priority: 'high' }
    case 'whatsapp':
      return { templateId: '', phoneField: 'phone', params: '' }
    case 'email':
      return { subject: '', templateId: '', fromName: 'Tickertape' }
    case 'sms':
      return { body: '', senderId: 'TICKR' }
    case 'msg_seen':
    case 'msg_clicked':
    case 'msg_closed':
      return { campaignId: null, campaignName: '', withinValue: 1, withinUnit: 'Days' }
    case 'path_optimizer':
      return {
        objective: 'engagement',
        arms: [
          { id: `a${++seq}`, label: 'Path A' },
          { id: `a${++seq}`, label: 'Path B' },
        ],
      }
    case 'check_attr':
      return { attribute: '', operator: 'is', value: '' }
    case 'has_done_event':
      return { event: 'Select an event', withinValue: 7, withinUnit: 'Days', filters: [] }
    case 'cond':
      return { rows: [{ id: `r${++seq}`, property: 'KYC status', operator: 'is', value: 'Complete' }], yesLabel: 'YES', noLabel: 'NO' }
    case 'randomsplit':
      return {
        paths: [
          { id: `p${++seq}`, label: 'Variant A', weight: 50 },
          { id: `p${++seq}`, label: 'Variant B', weight: 50 },
        ],
      }
    case 'delay':
      return { amount: 24, unit: 'Hours', respectDnd: true }
    case 'setattr':
      return { attribute: '', value: '' }
    case 'segment':
      return { action: 'add', segment: '' }
    case 'jump':
      return { targetId: null }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export function newSplitPath(): ConfigByKind['randomsplit']['paths'][number] {
  return { id: `p${++seq}`, label: 'New path', weight: 0 }
}
export function newCondRow(): ConfigByKind['cond']['rows'][number] {
  return { id: `r${++seq}`, property: 'Platform', operator: 'is', value: '' }
}

/* node-card meta line, derived from config. `kind` selects the shape. */
export function summarize(kind: NodeKind, config: JourneyNodeConfig): string {
  const fam = NODE_TYPES[kind].family
  if (fam === 'campaign') {
    const c = config as CampaignBase
    return c.campaignId ? `${c.source === 'create' ? 'New' : 'Imported'} · ${c.campaignName || NODE_TYPES[kind].name}` : 'Not configured'
  }
  switch (kind) {
    case 'msg_seen':
    case 'msg_clicked':
    case 'msg_closed': {
      const c = config as ConfigByKind['msg_seen']
      const verb = kind === 'msg_seen' ? 'Seen' : kind === 'msg_clicked' ? 'Clicked' : 'Closed'
      return c.campaignId ? `${verb} · within ${c.withinValue} ${c.withinUnit.toLowerCase()}` : 'Pick a message'
    }
    case 'path_optimizer': {
      const c = config as ConfigByKind['path_optimizer']
      return `${c.arms.length} arms · ${c.objective}`
    }
    case 'check_attr': {
      const c = config as ConfigByKind['check_attr']
      return c.attribute ? `${c.attribute} ${c.operator} ${c.value || '—'}` : 'No attribute'
    }
    case 'has_done_event': {
      const c = config as ConfigByKind['has_done_event']
      return c.event && c.event !== 'Select an event' ? c.event : 'No event'
    }
    case 'push':
      return `${(config as ConfigByKind['push']).priority === 'high' ? 'High' : 'Normal'} priority`
    case 'whatsapp': {
      const c = config as ConfigByKind['whatsapp']
      return c.templateId ? `Template ${c.templateId}` : 'No template'
    }
    case 'email': {
      const c = config as ConfigByKind['email']
      return c.subject || 'No subject'
    }
    case 'sms': {
      const c = config as ConfigByKind['sms']
      return c.body ? `“${c.body.slice(0, 24)}${c.body.length > 24 ? '…' : ''}”` : 'No message'
    }
    case 'cond': {
      const c = config as ConfigByKind['cond']
      return `${c.rows.length} rule${c.rows.length === 1 ? '' : 's'} · ${c.yesLabel} / ${c.noLabel}`
    }
    case 'randomsplit': {
      const c = config as ConfigByKind['randomsplit']
      return `${c.paths.length} paths · ${c.paths.map(p => p.weight + '%').join(' / ')}`
    }
    case 'delay': {
      const c = config as ConfigByKind['delay']
      return `Wait ${c.amount} ${c.unit.toLowerCase()}${c.respectDnd ? ' · Respects DND' : ''}`
    }
    case 'setattr': {
      const c = config as ConfigByKind['setattr']
      return c.attribute ? `${c.attribute} = ${c.value || '—'}` : 'No attribute'
    }
    case 'segment': {
      const c = config as ConfigByKind['segment']
      return c.segment ? `${c.action === 'add' ? 'Add to' : 'Remove from'} ${c.segment}` : 'No segment'
    }
    case 'jump': {
      const c = config as ConfigByKind['jump']
      return c.targetId ? 'Jumps to a node' : 'No target'
    }
    default:
      return NODE_TYPES[kind].description
  }
}

const YES_NO: Branch[] = [
  { id: 'yes', label: 'YES', tone: 'yes' },
  { id: 'no', label: 'NO', tone: 'no' },
]

/* output branches (extra source handles) for branching nodes */
export function branchesFor(kind: NodeKind, config: JourneyNodeConfig): Branch[] {
  if (kind === 'msg_seen' || kind === 'msg_clicked' || kind === 'msg_closed' || kind === 'check_attr' || kind === 'has_done_event') {
    return YES_NO
  }
  if (kind === 'path_optimizer') {
    const c = config as ConfigByKind['path_optimizer']
    return c.arms.map(a => ({ id: a.id, label: a.label, tone: 'neutral' as const }))
  }
  if (kind === 'cond') {
    const c = config as ConfigByKind['cond']
    return [
      { id: 'yes', label: c.yesLabel, tone: 'yes' },
      { id: 'no', label: c.noLabel, tone: 'no' },
    ]
  }
  if (kind === 'randomsplit') {
    const c = config as ConfigByKind['randomsplit']
    return c.paths.map(p => ({ id: p.id, label: `${p.weight}%`, tone: 'neutral' as const }))
  }
  return []
}

/* ── card-data contract: rows shown on the canvas card ────────── */
const sumWeights = (c: ConfigByKind['randomsplit']) => c.paths.reduce((s, p) => s + p.weight, 0)
const setNone = (v: string): CardRow['tone'] => (v ? 'yes' : 'muted')

/* type-specific rows for campaign kinds (source row is prepended by cardRows) */
function campaignSettings(kind: NodeKind, config: JourneyNodeConfig): CardRow[] {
  switch (kind) {
    case 'animations':
      return [{ k: 'Loop', v: (config as ConfigByKind['animations']).loop ? 'Yes' : 'No', tone: 'muted' }]
    case 'bottomsheet': {
      const c = config as ConfigByKind['bottomsheet']
      return [{ k: 'Height', v: c.height === 'full' ? 'Full' : 'Half' }, { k: 'Dismiss', v: c.dismissible ? 'Yes' : 'No', tone: 'muted' }]
    }
    case 'carousel': {
      const c = config as ConfigByKind['carousel']
      return [{ k: 'Cards', v: String(c.cards) }, { k: 'Auto', v: c.autoplay ? 'Yes' : 'No', tone: 'muted' }]
    }
    case 'spotlight': {
      const c = config as ConfigByKind['spotlight']
      return [{ k: 'Anchor', v: c.anchor || '—', tone: c.anchor ? 'default' : 'muted' }, { k: 'Style', v: c.style }]
    }
    case 'floater': {
      const c = config as ConfigByKind['floater']
      return [{ k: 'Position', v: c.position === 'br' ? 'Bottom-right' : 'Bottom-left' }]
    }
    case 'gamification': {
      const c = config as ConfigByKind['gamification']
      return [{ k: 'Game', v: c.game }, { k: 'Reward', v: c.reward || '—', tone: c.reward ? 'default' : 'muted' }]
    }
    case 'modal': {
      const c = config as ConfigByKind['modal']
      return [{ k: 'Size', v: c.size.toUpperCase() }, { k: 'Dismiss', v: c.dismissible ? 'Yes' : 'No', tone: 'muted' }]
    }
    case 'pagepop':
      return [{ k: 'Dismiss', v: (config as ConfigByKind['pagepop']).dismissible ? 'Yes' : 'No', tone: 'muted' }]
    case 'pinnedbanner': {
      const c = config as ConfigByKind['pinnedbanner']
      return [{ k: 'Position', v: c.position === 'top' ? 'Top' : 'Bottom' }, { k: 'Dismiss', v: c.dismissible ? 'Yes' : 'No', tone: 'muted' }]
    }
    case 'tooltip': {
      const c = config as ConfigByKind['tooltip']
      return [{ k: 'Anchor', v: c.anchor || '—', tone: c.anchor ? 'default' : 'muted' }, { k: 'Placement', v: c.placement }]
    }
    case 'video': {
      const c = config as ConfigByKind['video']
      return [{ k: 'URL', v: c.url ? 'Set' : 'None', tone: setNone(c.url) }, { k: 'Autoplay', v: c.autoplay ? 'Yes' : 'No', tone: 'muted' }]
    }
    case 'widgets':
      return [{ k: 'Widget', v: (config as ConfigByKind['widgets']).widgetId || '—', tone: (config as ConfigByKind['widgets']).widgetId ? 'default' : 'muted' }]
    default:
      return []
  }
}

export function cardRows(kind: NodeKind, config: JourneyNodeConfig): CardRow[] {
  if (NODE_TYPES[kind].family === 'campaign') {
    const c = config as CampaignBase
    const rows: CardRow[] = []
    if (c.campaignId) rows.push({ k: 'Source', v: c.campaignName || NODE_TYPES[kind].name, tone: 'accent' })
    rows.push(...campaignSettings(kind, config))
    return rows.slice(0, 3)
  }
  switch (kind) {
    case 'push': {
      const c = config as ConfigByKind['push']
      return [
        { k: 'Priority', v: c.priority === 'high' ? 'High' : 'Normal', tone: c.priority === 'high' ? 'accent' : 'default' },
        { k: 'Deep link', v: c.deepLink ? 'Set' : 'None', tone: setNone(c.deepLink) },
      ]
    }
    case 'whatsapp': {
      const c = config as ConfigByKind['whatsapp']
      return [{ k: 'Template', v: c.templateId || '—', tone: c.templateId ? 'accent' : 'muted' }]
    }
    case 'email': {
      const c = config as ConfigByKind['email']
      return [
        { k: 'Subject', v: c.subject || '—', tone: c.subject ? 'default' : 'muted' },
        { k: 'Template', v: c.templateId || '—', tone: c.templateId ? 'default' : 'muted' },
      ]
    }
    case 'sms': {
      const c = config as ConfigByKind['sms']
      return [{ k: 'Message', v: c.body ? `“${c.body.slice(0, 22)}${c.body.length > 22 ? '…' : ''}”` : '—', tone: c.body ? 'default' : 'muted' }]
    }
    case 'msg_seen':
    case 'msg_clicked':
    case 'msg_closed': {
      const c = config as ConfigByKind['msg_seen']
      return [
        { k: 'Message', v: c.campaignName || '—', tone: c.campaignId ? 'accent' : 'muted' },
        { k: 'Within', v: `${c.withinValue} ${c.withinUnit.toLowerCase()}`, tone: 'muted' },
      ]
    }
    case 'path_optimizer': {
      const c = config as ConfigByKind['path_optimizer']
      return [{ k: 'Optimize', v: c.objective, tone: 'accent' }, { k: 'Arms', v: String(c.arms.length), tone: 'muted' }]
    }
    case 'check_attr': {
      const c = config as ConfigByKind['check_attr']
      return [{ k: 'If', v: c.attribute ? `${c.attribute} ${c.operator} ${c.value || '—'}` : '—', tone: c.attribute ? 'default' : 'muted' }]
    }
    case 'has_done_event': {
      const c = config as ConfigByKind['has_done_event']
      const has = c.event && c.event !== 'Select an event'
      const rows: CardRow[] = [{ k: 'Event', v: has ? c.event : '—', tone: has ? 'accent' : 'muted' }]
      if (c.filters.length) rows.push({ k: 'Where', v: `${c.filters.length} attribute filter${c.filters.length > 1 ? 's' : ''}`, tone: 'muted' })
      else rows.push({ k: 'Within', v: `${c.withinValue} ${c.withinUnit.toLowerCase()}`, tone: 'muted' })
      return rows
    }
    case 'cond': {
      const c = config as ConfigByKind['cond']
      const rows: CardRow[] = [{ k: 'If', v: `${c.rows[0].property} ${c.rows[0].operator} ${c.rows[0].value || '—'}` }]
      if (c.rows.length > 1) rows.push({ k: '', v: `+${c.rows.length - 1} more rule${c.rows.length > 2 ? 's' : ''}`, tone: 'muted' })
      return rows
    }
    case 'randomsplit':
      return [{ k: 'Split', v: `${(config as ConfigByKind['randomsplit']).paths.length} variants`, tone: 'muted' }]
    case 'delay': {
      const c = config as ConfigByKind['delay']
      return [
        { k: 'Wait', v: `${c.amount} ${c.unit.toLowerCase()}`, tone: 'accent' },
        { k: 'DND', v: c.respectDnd ? 'Respected' : 'Ignored', tone: 'muted' },
      ]
    }
    case 'setattr': {
      const c = config as ConfigByKind['setattr']
      return [{ k: 'Set', v: c.attribute ? `${c.attribute} = ${c.value || '—'}` : 'No attribute', tone: c.attribute ? 'accent' : 'muted' }]
    }
    case 'segment': {
      const c = config as ConfigByKind['segment']
      return [{ k: c.action === 'add' ? 'Add to' : 'Remove from', v: c.segment || '—', tone: c.segment ? 'accent' : 'muted' }]
    }
    case 'jump': {
      const c = config as ConfigByKind['jump']
      return [{ k: 'Jump to', v: c.targetId ? 'a node' : '—', tone: c.targetId ? 'default' : 'muted' }]
    }
    default:
      return [{ k: '', v: summarize(kind, config), tone: 'muted' }]
  }
}

export function validity(kind: NodeKind, config: JourneyNodeConfig): Validity {
  if (NODE_TYPES[kind].family === 'campaign') {
    return (config as CampaignBase).campaignId ? { ok: true } : { ok: false, msg: 'Pick or create a campaign' }
  }
  switch (kind) {
    case 'push':
      return (config as ConfigByKind['push']).title ? { ok: true } : { ok: false, msg: 'Needs a title' }
    case 'whatsapp':
      return (config as ConfigByKind['whatsapp']).templateId ? { ok: true } : { ok: false, msg: 'Needs a template' }
    case 'email':
      return (config as ConfigByKind['email']).templateId ? { ok: true } : { ok: false, msg: 'Needs a template' }
    case 'sms':
      return (config as ConfigByKind['sms']).body ? { ok: true } : { ok: false, msg: 'Needs a message' }
    case 'msg_seen':
    case 'msg_clicked':
    case 'msg_closed':
      return (config as ConfigByKind['msg_seen']).campaignId ? { ok: true } : { ok: false, msg: 'Pick a message' }
    case 'path_optimizer':
      return (config as ConfigByKind['path_optimizer']).arms.length >= 2 ? { ok: true } : { ok: false, msg: 'Needs at least 2 paths' }
    case 'check_attr': {
      const c = config as ConfigByKind['check_attr']
      return c.attribute ? { ok: true } : { ok: false, msg: 'Needs an attribute' }
    }
    case 'has_done_event': {
      const c = config as ConfigByKind['has_done_event']
      return c.event && c.event !== 'Select an event' ? { ok: true } : { ok: false, msg: 'Pick an event' }
    }
    case 'cond':
      return (config as ConfigByKind['cond']).rows[0].value ? { ok: true } : { ok: false, msg: 'Complete the first rule' }
    case 'randomsplit': {
      const total = sumWeights(config as ConfigByKind['randomsplit'])
      return total === 100 ? { ok: true } : { ok: false, msg: `Weights total ${total}%, must be 100%` }
    }
    case 'delay':
      return (config as ConfigByKind['delay']).amount > 0 ? { ok: true } : { ok: false, msg: 'Set a wait time' }
    case 'setattr':
      return (config as ConfigByKind['setattr']).attribute ? { ok: true } : { ok: false, msg: 'Needs an attribute' }
    case 'segment':
      return (config as ConfigByKind['segment']).segment ? { ok: true } : { ok: false, msg: 'Pick a segment' }
    case 'jump':
      return (config as ConfigByKind['jump']).targetId ? { ok: true } : { ok: false, msg: 'Pick a target node' }
    default:
      return { ok: true }
  }
}
