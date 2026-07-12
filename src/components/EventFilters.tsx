import { EVENT_CATALOG, attrOperators, newEventFilter } from '../data/events'
import type { EventAttr, EventFilter } from '../data/events'

/* Attribute filters on a selected event — e.g. "where amount > 1000".
   Renders nothing if the event has no attributes. */
export interface EventFiltersProps {
  eventName: string
  filters: EventFilter[]
  onChange: (filters: EventFilter[]) => void
  events?: { name: string; attributes?: EventAttr[] }[]
}

function ValueInput({ attr, value, onChange }: { attr: EventAttr; value: string; onChange: (v: string) => void }) {
  if (attr.type === 'enum')
    return (
      <select className="select input-sm" style={{ minWidth: 0, flex: 1 }} value={value} onChange={e => onChange(e.target.value)}>
        {(attr.values ?? []).map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    )
  if (attr.type === 'bool')
    return (
      <select className="select input-sm" style={{ minWidth: 0, flex: 1 }} value={value} onChange={e => onChange(e.target.value)}>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  return (
    <input
      className="text-input input-sm"
      style={{ minWidth: 0, flex: 1 }}
      type={attr.type === 'number' ? 'number' : 'text'}
      placeholder="Value"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}

export function EventFilters({ eventName, filters, onChange, events = EVENT_CATALOG }: EventFiltersProps) {
  const ev = events.find(e => e.name === eventName)
  const attrs = ev?.attributes ?? []
  if (!ev || attrs.length === 0) return null

  const attrOf = (name: string): EventAttr => attrs.find(a => a.name === name) ?? attrs[0]
  const setRow = (id: string, patch: Partial<EventFilter>) => onChange(filters.map(f => (f.id === id ? { ...f, ...patch } : f)))

  return (
    <div className="event-filters">
      {filters.map(f => {
        const attr = attrOf(f.attribute)
        return (
          <div className="cond-row event-filter-row" key={f.id}>
            <span className="cond-verb">where</span>
            <select
              className="select input-sm"
              style={{ minWidth: 0 }}
              value={f.attribute}
              onChange={e => {
                const next = attrOf(e.target.value)
                setRow(f.id, { attribute: next.name, operator: attrOperators(next.type)[0], value: next.type === 'enum' ? next.values?.[0] ?? '' : next.type === 'bool' ? 'true' : '' })
              }}
            >
              {attrs.map(a => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            <select className="select input-sm" style={{ width: 78, minWidth: 0 }} value={f.operator} onChange={e => setRow(f.id, { operator: e.target.value })}>
              {attrOperators(attr.type).map(o => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ValueInput attr={attr} value={f.value} onChange={value => setRow(f.id, { value })} />
            <button className="x" aria-label="Remove filter" onClick={() => onChange(filters.filter(x => x.id !== f.id))}>
              ✕
            </button>
          </div>
        )
      })}
      <button className="add-link sm" onClick={() => onChange([...filters, newEventFilter(attrs[0])])}>
        ＋ Add attribute filter
      </button>
    </div>
  )
}
