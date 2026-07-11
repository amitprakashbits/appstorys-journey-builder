import { useEffect, useMemo, useRef, useState } from 'react'
import { useSegments } from '../hooks/useSegments'

/* Segments are read-only here — sourced from the Cohorts flow, never created in
   the Journey Builder. Droplist = active cohorts; chips = what's selected. */
export interface SegmentSelectProps {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  addLabel?: string
}

export function SegmentSelect({ selectedIds, onChange, addLabel = 'Add cohort' }: SegmentSelectProps) {
  const { segments } = useSegments()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  const byId = useMemo(() => Object.fromEntries(segments.map(s => [s.id, s])), [segments])
  const selected = selectedIds.map(id => byId[id]).filter(Boolean)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return segments.filter(s => !q || s.name.toLowerCase().includes(q))
  }, [segments, query])

  const toggle = (id: string) =>
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])

  const noActive = segments.length === 0
  const createCohort = () => window.open('/cohorts/new?returnTo=journey-builder', '_blank', 'noopener')

  if (noActive) {
    return (
      <div className="seg-empty">
        <span>No active cohorts yet</span>
        <button className="add-link sm" onClick={createCohort}>
          Create a cohort →
        </button>
      </div>
    )
  }

  return (
    <div className="segment-select" ref={rootRef}>
      <div className="seg-chips">
        {selected.map(s => (
          <button key={s.id} className="seg-chip on" onClick={() => toggle(s.id)} aria-label={`Remove ${s.name}`}>
            {s.name} <span className="cnt">{s.count}</span>
            <span className="seg-chip-x">✕</span>
          </button>
        ))}
        <button className="seg-add" onClick={() => setOpen(o => !o)} aria-haspopup="listbox" aria-expanded={open}>
          ＋ {addLabel}
        </button>
      </div>

      {open && (
        <div className="seg-pop" role="listbox">
          <input className="palette-search" placeholder="Search active cohorts…" autoFocus value={query} onChange={e => setQuery(e.target.value)} />
          <div className="seg-list">
            {filtered.map(s => {
              const on = selectedIds.includes(s.id)
              return (
                <button key={s.id} className={`seg-row ${on ? 'on' : ''}`} onClick={() => toggle(s.id)} role="option" aria-selected={on}>
                  <span className={`seg-check ${on ? 'on' : ''}`}>{on ? '✓' : ''}</span>
                  <span className="seg-row-name">{s.name}</span>
                  <span className="seg-row-count">{s.count}</span>
                </button>
              )
            })}
            {filtered.length === 0 && <div className="palette-empty">No cohorts match “{query}”.</div>}
          </div>
          <div className="seg-pop-foot">
            <button className="add-link sm" onClick={createCohort}>
              Create a cohort →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
