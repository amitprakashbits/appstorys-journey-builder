import React, { useState } from 'react'
import { Card } from './ui'
import type { Goal } from '../types'

const GOAL_EVENTS = [
  'Select an event',
  'US_Stocks_Account_Opened',
  'First_Investment_Complete',
  'Subscription_Purchased',
  'SIP_Mandate_Created',
]

let goalSeq = 0

export default function Step1Details(props: {
  name: string
  setName: (v: string) => void
  goals: Goal[]
  setGoals: (g: Goal[]) => void
  toast: (msg: string, kind?: 'ok' | 'err') => void
}) {
  const [tags, setTags] = useState<string[]>(['USE'])
  const [tagDraft, setTagDraft] = useState('')

  const addTag = () => {
    const t = tagDraft.trim().toUpperCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagDraft('')
  }

  const addGoal = () => {
    if (props.goals.length >= 3) {
      props.toast('You can track up to 3 goals per journey', 'err')
      return
    }
    props.setGoals([
      ...props.goals,
      { id: ++goalSeq, name: 'Primary conversion', event: 'Select an event', window: '7 days' },
    ])
  }

  const updateGoal = (id: number, patch: Partial<Goal>) =>
    props.setGoals(props.goals.map(g => (g.id === id ? { ...g, ...patch } : g)))

  return (
    <>
      <Card>
        <label className="field-label">
          Journey name <span className="req">*</span>
        </label>
        <input
          className="text-input"
          style={{ width: 380, maxWidth: '100%' }}
          value={props.name}
          onChange={e => props.setName(e.target.value)}
        />
        <div className="spacer-18" />
        <label className="field-label">Journey tags</label>
        <div className="tag-box">
          {tags.map(t => (
            <span className="tag" key={t}>
              {t}
              <button aria-label={`Remove tag ${t}`} onClick={() => setTags(tags.filter(x => x !== t))}>
                ×
              </button>
            </span>
          ))}
          <input
            className="tag-input"
            placeholder="Add tag and press Enter"
            value={tagDraft}
            onChange={e => setTagDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
          />
        </div>
      </Card>

      <Card
        title={
          <>
            Conversion goal{' '}
            <span className="info-i" title="A goal event lets AppStorys attribute conversions to this journey">
              i
            </span>
          </>
        }
        sub="Track what success looks like. Users who perform a goal event within the attribution window are counted as converted."
      >
        {props.goals.map(g => (
          <div className="goal-row" key={g.id}>
            <div>
              <label className="field-label">Goal name</label>
              <input className="text-input" value={g.name} onChange={e => updateGoal(g.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Goal event</label>
              <select className="select" value={g.event} onChange={e => updateGoal(g.id, { event: e.target.value })}>
                {GOAL_EVENTS.map(ev => (
                  <option key={ev}>{ev}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Attribution window</label>
              <select className="select" value={g.window} onChange={e => updateGoal(g.id, { window: e.target.value })}>
                <option>24 hours</option>
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
              </select>
            </div>
            <button
              className="icon-btn"
              aria-label="Remove goal"
              onClick={() => props.setGoals(props.goals.filter(x => x.id !== g.id))}
            >
              🗑
            </button>
          </div>
        ))}
        <button className="add-link" onClick={addGoal}>
          ＋ New goal
        </button>
      </Card>
    </>
  )
}
