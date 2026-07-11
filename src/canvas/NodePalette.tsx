import { useEffect, useMemo, useRef, useState } from 'react'
import { FAMILY_LABEL, FAMILY_ORDER, KINDS_BY_FAMILY, NODE_TYPES } from './registry'
import { NodeGlyph } from './icons'
import type { NodeFamily, NodeKind } from './types'

export const DND_MIME = 'application/journey-node-kind'

const ALL_KINDS = FAMILY_ORDER.flatMap(f => KINDS_BY_FAMILY[f])

/* small glyphs for the category rail */
const FAMILY_ICON: Record<NodeFamily, JSX.Element> = {
  campaign: <path d="M4 9v6h3l6 4V5L7 9H4zM17 8a5 5 0 010 8" />,
  message: <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />,
  branching: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M6 8v3a3 3 0 003 3h6a3 3 0 003-3V8M12 14v3" />
    </>
  ),
  delay: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  data: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
    </>
  ),
  flow: <path d="M6 19a3 3 0 003-3V9a3 3 0 013-3h3M15 3l3 3-3 3" />,
}

interface NodePaletteProps {
  onPick: (kind: NodeKind) => void
  onClose: () => void
}

export function NodePalette({ onPick, onClose }: NodePaletteProps) {
  const [family, setFamily] = useState<NodeFamily>('campaign')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  const searching = query.trim().length > 0
  const visible: NodeKind[] = useMemo(() => {
    if (!searching) return KINDS_BY_FAMILY[family]
    const q = query.trim().toLowerCase()
    return ALL_KINDS.filter(k => NODE_TYPES[k].name.toLowerCase().includes(q) || NODE_TYPES[k].description.toLowerCase().includes(q))
  }, [family, query, searching])

  useEffect(() => setActive(0), [family, query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || (e.key === 'ArrowRight' && searching)) {
      e.preventDefault()
      setActive(a => Math.min(a + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp' || (e.key === 'ArrowLeft' && searching)) {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (visible[active]) onPick(visible[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const onCardDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData(DND_MIME, kind)
    e.dataTransfer.effectAllowed = 'copy'
    const def = NODE_TYPES[kind]
    const ghost = document.createElement('div')
    ghost.className = 'node drag-ghost'
    ghost.innerHTML = `<div class="node-kind" style="color:${def.color}">${def.name}</div><div class="node-title">${def.defaultTitle}</div>`
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 60, 24)
    window.setTimeout(() => document.body.removeChild(ghost), 0)
  }

  const headline = searching
    ? `${visible.length} result${visible.length === 1 ? '' : 's'}`
    : `${FAMILY_LABEL[family].toUpperCase()} · ${KINDS_BY_FAMILY[family].length} TYPES${family === 'campaign' || family === 'message' ? ' · PICK ONE TO CREATE OR IMPORT' : ''}`

  return (
    <div className="palette-scrim" onMouseDown={onClose}>
      <div className="add-panel" onMouseDown={e => e.stopPropagation()} onKeyDown={onKeyDown} role="dialog" aria-label="Add to journey">
        <header className="add-panel-head">
          <div>
            <h2>Add to journey</h2>
            <p>Pick a campaign type to create or import — or a logic node</p>
          </div>
          <button className="sheet-x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="add-search">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} width={17} height={17}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input ref={searchRef} placeholder="Search node types — modal, delay, branch…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>

        <div className="add-body">
          <nav className="add-rail">
            {FAMILY_ORDER.map(f => (
              <button key={f} className={`add-rail-item ${!searching && f === family ? 'on' : ''}`} onClick={() => { setFamily(f); setQuery('') }}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  {FAMILY_ICON[f]}
                </svg>
                <span className="add-rail-label">{FAMILY_LABEL[f]}</span>
                <span className="add-rail-count">{KINDS_BY_FAMILY[f].length}</span>
              </button>
            ))}
          </nav>

          <div className="add-grid-wrap">
            <div className="add-grid-head">{headline}</div>
            {visible.length === 0 ? (
              <div className="palette-empty">No node types match “{query}”.</div>
            ) : (
              <div className="add-grid">
                {visible.map((kind, i) => {
                  const def = NODE_TYPES[kind]
                  return (
                    <button
                      key={kind}
                      className={`add-card ${i === active ? 'active' : ''}`}
                      draggable
                      onDragStart={e => onCardDragStart(e, kind)}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => onPick(kind)}
                    >
                      <span className="add-card-icon" style={{ color: def.color, background: `${def.color}16` }}>
                        <NodeGlyph kind={kind} size={19} />
                      </span>
                      <span className="add-card-text">
                        <span className="add-card-name">{def.name}</span>
                        <span className="add-card-desc">{def.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
