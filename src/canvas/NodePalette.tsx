import { useEffect, useMemo, useRef, useState } from 'react'
import { NODE_KINDS, PALETTE_CATEGORIES } from './registry'
import type { NodeKind } from './types'

export const DND_MIME = 'application/journey-node-kind'

interface NodePaletteProps {
  x: number
  y: number
  onPick: (kind: NodeKind) => void
  onClose: () => void
}

/* flat, category-ordered list used for keyboard navigation */
const ALL_ROWS: { kind: NodeKind; category: string }[] = PALETTE_CATEGORIES.flatMap(c =>
  c.kinds.map(kind => ({ kind, category: c.name })),
)

export function NodePalette({ x, y, onPick, onClose }: NodePaletteProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    searchRef.current?.focus()
  }, [])

  /* close on outside click / Esc */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ALL_ROWS
    return ALL_ROWS.filter(r => {
      const def = NODE_KINDS[r.kind]
      return def.label.toLowerCase().includes(q) || def.description.toLowerCase().includes(q)
    })
  }, [query])

  useEffect(() => {
    setActive(0)
  }, [query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const row = filtered[active]
      if (row) onPick(row.kind)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const onRowDragStart = (e: React.DragEvent, kind: NodeKind) => {
    e.dataTransfer.setData(DND_MIME, kind)
    e.dataTransfer.effectAllowed = 'copy'
    /* custom drag preview: a node card at 60% scale */
    const def = NODE_KINDS[kind]
    const ghost = document.createElement('div')
    ghost.className = 'node drag-ghost'
    ghost.innerHTML = `<div class="node-kind ${def.cls}">${def.label}</div><div class="node-title">${def.defaultTitle}</div><div class="node-meta">${def.defaultMeta}</div>`
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 60, 30)
    window.setTimeout(() => document.body.removeChild(ghost), 0)
  }

  /* render rows grouped, but track the flat index for active highlighting */
  let flatIndex = -1
  return (
    <div
      ref={rootRef}
      className="palette node-palette"
      style={{ left: x, top: y }}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-label="Add a step"
    >
      <input
        ref={searchRef}
        className="palette-search"
        placeholder="Search steps…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="palette-list">
        {PALETTE_CATEGORIES.map(cat => {
          const rows = cat.kinds.filter(k => filtered.some(r => r.kind === k))
          if (!rows.length) return null
          return (
            <div key={cat.name} className="palette-group">
              <div className="palette-group-title">{cat.name}</div>
              {rows.map(kind => {
                flatIndex++
                const def = NODE_KINDS[kind]
                const idx = filtered.findIndex(r => r.kind === kind)
                return (
                  <button
                    key={kind}
                    className={`palette-row ${idx === active ? 'active' : ''}`}
                    draggable
                    onDragStart={e => onRowDragStart(e, kind)}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => onPick(kind)}
                  >
                    <span className="sw" style={{ background: def.color }} />
                    <span className="palette-row-text">
                      <span className="palette-row-name">{def.label}</span>
                      <span className="palette-row-desc">{def.description}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          )
        })}
        {filtered.length === 0 && <div className="palette-empty">No steps match “{query}”.</div>}
      </div>
    </div>
  )
}
