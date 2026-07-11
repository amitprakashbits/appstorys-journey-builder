import { useMemo, useState } from 'react'
import { NODE_KINDS, summarize } from './registry'
import { NODE_EDITORS } from './editors'
import type { JourneyNode, JourneyNodeConfig, JourneyNodeData } from './types'

type EditorComponent = (props: { config: JourneyNodeConfig; onChange: (c: JourneyNodeConfig) => void }) => JSX.Element

interface NodeEditorSheetProps {
  node: JourneyNode
  onSave: (patch: Partial<JourneyNodeData>) => void
  onClose: () => void
  onSendTest: () => void
}

export function NodeEditorSheet({ node, onSave, onClose, onSendTest }: NodeEditorSheetProps) {
  const def = NODE_KINDS[node.data.kind]
  const [title, setTitle] = useState(node.data.title)
  const [config, setConfig] = useState<JourneyNodeConfig>(node.data.config)
  const [confirming, setConfirming] = useState(false)

  const dirty = useMemo(
    () => title !== node.data.title || JSON.stringify(config) !== JSON.stringify(node.data.config),
    [title, config, node.data],
  )

  const Editor = NODE_EDITORS[config.kind] as EditorComponent

  const requestClose = () => {
    if (dirty) setConfirming(true)
    else onClose()
  }
  const save = () => {
    onSave({ title, config, meta: summarize(config) })
    onClose()
  }

  return (
    <div className="sheet-scrim" onMouseDown={requestClose}>
      <aside className="sheet node-sheet" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label={`Edit ${def.label}`}>
        <header className="sheet-head">
          <span className="sheet-kind-dot" style={{ background: def.color }} />
          <div className="sheet-head-main">
            <input
              className="sheet-title-input"
              value={title}
              aria-label="Node title"
              onChange={e => setTitle(e.target.value)}
            />
            <span className="sheet-kind-label" style={{ color: def.color }}>
              {def.label}
            </span>
          </div>
          <span className="status">DRAFT</span>
          <button className="sheet-x" aria-label="Close" onClick={requestClose}>
            ✕
          </button>
        </header>

        <div className="sheet-actions">
          <button className="btn" onClick={onSendTest}>
            ✈ Send test
          </button>
        </div>

        <div className="sheet-body">
          <Editor config={config} onChange={setConfig} />
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
