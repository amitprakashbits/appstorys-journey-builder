import { useEffect, useMemo, useRef, useState } from 'react'
import { EVENT_CATALOG, EVENT_CATEGORY_COLOR, EVENT_CATEGORY_ORDER } from '../data/events'
import type { EventDef } from '../data/events'

const NONE = new Set(['', 'Select an event'])

/* Props mirror the (WIP) cohorts filter so the design component can drop in
   with no call-site changes. */
export interface EventPickerProps {
  value: string
  onChange: (eventName: string) => void
  events?: EventDef[]
  placeholder?: string
  size?: 'sm' | 'md'
}

export function EventPicker({ value, onChange, events = EVENT_CATALOG, placeholder = 'Select an event', size = 'md' }: EventPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter(e => !q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
  }, [events, query])

  const selected = NONE.has(value) ? null : events.find(e => e.name === value) ?? { name: value } as EventDef

  const pick = (ev: EventDef) => {
    onChange(ev.name)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="event-picker" ref={rootRef}>
      <button
        type="button"
        className={`select event-trigger input-${size} ${selected ? 'has-value' : 'is-placeholder'}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="event-trigger-text">{selected ? selected.name : placeholder}</span>
        <span className="event-caret">▾</span>
      </button>

      {open && (
        <div className="event-pop" role="listbox" onKeyDown={e => e.key === 'Escape' && setOpen(false)}>
          <input ref={searchRef} className="palette-search" placeholder="Search events…" value={query} onChange={e => setQuery(e.target.value)} />
          <div className="event-list">
            {EVENT_CATEGORY_ORDER.map(cat => {
              const rows = filtered.filter(e => e.category === cat)
              if (!rows.length) return null
              return (
                <div className="event-group" key={cat}>
                  <div className="event-group-title">{cat}</div>
                  {rows.map(ev => (
                    <button key={ev.id} className={`event-row ${selected?.name === ev.name ? 'on' : ''}`} onClick={() => pick(ev)} role="option" aria-selected={selected?.name === ev.name}>
                      <span className="event-dot" style={{ background: EVENT_CATEGORY_COLOR[cat] ?? 'var(--tx4)' }} />
                      <span className="event-row-text">
                        <span className="event-row-name">{ev.name}</span>
                        <span className="event-row-desc">{ev.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )
            })}
            {filtered.length === 0 && <div className="palette-empty">No events match “{query}”.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
