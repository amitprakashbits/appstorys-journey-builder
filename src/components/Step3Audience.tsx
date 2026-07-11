import React, { useMemo, useState } from 'react'
import { Card, ToggleRow } from './ui'
import { SegmentSelect } from './SegmentSelect'
import type { AudienceMode, Rule } from '../types'

const PROPERTIES = ['KYC status', 'Platform', 'App version', 'Portfolio value', 'Last active']
const OPERATORS = ['is', 'is not', 'greater than', 'less than']

const BASE = 4.8 // millions
let ruleSeq = 500

export default function Step3Audience(props: {
  audMode: AudienceMode
  setAudMode: (m: AudienceMode) => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  const [selectedSegs, setSelectedSegs] = useState<string[]>(['s-rfi'])
  const [rules, setRules] = useState<Rule[]>([{ id: ++ruleSeq, property: 'KYC status', operator: 'is', value: 'Complete' }])
  const [exclude, setExclude] = useState(false)
  const [excludeSegs, setExcludeSegs] = useState<string[]>([])
  const [control, setControl] = useState(false)
  const [controlPct, setControlPct] = useState(10)

  const reach = useMemo(() => {
    let m = BASE
    if (props.audMode === 'seg') {
      const n = selectedSegs.length
      m = n === 0 ? 0 : Math.min(BASE, n * 0.62 + 0.04)
    } else if (props.audMode === 'rules') {
      m = BASE * Math.pow(0.44, rules.length)
    }
    if (exclude) m *= 0.96
    const pct = Math.round((m / BASE) * 100)
    return { m, pct }
  }, [props.audMode, selectedSegs, rules, exclude])

  const cards: { id: AudienceMode; title: string; sub: string }[] = [
    { id: 'all', title: 'All users', sub: 'Anyone who meets the entry trigger enters the journey.' },
    { id: 'seg', title: 'Segments', sub: 'Only users belonging to one or more saved segments.' },
    { id: 'rules', title: 'Custom rules', sub: 'Filter by user properties and behaviour on the fly.' },
  ]

  return (
    <div className="aud-layout">
      <div>
        <Card title="Who will enter the journey" sub="Narrow the trigger down to the users this journey is meant for.">
          <div className="aud-cards">
            {cards.map(c => (
              <button
                key={c.id}
                className={`aud-card ${props.audMode === c.id ? 'selected' : ''}`}
                onClick={() => props.setAudMode(c.id)}
              >
                <h5>{c.title}</h5>
                <p>{c.sub}</p>
              </button>
            ))}
          </div>

          {props.audMode === 'all' && (
            <div className="aud-panel">
              <div className="banner info">
                <span className="b-ic">ⓘ</span>
                <span>
                  Every user who fires the entry trigger will enter. Add segments or rules if this journey is meant for a narrower
                  group.
                </span>
              </div>
            </div>
          )}

          {props.audMode === 'seg' && (
            <div className="aud-panel">
              <label className="field-label">Include users in any of these cohorts</label>
              <SegmentSelect selectedIds={selectedSegs} onChange={setSelectedSegs} addLabel="Add cohort" />
            </div>
          )}

          {props.audMode === 'rules' && (
            <div className="aud-panel">
              <label className="field-label">Users matching all of these rules</label>
              {rules.map(r => (
                <div className="rule-row" key={r.id}>
                  <select
                    className="select"
                    style={{ width: 180 }}
                    value={r.property}
                    onChange={e => setRules(rules.map(x => (x.id === r.id ? { ...x, property: e.target.value } : x)))}
                  >
                    {PROPERTIES.map(p => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <select
                    className="select"
                    style={{ width: 130 }}
                    value={r.operator}
                    onChange={e => setRules(rules.map(x => (x.id === r.id ? { ...x, operator: e.target.value } : x)))}
                  >
                    {OPERATORS.map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                  <input
                    className="text-input"
                    style={{ width: 160 }}
                    value={r.value}
                    placeholder="Value"
                    onChange={e => setRules(rules.map(x => (x.id === r.id ? { ...x, value: e.target.value } : x)))}
                  />
                  <button
                    className="x"
                    aria-label="Remove rule"
                    onClick={() => {
                      if (rules.length <= 1) {
                        props.toast('At least one rule is required', 'err')
                        return
                      }
                      setRules(rules.filter(x => x.id !== r.id))
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="add-link sm"
                onClick={() => setRules([...rules, { id: ++ruleSeq, property: 'Platform', operator: 'is', value: '' }])}
              >
                ＋ Add rule (AND)
              </button>
            </div>
          )}
        </Card>

        <Card title="Exclusions & experiment">
          <div className="spacer-8" />
          <ToggleRow
            label="Exclude users"
            sub="Users in excluded segments never enter, even if they fire the trigger."
            checked={exclude}
            onChange={setExclude}
            style={{ marginBottom: 18 }}
          >
            <SegmentSelect selectedIds={excludeSegs} onChange={setExcludeSegs} addLabel="Add exclusion cohort" />
          </ToggleRow>
          <ToggleRow
            label="Hold out a control group"
            sub="A random slice of the audience is withheld from the journey so you can measure true lift."
            checked={control}
            onChange={setControl}
          >
            <div className="slider-row">
              <input type="range" min={1} max={20} value={controlPct} onChange={e => setControlPct(Number(e.target.value))} />
              <span className="pct">{controlPct}%</span>
              <span style={{ fontSize: 11.5, color: 'var(--tx3)' }}>of eligible users held out</span>
            </div>
          </ToggleRow>
        </Card>
      </div>

      <aside className="reach">
        <h4>Estimated reach</h4>
        <div className="reach-num">{reach.m >= 1 ? reach.m.toFixed(1) + 'M' : Math.round(reach.m * 1000) + 'K'}</div>
        <div className="reach-sub">of 4.8M reachable users on Tickertape</div>
        <div className="reach-bar">
          <div className="fill" style={{ width: `${Math.max(reach.pct, 2)}%` }} />
        </div>
        <div className="reach-meta">
          <span>{reach.pct}%</span>
          <span>total base</span>
        </div>
        <div className="reach-sync">Synced 2 min ago</div>
      </aside>
    </div>
  )
}
