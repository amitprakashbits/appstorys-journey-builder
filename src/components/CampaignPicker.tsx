import { useMemo, useState } from 'react'
import { CAMPAIGNS } from '../data/campaigns'
import type { CampaignRef } from '../data/campaigns'

export interface CampaignPickerProps {
  typeName: string
  /** currently linked campaign id, if any */
  selectedId: string | null
  onImport: (c: CampaignRef) => void
  onCreate: () => void
}

export function CampaignPicker({ typeName, selectedId, onImport, onCreate }: CampaignPickerProps) {
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState<Set<string>>(new Set(selectedId ? [selectedId] : []))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CAMPAIGNS.filter(c => !q || c.name.toLowerCase().includes(q) || c.status.toLowerCase().includes(q))
  }, [query])

  const allSelected = filtered.length > 0 && filtered.every(c => sel.has(c.id))
  const toggle = (id: string) => {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSel(next)
  }
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(filtered.map(c => c.id)))
  const doImport = () => {
    const first = CAMPAIGNS.find(c => sel.has(c.id))
    if (first) onImport(first)
  }

  return (
    <div className="camp-picker">
      <div className="camp-card">
        <div className="camp-head">
          <div>
            <h4>Import from Existing Campaigns</h4>
            <p>Search and select an existing campaign to use for your new campaign</p>
          </div>
          <button className="camp-selall" onClick={toggleAll}>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="camp-search">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} width={16} height={16}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input placeholder="Search campaigns by name or type…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div className="camp-list">
          {filtered.map(c => {
            const on = sel.has(c.id)
            return (
              <button key={c.id} className={`camp-row ${on ? 'on' : ''}`} onClick={() => toggle(c.id)}>
                <span className="camp-name">{c.name}</span>
                <span className="camp-date">{c.date}</span>
                <span className={`camp-status ${c.status.toLowerCase()}`}>{c.status}</span>
                <span className="camp-check">{on && <span className="camp-check-dot">✓</span>}</span>
              </button>
            )
          })}
          {filtered.length === 0 && <div className="palette-empty">No campaigns match “{query}”.</div>}
        </div>

        <button className="camp-import" disabled={sel.size === 0} onClick={doImport}>
          Import Selected Campaign
        </button>
      </div>

      <div className="camp-or">
        <span>OR CREATE A NEW CAMPAIGN</span>
      </div>

      <div className="camp-create">
        <div className="camp-create-label">
          Create a new {typeName} campaign
          <span className="camp-info" title="Opens the campaign builder to design this content">ⓘ</span>
        </div>
        <button className="camp-create-btn" onClick={onCreate}>
          Create Campaign <span className="plus">＋</span>
        </button>
      </div>
    </div>
  )
}
