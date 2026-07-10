import React, { useState } from 'react'
import type { AudienceMode, EventCondition, ExitCondition, FlowNode, TriggerType } from '../types'

const STEP_DEFS: Record<FlowNode['kind'], { cls: string; label: string; title: string; meta: string; sw: string }> = {
  story: { cls: 'k-story', label: 'Story', title: 'US Stocks intro story', meta: '4 slides · CTR —', sw: 'var(--purple)' },
  push: { cls: 'k-push', label: 'Push notification', title: 'Complete your RFI', meta: 'High priority · CTR —', sw: 'var(--blue)' },
  cond: { cls: 'k-cond', label: 'Condition', title: 'KYC complete?', meta: 'YES / NO branch', sw: 'var(--amber)' },
  delay: { cls: 'k-delay', label: 'Wait / delay', title: 'Wait 24 hours', meta: 'Respects DND window', sw: 'var(--tx3)' },
}

let nodeSeq = 0

export default function Canvas(props: {
  journeyName: string
  triggerType: TriggerType
  eventConds: EventCondition[]
  exitConds: ExitCondition[]
  exitDelayNum: number
  exitDelayUnit: string
  audMode: AudienceMode
  onBackToSetup: () => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [live, setLive] = useState(false)

  const trigLabels: Record<TriggerType, string> = { event: 'On event', fixed: 'At fixed time', exit: 'On journey exit' }
  let trigTitle = trigLabels[props.triggerType]
  if (props.triggerType === 'event') trigTitle += ' · ' + props.eventConds[0].event
  else if (props.triggerType === 'fixed') trigTitle += ' · 7 Jul 2026, 11:56 pm'
  else trigTitle += ' · ' + props.exitConds[0].journey

  const audTxt = props.audMode === 'all' ? 'all users' : props.audMode === 'seg' ? 'selected segments' : 'custom rules'
  const entryTxt =
    props.triggerType === 'exit' ? `with ${props.exitDelayNum} ${props.exitDelayUnit.toLowerCase()} delay` : 'immediately'

  const addStep = (kind: FlowNode['kind']) => {
    const d = STEP_DEFS[kind]
    setNodes([...nodes, { id: ++nodeSeq, kind, title: d.title, meta: d.meta }])
    setPaletteOpen(false)
    props.toast(`${d.label} step added`)
  }

  const tryPublish = () => {
    if (nodes.length === 0) {
      props.toast('Add at least one action step before publishing', 'err')
      return
    }
    if (props.triggerType === 'event' && props.eventConds[0].event === 'Select an event') {
      props.toast('Entry trigger is missing an event — pick one in step 2', 'err')
      return
    }
    setLive(true)
    props.toast('Journey published — now live for new entries')
  }

  return (
    <div className="screen canvas-screen">
      <div className="canvas-toolbar">
        <button className="btn" onClick={props.onBackToSetup}>
          ← Back to setup
        </button>
        <span className="cname">{props.journeyName}</span>
        <span className={`status ${live ? 'live' : ''}`}>{live ? 'LIVE' : 'DRAFT'}</span>
        <span className="spacer" />
        <button className="btn" onClick={() => props.toast('Draft saved')}>
          Save draft
        </button>
        <button className="btn primary" onClick={tryPublish}>
          Publish journey
        </button>
      </div>
      <div className="canvas-shell">
        <div className="chain">
          <div className="node trigger">
            <div className="node-kind">
              <span className="live-dot" /> Entry trigger
            </div>
            <div className="node-title">{trigTitle}</div>
            <div className="node-meta">
              Enters {entryTxt} · Ends never
              <br />
              Audience: {audTxt}
            </div>
          </div>
          {nodes.map(n => (
            <React.Fragment key={n.id}>
              <div className="connector" />
              <div className="node">
                <div className={`node-kind ${STEP_DEFS[n.kind].cls}`}>{STEP_DEFS[n.kind].label}</div>
                <div className="node-title">{n.title}</div>
                <div className="node-meta">{n.meta}</div>
              </div>
            </React.Fragment>
          ))}
          <div className="connector" />
          <div className="add-node-wrap">
            <button
              className="add-node"
              onClick={e => {
                e.stopPropagation()
                setPaletteOpen(!paletteOpen)
              }}
            >
              <span className="plus">＋</span> Add step
            </button>
            {paletteOpen && (
              <div className="palette" onClick={e => e.stopPropagation()}>
                {(Object.keys(STEP_DEFS) as FlowNode['kind'][]).map(k => (
                  <button key={k} onClick={() => addStep(k)}>
                    <span className="sw" style={{ background: STEP_DEFS[k].sw }} /> {STEP_DEFS[k].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
