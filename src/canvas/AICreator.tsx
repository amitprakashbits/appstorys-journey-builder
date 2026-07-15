import { useEffect, useRef, useState } from 'react'
import { NODE_TYPES } from './registry'
import { NodeGlyph } from './icons'
import { generateCampaign, generateJourney } from './aiGenerate'
import type { FlowSpec, GenNode } from './aiGenerate'

type Mode = 'journey' | 'campaign'
type Result = { mode: 'journey'; spec: FlowSpec } | { mode: 'campaign'; note: string; node: GenNode } | null

const SUGGESTIONS: Record<Mode, string[]> = {
  journey: ['Onboard new US-stocks users', 'Win back dormant SIP investors', 'Nudge users to complete KYC'],
  campaign: ['Push about the new US stocks feature', 'Email for the Diwali gold sale', 'WhatsApp SIP reminder'],
}

interface AICreatorProps {
  onClose: () => void
  onApplyFlow: (spec: FlowSpec) => void
  onApplyCampaign: (node: GenNode) => void
}

function StepRow({ node }: { node: GenNode }) {
  const def = NODE_TYPES[node.kind]
  return (
    <div className="ai-step">
      <span className="ai-step-icon" style={{ color: def.color, background: `${def.color}18` }}>
        <NodeGlyph kind={node.kind} size={15} />
      </span>
      <div className="ai-step-text">
        <span className="ai-step-kind" style={{ color: def.color }}>
          {def.name}
        </span>
        <span className="ai-step-title">{node.title}</span>
      </div>
    </div>
  )
}

export function AICreator({ onClose, onApplyFlow, onApplyCampaign }: AICreatorProps) {
  const [mode, setMode] = useState<Mode>('journey')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    taRef.current?.focus()
  }, [])

  const generate = () => {
    if (!prompt.trim()) return
    setBusy(true)
    setResult(null)
    /* fake think-time so it feels like a real generation */
    window.setTimeout(() => {
      setResult(mode === 'journey' ? { mode, spec: generateJourney(prompt) } : { mode, ...generateCampaign(prompt) })
      setBusy(false)
    }, 650)
  }
  const apply = () => {
    if (!result) return
    if (result.mode === 'journey') onApplyFlow(result.spec)
    else onApplyCampaign(result.node)
    onClose()
  }
  const switchMode = (m: Mode) => {
    setMode(m)
    setResult(null)
  }

  return (
    <div className="palette-scrim" onMouseDown={onClose}>
      <div className="ai-panel" onMouseDown={e => e.stopPropagation()} role="dialog" aria-label="Create with AI">
        <header className="ai-head">
          <div>
            <h2>
              <span className="ai-spark">✦</span> Create with AI
            </h2>
            <p>Describe what you want — AppStorys drafts it for you.</p>
          </div>
          <button className="sheet-x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="ai-tabs">
          <button className={mode === 'journey' ? 'on' : ''} onClick={() => switchMode('journey')}>
            Generate a journey
          </button>
          <button className={mode === 'campaign' ? 'on' : ''} onClick={() => switchMode('campaign')}>
            Draft a campaign
          </button>
        </div>

        <textarea
          ref={taRef}
          className="ai-prompt"
          rows={3}
          placeholder={mode === 'journey' ? 'e.g. Onboard new US-stocks users and nudge them to make a first investment' : 'e.g. A push notification about the new US stocks feature'}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && generate()}
        />

        <div className="ai-chips">
          {SUGGESTIONS[mode].map(s => (
            <button key={s} className="ai-chip" onClick={() => setPrompt(s)}>
              {s}
            </button>
          ))}
        </div>

        {result && (
          <div className="ai-result">
            <div className="ai-note">
              <span className="ai-spark">✦</span> {result.mode === 'journey' ? result.spec.note : result.note}
            </div>
            <div className="ai-steps">
              {result.mode === 'journey' ? result.spec.nodes.map((n, i) => <StepRow key={i} node={n} />) : <StepRow node={result.node} />}
            </div>
          </div>
        )}

        <footer className="ai-foot">
          {result ? (
            <>
              <button className="btn" onClick={generate}>
                Regenerate
              </button>
              <button className="btn primary" onClick={apply}>
                {result.mode === 'journey' ? 'Add journey to canvas' : 'Add campaign to canvas'}
              </button>
            </>
          ) : (
            <button className="btn primary ai-generate" onClick={generate} disabled={!prompt.trim() || busy}>
              {busy ? 'Generating…' : '✦ Generate'}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}
