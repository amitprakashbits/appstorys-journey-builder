import { PillGroup, Toggle } from '../../components/ui'
import type { CondConfig, DelayConfig, JourneyNodeConfig, NodeKind, PushConfig, StoryConfig } from '../types'

/* config type for a given kind */
type KindConfig<K extends NodeKind> = Extract<JourneyNodeConfig, { kind: K }>
type EditorFor<K extends NodeKind> = (props: { config: KindConfig<K>; onChange: (c: KindConfig<K>) => void }) => JSX.Element

/* ── mock option lists (swap for API data) ────────────────────── */
const CAMPAIGNS = [
  { id: 'c-us-stocks', name: 'US Stocks intro story' },
  { id: 'c-kyc', name: 'KYC nudge story' },
  { id: 'c-sip', name: 'SIP winback story' },
]
const PROPERTIES = ['KYC status', 'Platform', 'App version', 'Portfolio value', 'Last active']
const OPERATORS = ['is', 'is not', 'greater than', 'less than']
let rowSeq = 900

/* ── Story ────────────────────────────────────────────────────── */
const StoryEditor: EditorFor<'story'> = ({ config, onChange }) => (
  <div className="editor-form">
    <div className="field">
      <label className="field-label">Campaign</label>
      <select
        className="select input-md"
        value={config.campaignId ?? ''}
        onChange={e => {
          if (e.target.value === '__new__') {
            onChange({ ...config, campaignId: `c-new-${++rowSeq}`, campaignName: 'New story campaign' })
          } else {
            const c = CAMPAIGNS.find(x => x.id === e.target.value)
            onChange({ ...config, campaignId: c?.id ?? null, campaignName: c?.name ?? '' })
          }
        }}
      >
        <option value="">Select a campaign…</option>
        {CAMPAIGNS.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new__">＋ Create new campaign…</option>
      </select>
    </div>
    {config.campaignId?.startsWith('c-new') && (
      <div className="field">
        <label className="field-label">New campaign name</label>
        <input
          className="text-input input-md"
          value={config.campaignName}
          onChange={e => onChange({ ...config, campaignName: e.target.value })}
        />
      </div>
    )}
    <p className="editor-hint">Story content is edited in the campaign flow — the node stores only which campaign runs here.</p>
  </div>
)

/* ── Push ─────────────────────────────────────────────────────── */
const PushEditor: EditorFor<'push'> = ({ config, onChange }) => (
  <div className="editor-form">
    <div className="field">
      <label className="field-label">Title</label>
      <input className="text-input input-md" value={config.title} onChange={e => onChange({ ...config, title: e.target.value })} />
    </div>
    <div className="field">
      <label className="field-label">Body</label>
      <textarea
        className="text-input input-md editor-textarea"
        rows={3}
        value={config.body}
        onChange={e => onChange({ ...config, body: e.target.value })}
      />
    </div>
    <div className="field">
      <label className="field-label">Priority</label>
      <PillGroup
        value={config.priority}
        options={[
          { value: 'high', label: 'High' },
          { value: 'normal', label: 'Normal' },
        ]}
        onChange={priority => onChange({ ...config, priority })}
      />
    </div>
    <div className="field">
      <label className="field-label">Deep link</label>
      <input
        className="text-input input-md"
        placeholder="appstorys://…"
        value={config.deepLink}
        onChange={e => onChange({ ...config, deepLink: e.target.value })}
      />
    </div>
  </div>
)

/* ── Condition ────────────────────────────────────────────────── */
const CondEditor: EditorFor<'cond'> = ({ config, onChange }) => {
  const setRow = (id: string, patch: Partial<CondConfig['rows'][number]>) =>
    onChange({ ...config, rows: config.rows.map(r => (r.id === id ? { ...r, ...patch } : r)) })
  return (
    <div className="editor-form">
      <label className="field-label">Match all of these</label>
      {config.rows.map(r => (
        <div className="cond-row" key={r.id}>
          <select className="select input-sm" style={{ minWidth: 130 }} value={r.property} onChange={e => setRow(r.id, { property: e.target.value })}>
            {PROPERTIES.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select className="select input-sm" style={{ width: 120, minWidth: 0 }} value={r.operator} onChange={e => setRow(r.id, { operator: e.target.value })}>
            {OPERATORS.map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <input className="text-input input-sm" style={{ minWidth: 0 }} placeholder="Value" value={r.value} onChange={e => setRow(r.id, { value: e.target.value })} />
          <button
            className="x"
            aria-label="Remove rule"
            onClick={() => config.rows.length > 1 && onChange({ ...config, rows: config.rows.filter(x => x.id !== r.id) })}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="add-link sm"
        onClick={() => onChange({ ...config, rows: [...config.rows, { id: `r${++rowSeq}`, property: 'Platform', operator: 'is', value: '' }] })}
      >
        ＋ Add rule (AND)
      </button>
      <div className="inline-fields" style={{ marginTop: 14 }}>
        <div className="field">
          <label className="field-label">YES branch label</label>
          <input className="text-input input-sm" value={config.yesLabel} onChange={e => onChange({ ...config, yesLabel: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">NO branch label</label>
          <input className="text-input input-sm" value={config.noLabel} onChange={e => onChange({ ...config, noLabel: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

/* ── Wait / delay ─────────────────────────────────────────────── */
const DelayEditor: EditorFor<'delay'> = ({ config, onChange }) => (
  <div className="editor-form">
    <div className="field">
      <label className="field-label">Wait for</label>
      <div className="time-group">
        <input
          className="text-input input-sm"
          type="number"
          min={1}
          style={{ width: 80, minWidth: 0 }}
          value={config.amount}
          onChange={e => onChange({ ...config, amount: Math.max(1, Number(e.target.value) || 1) })}
        />
        <select className="select input-sm" style={{ width: 110, minWidth: 0 }} value={config.unit} onChange={e => onChange({ ...config, unit: e.target.value as DelayConfig['unit'] })}>
          <option>Minutes</option>
          <option>Hours</option>
          <option>Days</option>
        </select>
      </div>
    </div>
    <div className="toggle-row" style={{ marginTop: 4 }}>
      <Toggle checked={config.respectDnd} onChange={respectDnd => onChange({ ...config, respectDnd })} />
      <div style={{ flex: 1 }}>
        <div className="t-label">Respect DND window</div>
        <div className="t-sub">Hold delivery until the user's quiet hours end.</div>
      </div>
    </div>
  </div>
)

/* ── registry — exhaustive: a missing kind is a compile error ──── */
export const NODE_EDITORS: { [K in NodeKind]: EditorFor<K> } = {
  story: StoryEditor,
  push: PushEditor,
  cond: CondEditor,
  delay: DelayEditor,
}

export type { StoryConfig, PushConfig, CondConfig, DelayConfig }
