import { EVENT_CATALOG } from '../data/events'

/* ── model ────────────────────────────────────────────────────── */
export interface CondProperty {
  id: string
  property: string
  operator: string
  value: string
}
export interface Condition {
  id: string
  mode: 'event' | 'attribute'
  /* event mode */
  verb: string
  event: string
  countOp: string
  count: string
  periodValue: string
  periodUnit: string
  properties: CondProperty[]
  /* attribute mode */
  attribute: string
  attrOp: string
  attrValue: string
}

const VERBS = ['has executed', 'has not executed']
const COUNT_OPS = ['Greater than equal to', 'Less than equal to', 'Equal to', 'Greater than', 'Less than']
const PERIOD_UNITS = ['days', 'hours', 'weeks', 'months']
const OPERATORS = ['Equal', 'Not equal', 'Contains', 'Greater than', 'Less than']
const USER_ATTRS = ['risk_profile', 'kyc_status', 'app_theme', 'lifetime_value', 'city', 'plan']

let cseq = 7000
const cid = () => `c${++cseq}`

export const newCondition = (): Condition => ({
  id: cid(),
  mode: 'event',
  verb: 'has executed',
  event: '',
  countOp: 'Greater than equal to',
  count: '',
  periodValue: '',
  periodUnit: 'days',
  properties: [],
  attribute: '',
  attrOp: 'Equal',
  attrValue: '',
})
const newProperty = (): CondProperty => ({ id: cid(), property: '', operator: 'Equal', value: '' })

/* ── small styled controls (reuse .select / .text-input) ──────── */
function Sel(p: { value: string; options: readonly string[]; onChange: (v: string) => void; placeholder?: string; width?: number }) {
  return (
    <select className="select cb-ctl" style={{ width: p.width, minWidth: 0 }} value={p.value} onChange={e => p.onChange(e.target.value)}>
      {p.placeholder && <option value="">{p.placeholder}</option>}
      {p.options.map(o => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

/* ── one condition card ───────────────────────────────────────── */
function ConditionCard({ c, onChange, onRemove }: { c: Condition; onChange: (patch: Partial<Condition>) => void; onRemove: () => void }) {
  const eventDef = EVENT_CATALOG.find(e => e.name === c.event)
  const propOptions = (eventDef?.attributes ?? []).map(a => a.name)
  const setProp = (id: string, patch: Partial<CondProperty>) =>
    onChange({ properties: c.properties.map(p => (p.id === id ? { ...p, ...patch } : p)) })

  return (
    <div className="cb-card">
      <div className="cb-top">
        <div className="cb-tabs">
          <button className={c.mode === 'event' ? 'on' : ''} onClick={() => onChange({ mode: 'event' })}>
            Event
          </button>
          <button className={c.mode === 'attribute' ? 'on' : ''} onClick={() => onChange({ mode: 'attribute' })}>
            Attribute
          </button>
        </div>
        <button className="cb-x" aria-label="Remove condition" onClick={onRemove}>
          ✕
        </button>
      </div>

      {c.mode === 'event' ? (
        <>
          <div className="cb-row">
            <Sel value={c.verb} options={VERBS} onChange={verb => onChange({ verb })} width={150} />
            <Sel value={c.event} options={EVENT_CATALOG.map(e => e.name)} placeholder="Select an event" onChange={event => onChange({ event, properties: [] })} width={190} />
            <Sel value={c.countOp} options={COUNT_OPS} onChange={countOp => onChange({ countOp })} width={190} />
            <input className="text-input cb-ctl" style={{ width: 96, minWidth: 0 }} placeholder="Count" value={c.count} onChange={e => onChange({ count: e.target.value })} />
            <span className="cb-text">times</span>
            <span className="cb-text">in the last</span>
          </div>
          <div className="cb-row">
            <input className="text-input cb-ctl" style={{ width: 96, minWidth: 0 }} placeholder="Period" value={c.periodValue} onChange={e => onChange({ periodValue: e.target.value })} />
            <Sel value={c.periodUnit} options={PERIOD_UNITS} onChange={periodUnit => onChange({ periodUnit })} width={110} />
          </div>

          {c.properties.map(p => (
            <div className="cb-prop" key={p.id}>
              <span className="cb-and">and</span>
              <Sel value={p.property} options={propOptions} placeholder="Select or enter property" onChange={property => setProp(p.id, { property })} width={220} />
              <Sel value={p.operator} options={OPERATORS} onChange={operator => setProp(p.id, { operator })} width={150} />
              <Sel value={p.value} options={[]} placeholder="Select or enter value" onChange={value => setProp(p.id, { value })} width={200} />
              <button className="cb-x sm" aria-label="Remove property" onClick={() => onChange({ properties: c.properties.filter(x => x.id !== p.id) })}>
                ✕
              </button>
            </div>
          ))}
          <div className="cb-prop-actions">
            <button className="add-link sm" onClick={() => onChange({ properties: [...c.properties, newProperty()] })}>
              ＋ Add event property
            </button>
            <button className="cb-and-btn">AND</button>
          </div>
        </>
      ) : (
        <div className="cb-row">
          <Sel value={c.attribute} options={USER_ATTRS} placeholder="Select an attribute" onChange={attribute => onChange({ attribute })} width={220} />
          <Sel value={c.attrOp} options={OPERATORS} onChange={attrOp => onChange({ attrOp })} width={180} />
          <Sel value={c.attrValue} options={[]} placeholder="Select or enter value" onChange={attrValue => onChange({ attrValue })} width={200} />
        </div>
      )}
    </div>
  )
}

/* ── the builder: a list of conditions + add-another ──────────── */
export function ConditionBuilder({ value, onChange }: { value: Condition[]; onChange: (v: Condition[]) => void }) {
  const update = (id: string, patch: Partial<Condition>) => onChange(value.map(c => (c.id === id ? { ...c, ...patch } : c)))
  return (
    <div className="cond-builder">
      {value.map(c => (
        <ConditionCard key={c.id} c={c} onChange={patch => update(c.id, patch)} onRemove={() => onChange(value.filter(x => x.id !== c.id))} />
      ))}
      <button className="cb-add-another" onClick={() => onChange([...value, newCondition()])}>
        ＋ Add Another Filter Condition
      </button>
    </div>
  )
}
