import type { ReactNode } from 'react'
import { PillGroup, Toggle } from '../../components/ui'
import { newCondRow, newSplitPath } from '../registry'
import { useEditorEnv } from './env'
import type { CampaignBase, ConfigByKind, NodeKind } from '../types'

export type EditorFor<K extends NodeKind> = (props: {
  config: ConfigByKind[K]
  onChange: (c: ConfigByKind[K]) => void
}) => JSX.Element

/* ── mock option lists (swap for API data) ────────────────────── */
const CAMPAIGNS = [
  { id: 'c-us-stocks', name: 'US Stocks intro' },
  { id: 'c-kyc', name: 'KYC nudge' },
  { id: 'c-sip', name: 'SIP winback' },
]
const ATTRS = ['kyc_status', 'risk_profile', 'sip_active', 'app_theme', 'lifetime_value']
const SEGMENTS = ['US Stocks — RFI pending', 'KYC complete', 'SIP investors', 'Dormant 30d']
const WA_TEMPLATES = ['rfi_reminder_v2', 'kyc_nudge_v1', 'sip_winback_v3']
const EMAIL_TEMPLATES = ['onboarding_v3', 'winback_v1', 'monthly_digest']
const PROPERTIES = ['KYC status', 'Platform', 'App version', 'Portfolio value', 'Last active']
const OPERATORS = ['is', 'is not', 'greater than', 'less than']
let seq = 3000

/* ── tiny field helpers ───────────────────────────────────────── */
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="field">
    <label className="field-label">{label}</label>
    {children}
  </div>
)
const TextField = (p: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean }) => (
  <Field label={p.label}>
    {p.area ? (
      <textarea className="text-input input-md editor-textarea" rows={3} value={p.value} placeholder={p.placeholder} onChange={e => p.onChange(e.target.value)} />
    ) : (
      <input className="text-input input-md" value={p.value} placeholder={p.placeholder} onChange={e => p.onChange(e.target.value)} />
    )}
  </Field>
)
const SelectField = (p: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; placeholder?: string }) => (
  <Field label={p.label}>
    <select className="select input-md" value={p.value} onChange={e => p.onChange(e.target.value)}>
      {p.placeholder && <option value="">{p.placeholder}</option>}
      {p.options.map(o => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </Field>
)
const ToggleField = (p: { label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="toggle-row" style={{ marginTop: 2 }}>
    <Toggle checked={p.checked} onChange={p.onChange} />
    <div style={{ flex: 1 }}>
      <div className="t-label">{p.label}</div>
      {p.sub && <div className="t-sub">{p.sub}</div>}
    </div>
  </div>
)

/* create-or-import header shared by all campaign types */
function CampaignSource<C extends CampaignBase>({ config, onChange }: { config: C; onChange: (c: C) => void }) {
  return (
    <>
      <Field label="Source">
        <PillGroup
          value={config.source}
          options={[
            { value: 'import', label: 'Import existing' },
            { value: 'create', label: 'Create new' },
          ]}
          onChange={source =>
            onChange(
              source === 'create'
                ? { ...config, source, campaignId: `c-new-${++seq}`, campaignName: '' }
                : { ...config, source, campaignId: null, campaignName: '' },
            )
          }
        />
      </Field>
      {config.source === 'import' ? (
        <Field label="Campaign">
          <select
            className="select input-md"
            value={config.campaignId ?? ''}
            onChange={e => {
              const c = CAMPAIGNS.find(x => x.id === e.target.value)
              onChange({ ...config, campaignId: c?.id ?? null, campaignName: c?.name ?? '' })
            }}
          >
            <option value="">Select a campaign…</option>
            {CAMPAIGNS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <TextField label="New campaign name" value={config.campaignName} placeholder="Name this campaign" onChange={v => onChange({ ...config, campaignName: v })} />
      )}
      {config.campaignId && (
        <button
          className="add-link sm"
          onClick={() => window.open(`/campaigns/${config.campaignId}?returnTo=journey-builder`, '_blank', 'noopener')}
        >
          Edit content in campaign flow →
        </button>
      )}
    </>
  )
}

/* ── campaign editors ─────────────────────────────────────────── */
const AnimationsEditor: EditorFor<'animations'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <ToggleField label="Loop animation" checked={config.loop} onChange={loop => onChange({ ...config, loop })} />
  </div>
)
const BottomSheetEditor: EditorFor<'bottomsheet'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <Field label="Height">
      <PillGroup value={config.height} options={[{ value: 'half', label: 'Half' }, { value: 'full', label: 'Full' }]} onChange={height => onChange({ ...config, height })} />
    </Field>
    <ToggleField label="Dismissible" checked={config.dismissible} onChange={dismissible => onChange({ ...config, dismissible })} />
  </div>
)
const CarouselEditor: EditorFor<'carousel'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <Field label="Cards">
      <input className="text-input input-sm" type="number" min={1} max={10} value={config.cards} onChange={e => onChange({ ...config, cards: Math.max(1, Number(e.target.value) || 1) })} />
    </Field>
    <ToggleField label="Auto-advance" checked={config.autoplay} onChange={autoplay => onChange({ ...config, autoplay })} />
  </div>
)
const SpotlightEditor: EditorFor<'spotlight'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <TextField label="Anchor element" value={config.anchor} placeholder="e.g. #invest-cta" onChange={anchor => onChange({ ...config, anchor })} />
    <Field label="Highlight style">
      <PillGroup value={config.style} options={[{ value: 'pulse', label: 'Pulse' }, { value: 'ring', label: 'Ring' }]} onChange={style => onChange({ ...config, style })} />
    </Field>
  </div>
)
const FloaterEditor: EditorFor<'floater'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <Field label="Position">
      <PillGroup value={config.position} options={[{ value: 'br', label: 'Bottom-right' }, { value: 'bl', label: 'Bottom-left' }]} onChange={position => onChange({ ...config, position })} />
    </Field>
    <TextField label="Button label" value={config.label} placeholder="Invest now" onChange={label => onChange({ ...config, label })} />
  </div>
)
const GamificationEditor: EditorFor<'gamification'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <SelectField label="Game" value={config.game} options={['spin', 'scratch', 'slot']} onChange={v => onChange({ ...config, game: v as ConfigByKind['gamification']['game'] })} />
    <TextField label="Reward" value={config.reward} placeholder="₹100 cashback" onChange={reward => onChange({ ...config, reward })} />
  </div>
)
const ModalEditor: EditorFor<'modal'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <Field label="Size">
      <PillGroup value={config.size} options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} onChange={size => onChange({ ...config, size })} />
    </Field>
    <ToggleField label="Dismissible" checked={config.dismissible} onChange={dismissible => onChange({ ...config, dismissible })} />
  </div>
)
const PagePopEditor: EditorFor<'pagepop'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <ToggleField label="Dismissible" sub="Allow users to close the takeover." checked={config.dismissible} onChange={dismissible => onChange({ ...config, dismissible })} />
  </div>
)
const PinnedBannerEditor: EditorFor<'pinnedbanner'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <Field label="Position">
      <PillGroup value={config.position} options={[{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }]} onChange={position => onChange({ ...config, position })} />
    </Field>
    <ToggleField label="Dismissible" checked={config.dismissible} onChange={dismissible => onChange({ ...config, dismissible })} />
  </div>
)
const TooltipEditor: EditorFor<'tooltip'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <TextField label="Anchor element" value={config.anchor} placeholder="e.g. #portfolio-tab" onChange={anchor => onChange({ ...config, anchor })} />
    <SelectField label="Placement" value={config.placement} options={['top', 'bottom', 'left', 'right']} onChange={v => onChange({ ...config, placement: v as ConfigByKind['tooltip']['placement'] })} />
  </div>
)
const VideoEditor: EditorFor<'video'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <TextField label="Video URL" value={config.url} placeholder="https://…" onChange={url => onChange({ ...config, url })} />
    <ToggleField label="Autoplay" checked={config.autoplay} onChange={autoplay => onChange({ ...config, autoplay })} />
  </div>
)
const WidgetsEditor: EditorFor<'widgets'> = ({ config, onChange }) => (
  <div className="editor-form">
    <CampaignSource config={config} onChange={onChange} />
    <TextField label="Widget id" value={config.widgetId} placeholder="home_portfolio_v2" onChange={widgetId => onChange({ ...config, widgetId })} />
  </div>
)

/* ── message editors ──────────────────────────────────────────── */
const PushEditor: EditorFor<'push'> = ({ config, onChange }) => (
  <div className="editor-form">
    <TextField label="Title" value={config.title} onChange={title => onChange({ ...config, title })} />
    <TextField label="Body" area value={config.body} onChange={body => onChange({ ...config, body })} />
    <Field label="Priority">
      <PillGroup value={config.priority} options={[{ value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }]} onChange={priority => onChange({ ...config, priority })} />
    </Field>
    <TextField label="Deep link" value={config.deepLink} placeholder="appstorys://…" onChange={deepLink => onChange({ ...config, deepLink })} />
  </div>
)
const WhatsAppEditor: EditorFor<'whatsapp'> = ({ config, onChange }) => (
  <div className="editor-form">
    <SelectField label="Template" value={config.templateId} options={WA_TEMPLATES} placeholder="Select a template…" onChange={templateId => onChange({ ...config, templateId })} />
    <TextField label="Phone field" value={config.phoneField} onChange={phoneField => onChange({ ...config, phoneField })} />
    <TextField label="Template params" value={config.params} placeholder="name, amount" onChange={params => onChange({ ...config, params })} />
  </div>
)
const EmailEditor: EditorFor<'email'> = ({ config, onChange }) => (
  <div className="editor-form">
    <TextField label="Subject" value={config.subject} onChange={subject => onChange({ ...config, subject })} />
    <SelectField label="Template" value={config.templateId} options={EMAIL_TEMPLATES} placeholder="Select a template…" onChange={templateId => onChange({ ...config, templateId })} />
    <TextField label="From name" value={config.fromName} onChange={fromName => onChange({ ...config, fromName })} />
  </div>
)
const SmsEditor: EditorFor<'sms'> = ({ config, onChange }) => (
  <div className="editor-form">
    <TextField label="Message" area value={config.body} placeholder="160 characters" onChange={body => onChange({ ...config, body })} />
    <TextField label="Sender id" value={config.senderId} onChange={senderId => onChange({ ...config, senderId })} />
  </div>
)

/* ── branching editors ────────────────────────────────────────── */
const CondEditor: EditorFor<'cond'> = ({ config, onChange }) => {
  const setRow = (id: string, patch: Partial<ConfigByKind['cond']['rows'][number]>) =>
    onChange({ ...config, rows: config.rows.map(r => (r.id === id ? { ...r, ...patch } : r)) })
  return (
    <div className="editor-form">
      <label className="field-label">Match all of these</label>
      {config.rows.map(r => (
        <div className="cond-row" key={r.id}>
          <select className="select input-sm" style={{ minWidth: 120 }} value={r.property} onChange={e => setRow(r.id, { property: e.target.value })}>
            {PROPERTIES.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select className="select input-sm" style={{ width: 110, minWidth: 0 }} value={r.operator} onChange={e => setRow(r.id, { operator: e.target.value })}>
            {OPERATORS.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <input className="text-input input-sm" style={{ minWidth: 0 }} placeholder="Value" value={r.value} onChange={e => setRow(r.id, { value: e.target.value })} />
          <button className="x" aria-label="Remove rule" onClick={() => config.rows.length > 1 && onChange({ ...config, rows: config.rows.filter(x => x.id !== r.id) })}>
            ✕
          </button>
        </div>
      ))}
      <button className="add-link sm" onClick={() => onChange({ ...config, rows: [...config.rows, newCondRow()] })}>
        ＋ Add rule (AND)
      </button>
      <div className="inline-fields" style={{ marginTop: 14 }}>
        <Field label="YES branch label">
          <input className="text-input input-sm" value={config.yesLabel} onChange={e => onChange({ ...config, yesLabel: e.target.value })} />
        </Field>
        <Field label="NO branch label">
          <input className="text-input input-sm" value={config.noLabel} onChange={e => onChange({ ...config, noLabel: e.target.value })} />
        </Field>
      </div>
    </div>
  )
}
const RandomSplitEditor: EditorFor<'randomsplit'> = ({ config, onChange }) => {
  const total = config.paths.reduce((s, p) => s + p.weight, 0)
  const setPath = (id: string, patch: Partial<ConfigByKind['randomsplit']['paths'][number]>) =>
    onChange({ ...config, paths: config.paths.map(p => (p.id === id ? { ...p, ...patch } : p)) })
  return (
    <div className="editor-form">
      <label className="field-label">Weighted paths {total !== 100 && <span style={{ color: 'var(--amber)' }}>· sums to {total}%</span>}</label>
      {config.paths.map(p => (
        <div className="cond-row" key={p.id}>
          <input className="text-input input-sm" style={{ minWidth: 0, flex: 1 }} value={p.label} onChange={e => setPath(p.id, { label: e.target.value })} />
          <input className="text-input input-sm" type="number" min={0} max={100} style={{ width: 74 }} value={p.weight} onChange={e => setPath(p.id, { weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} />
          <span className="cond-verb">%</span>
          <button className="x" aria-label="Remove path" onClick={() => config.paths.length > 2 && onChange({ ...config, paths: config.paths.filter(x => x.id !== p.id) })}>
            ✕
          </button>
        </div>
      ))}
      <button className="add-link sm" onClick={() => onChange({ ...config, paths: [...config.paths, newSplitPath()] })}>
        ＋ Add path
      </button>
    </div>
  )
}

/* ── delay / data / flow editors ──────────────────────────────── */
const DelayEditor: EditorFor<'delay'> = ({ config, onChange }) => (
  <div className="editor-form">
    <Field label="Wait for">
      <div className="time-group">
        <input className="text-input input-sm" type="number" min={1} style={{ width: 80, minWidth: 0 }} value={config.amount} onChange={e => onChange({ ...config, amount: Math.max(1, Number(e.target.value) || 1) })} />
        <select className="select input-sm" style={{ width: 110, minWidth: 0 }} value={config.unit} onChange={e => onChange({ ...config, unit: e.target.value as ConfigByKind['delay']['unit'] })}>
          <option>Minutes</option>
          <option>Hours</option>
          <option>Days</option>
        </select>
      </div>
    </Field>
    <ToggleField label="Respect DND window" sub="Hold delivery until the user's quiet hours end." checked={config.respectDnd} onChange={respectDnd => onChange({ ...config, respectDnd })} />
  </div>
)
const SetAttrEditor: EditorFor<'setattr'> = ({ config, onChange }) => (
  <div className="editor-form">
    <SelectField label="Attribute" value={config.attribute} options={ATTRS} placeholder="Select an attribute…" onChange={attribute => onChange({ ...config, attribute })} />
    <TextField label="Set to value" value={config.value} placeholder="e.g. true" onChange={value => onChange({ ...config, value })} />
  </div>
)
const SegmentEditor: EditorFor<'segment'> = ({ config, onChange }) => (
  <div className="editor-form">
    <Field label="Action">
      <PillGroup value={config.action} options={[{ value: 'add', label: 'Add to' }, { value: 'remove', label: 'Remove from' }]} onChange={action => onChange({ ...config, action })} />
    </Field>
    <SelectField label="Segment" value={config.segment} options={SEGMENTS} placeholder="Select a segment…" onChange={segment => onChange({ ...config, segment })} />
  </div>
)
const JumpEditor: EditorFor<'jump'> = ({ config, onChange }) => {
  const { nodeOptions } = useEditorEnv()
  return (
    <div className="editor-form">
      <Field label="Jump to node">
        <select className="select input-md" value={config.targetId ?? ''} onChange={e => onChange({ ...config, targetId: e.target.value || null })}>
          <option value="">Select a node…</option>
          {nodeOptions.map(o => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      </Field>
      {nodeOptions.length === 0 && <p className="editor-hint">Add other steps first, then choose where this jump lands.</p>}
      <p className="editor-hint">The user is sent to the target node instead of continuing along the edge — useful for loops and shortcuts.</p>
    </div>
  )
}

/* ── registry — exhaustive: a missing kind is a compile error ──── */
export const NODE_EDITORS: { [K in NodeKind]: EditorFor<K> } = {
  animations: AnimationsEditor,
  bottomsheet: BottomSheetEditor,
  carousel: CarouselEditor,
  spotlight: SpotlightEditor,
  floater: FloaterEditor,
  gamification: GamificationEditor,
  modal: ModalEditor,
  pagepop: PagePopEditor,
  pinnedbanner: PinnedBannerEditor,
  tooltip: TooltipEditor,
  video: VideoEditor,
  widgets: WidgetsEditor,
  push: PushEditor,
  whatsapp: WhatsAppEditor,
  email: EmailEditor,
  sms: SmsEditor,
  cond: CondEditor,
  randomsplit: RandomSplitEditor,
  delay: DelayEditor,
  setattr: SetAttrEditor,
  segment: SegmentEditor,
  jump: JumpEditor,
}
