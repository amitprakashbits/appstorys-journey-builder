import { useMemo, useState } from 'react'
import { NODE_TYPES, branchesFor, cardRows, summarize, validity } from './registry'
import { NODE_EDITORS } from './editors'
import { EditorEnvContext } from './editors/env'
import type { NodeOption } from './editors/env'
import { NodeGlyph } from './icons'
import type { JourneyNode, JourneyNodeConfig, JourneyNodeData } from './types'

type EditorComponent = (props: { config: JourneyNodeConfig; onChange: (c: JourneyNodeConfig) => void }) => JSX.Element

interface NodeEditorSheetProps {
  node: JourneyNode
  nodeOptions: NodeOption[]
  onSave: (patch: Partial<JourneyNodeData>) => void
  onClose: () => void
  onSendTest: () => void
}

export function NodeEditorSheet({ node, nodeOptions, onSave, onClose, onSendTest }: NodeEditorSheetProps) {
  const def = NODE_TYPES[node.data.kind]
  const [title, setTitle] = useState(node.data.title)
  const [config, setConfig] = useState<JourneyNodeConfig>(node.data.config)
  const [confirming, setConfirming] = useState(false)

  const dirty = useMemo(
    () => title !== node.data.title || JSON.stringify(config) !== JSON.stringify(node.data.config),
    [title, config, node.data],
  )

  const Editor = NODE_EDITORS[node.data.kind] as EditorComponent

  /* live, against the draft — the preview strip + status mirror the future card */
  const rows = cardRows(node.data.kind, config)
  const branches = branchesFor(node.data.kind, config)
  const v = validity(node.data.kind, config)

  const requestClose = () => {
    if (dirty) setConfirming(true)
    else onClose()
  }
  const save = () => {
    onSave({ title, config, meta: summarize(node.data.kind, config) })
    onClose()
  }

  return (
    <div className="sheet-scrim" onMouseDown={requestClose}>
      <aside className="sheet node-sheet" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label={`Edit ${def.name}`}>
        <header className="sheet-head">
          <span className="sheet-kind-icon" style={{ color: def.color, background: `${def.color}18` }}>
            <NodeGlyph kind={node.data.kind} size={18} />
          </span>
          <div className="sheet-head-main">
            <input className="sheet-title-input" value={title} aria-label="Node title" onChange={e => setTitle(e.target.value)} />
            <span className="sheet-kind-label" style={{ color: def.color }}>
              {def.name}
            </span>
          </div>
          <span className={`sheet-status ${v.ok ? 'ready' : 'needs'}`}>{v.ok ? 'READY' : 'NEEDS SETUP'}</span>
          <button className="sheet-x" aria-label="Close" onClick={requestClose}>
            ✕
          </button>
        </header>

        <div className="sheet-preview">
          <div className="sheet-preview-label">On the card</div>
          <div className={`preview-card ${v.ok ? '' : 'needs-setup'}`}>
            <div className="node-kind" style={{ color: def.color }}>
              {def.name}
              {!v.ok && <span className="needs-dot" />}
            </div>
            <div className="node-title">{title || def.name}</div>
            {rows.length > 0 && (
              <div className="node-rows">
                {rows.map((r, i) => (
                  <div className="node-row" key={i}>
                    {r.k && <span className="node-row-k">{r.k}</span>}
                    <span className={`node-row-v tone-${r.tone ?? 'default'} ${r.k ? '' : 'full'}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            )}
            {branches.length > 0 && (
              <div className="node-branches">
                {branches.map(b => (
                  <span className={`branch-chip ${b.tone}`} key={b.id}>
                    {b.label}
                  </span>
                ))}
              </div>
            )}
            {!v.ok && <div className="node-needs">Needs setup — {v.msg}</div>}
          </div>
        </div>

        <div className="sheet-actions">
          <button className="btn" onClick={onSendTest}>
            ✈ Send test
          </button>
        </div>

        <div className="sheet-body">
          <EditorEnvContext.Provider value={{ nodeOptions }}>
            <Editor config={config} onChange={setConfig} />
          </EditorEnvContext.Provider>
        </div>

        {confirming ? (
          <footer className="sheet-foot confirm">
            <span className="confirm-msg">Discard unsaved changes?</span>
            <button className="btn" onClick={() => setConfirming(false)}>
              Keep editing
            </button>
            <button className="btn danger" onClick={onClose}>
              Discard
            </button>
          </footer>
        ) : (
          <footer className="sheet-foot">
            <button className="btn" onClick={requestClose}>
              Cancel
            </button>
            <button className="btn primary" onClick={save} disabled={!dirty}>
              Save changes
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}
