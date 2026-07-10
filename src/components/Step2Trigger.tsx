import React, { useState } from 'react'
import { Card, Radio, RadioRail, TimeGroup, TimezoneRow, ToggleRow } from './ui'
import type { RailItem } from './ui'
import type { EventCondition, ExitCondition, FixedSchedule, TriggerType } from '../types'

/* ── option lists ─────────────────────────────────────────────── */
const APP_EVENTS = [
  'Select an event',
  'US_Stocks_RFI_Submitted',
  'SIP_Mandate_Created',
  'First_Investment_Complete',
  'KYC_Completed',
  'App_Opened',
  'Watchlist_Stock_Added',
]
const EXIT_EVENTS = ['Select an event', 'Subscription_Purchased', 'Account_Deleted', 'Uninstall']
const JOURNEYS = ['Select journey', 'US Stocks RFI Reminder', 'KYC Onboarding v2', 'SIP Winback — Q2', 'Digital Gold Launch']
const EXIT_STAGES = ['any exit', 'Goal met', 'Exit: no-CTA', 'Expired']

/* ── selection rails (single source of truth, stable ids) ─────── */
const START_RAIL: RailItem<'asap' | 'date'>[] = [
  { id: 'asap', label: 'As soon as possible', group: 'Start' },
  { id: 'date', label: 'At specific date and time', group: 'Start' },
]
const FIXED_RAIL: RailItem<FixedSchedule>[] = [
  { id: 'asap', label: 'As soon as possible', group: 'One time' },
  { id: 'date', label: 'At specific date and time', group: 'One time' },
  { id: 'daily', label: 'Daily', group: 'Periodic' },
  { id: 'weekly', label: 'Weekly', group: 'Periodic' },
  { id: 'monthly', label: 'Monthly', group: 'Periodic' },
]
const WEEK_DAYS = [
  { id: 'sun', label: 'S' },
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
]

let condSeq = 100

/* ── trigger type card icons ──────────────────────────────────── */
function TriggerIcon({ type }: { type: TriggerType }) {
  if (type === 'event')
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    )
  if (type === 'fixed')
    return (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M15.5 15.5L14 17l2 2 3-3.5" />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6}>
      <path d="M5 21V4a1 1 0 011-1h11l-2 4 2 4H6" />
    </svg>
  )
}

/* ── shared: settings card (limit entry) ──────────────────────── */
function SettingsCard() {
  const [limit, setLimit] = useState(false)
  return (
    <Card title="Settings">
      <div className="spacer-8" />
      <ToggleRow
        label="Limit user entry into this journey"
        sub="Cap how many times a single user can enter, and how soon they can re-enter."
        checked={limit}
        onChange={setLimit}
      >
        <div className="inline-fields">
          <div>
            <label className="field-label">Max entries per user</label>
            <input className="text-input input-sm" type="number" defaultValue={1} min={1} />
          </div>
          <div>
            <label className="field-label">Re-entry cooldown</label>
            <div className="time-group">
              <input className="text-input input-sm" type="number" defaultValue={7} min={0} />
              <select className="select input-sm" style={{ width: 100 }} defaultValue="Days">
                <option>Days</option>
                <option>Hours</option>
              </select>
            </div>
          </div>
        </div>
      </ToggleRow>
    </Card>
  )
}

/* ── shared: journey-exit-conditions card ─────────────────────── */
function ExitConditionsCard() {
  const [on, setOn] = useState(false)
  return (
    <Card title="Journey exit">
      <div className="spacer-8" />
      <ToggleRow
        label="Exit based on conditions"
        sub="Force-remove users as soon as they fulfil any of the conditions defined below."
        checked={on}
        onChange={setOn}
      >
        <div className="cond-row">
          <span className="cond-verb">Has executed</span>
          <select className="select input-md" defaultValue="Select an event">
            {EXIT_EVENTS.map(e => (
              <option key={e}>{e}</option>
            ))}
          </select>
          <button className="x" aria-label="Remove condition">
            ✕
          </button>
        </div>
        <button className="add-link sm">＋ Add exit condition (OR)</button>
      </ToggleRow>
    </Card>
  )
}

/* ── shared: journey schedule (ASAP / date) ───────────────────── */
function ScheduleCard(props: { scope: string; toast: (m: string, k?: 'ok' | 'err') => void }) {
  const [pane, setPane] = useState<'asap' | 'date'>('asap')
  const [ends, setEnds] = useState<'never' | 'on'>('never')
  const endsName = `ends-${React.useId()}`
  return (
    <Card title="Journey schedule">
      <div className="spacer-10" />
      <div className="sched">
        <RadioRail
          className="sched-rail"
          rail={`sched-${props.scope}`}
          items={START_RAIL}
          selectedId={pane}
          onSelect={setPane}
        />
        <div className="sched-body">
          <button className="ghost-link sched-reset" onClick={() => props.toast('Schedule reset to defaults')}>
            Reset to defaults
          </button>
          {pane === 'asap' && (
            <div className="sched-pane">
              <h4>As soon as possible</h4>
              <TimezoneRow />
              <div className="ends-row">
                <span className="ends-label">Ends</span>
                <Radio name={endsName} label="Never" checked={ends === 'never'} onChange={() => setEnds('never')} />
                <Radio name={endsName} label="On" checked={ends === 'on'} onChange={() => setEnds('on')} />
                {ends === 'on' && <input className="text-input input-md" defaultValue="31 Dec 2026, 11:59 pm" />}
              </div>
            </div>
          )}
          {pane === 'date' && (
            <div className="sched-pane">
              <h4>At specific date and time</h4>
              <TimezoneRow />
              <div className="inline-fields">
                <div>
                  <label className="field-label">Start date</label>
                  <input className="text-input input-md" defaultValue="07 Jul 2026" />
                </div>
                <div>
                  <label className="field-label">Start time</label>
                  <TimeGroup defaultH="11" defaultM="56" defaultAmPm="pm" />
                </div>
              </div>
              <div className="preview-line">
                Journey goes live on <b>7 Jul 2026 at 11:56 pm</b> in <b>Asia/Calcutta +0530</b> time zone.
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ── variant A: event trigger ─────────────────────────────────── */
function EventPanel(props: {
  conds: EventCondition[]
  setConds: (c: EventCondition[]) => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  const [delayed, setDelayed] = useState(false)
  const delayName = `delay-event-${React.useId()}`
  const remove = (id: number) => {
    if (props.conds.length <= 1) {
      props.toast('At least one condition is required', 'err')
      return
    }
    props.setConds(props.conds.filter(c => c.id !== id))
  }
  return (
    <>
      <Card title="If user performs">
        <div className="spacer-8" />
        <div className="cond-block">
          <div className="cond-block-title">Primary trigger event(s)</div>
          <p className="cond-block-sub">
            User actions that allow them to enter. Completing at least one is compulsory if there are several listed.
          </p>
          {props.conds.map((c, i) => (
            <React.Fragment key={c.id}>
              {i > 0 && <span className="or-chip">OR</span>}
              <div className="cond-row">
                <span className="cond-verb">Has executed</span>
                <select
                  className="select input-md"
                  value={c.event}
                  onChange={e => props.setConds(props.conds.map(x => (x.id === c.id ? { ...x, event: e.target.value } : x)))}
                >
                  {APP_EVENTS.map(ev => (
                    <option key={ev}>{ev}</option>
                  ))}
                </select>
                <button className="x" aria-label="Remove condition" onClick={() => remove(c.id)}>
                  ✕
                </button>
              </div>
            </React.Fragment>
          ))}
          <button
            className="add-link sm"
            onClick={() => props.setConds([...props.conds, { id: ++condSeq, event: 'Select an event' }])}
          >
            ＋ Add alternate trigger event <span className="aux">(OR)</span>
          </button>
        </div>
        <button className="add-link" onClick={() => props.toast('Secondary trigger added — users must also match this event')}>
          ＋ Add secondary trigger event <span className="aux" style={{ fontSize: 12 }}>(AND)</span>
        </button>
      </Card>

      <Card title="Then enter the user">
        <div className="radio-row" style={{ marginTop: 10 }}>
          <Radio name={delayName} label="Immediately" checked={!delayed} onChange={() => setDelayed(false)} />
          <Radio name={delayName} label="With delay" checked={delayed} onChange={() => setDelayed(true)} />
          {delayed && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input className="text-input input-sm" type="number" defaultValue={30} min={1} />
              <select className="select input-sm" style={{ width: 110 }} defaultValue="Days">
                <option>Minutes</option>
                <option>Hours</option>
                <option>Days</option>
              </select>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>after the IF action</span>
            </span>
          )}
        </div>
        <div className="banner info">
          <span className="b-ic">ⓘ</span>
          <span>
            {delayed
              ? 'The user will enter the journey after the configured delay following the IF action.'
              : 'The user will enter the journey within a few minutes of performing the IF action.'}
          </span>
        </div>
      </Card>

      <ScheduleCard scope="event" toast={props.toast} />
      <SettingsCard />
      <ExitConditionsCard />
    </>
  )
}

/* ── variant B: fixed time ────────────────────────────────────── */
function FixedPanel(props: { toast: (m: string, k?: 'ok' | 'err') => void }) {
  const [pane, setPane] = useState<FixedSchedule>('date')
  const [days, setDays] = useState<boolean[]>([false, true, false, true, false, true, false])
  const labels: Record<FixedSchedule, string> = {
    asap: 'As soon as possible',
    date: 'At specific date and time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  }
  return (
    <>
      <Card title="User entry">
        <div className="spacer-10" />
        <div className="sched">
          <RadioRail
            className="sched-rail"
            rail="sched-fixed"
            items={FIXED_RAIL}
            selectedId={pane}
            onSelect={setPane}
          />
          <div className="sched-body">
            <button className="ghost-link sched-reset" onClick={() => props.toast('Schedule reset to defaults')}>
              Reset to defaults
            </button>
            <div className="sched-pane">
              <h4>{labels[pane]}</h4>
              <TimezoneRow />

              {pane === 'asap' && (
                <div className="preview-line">
                  All matching users enter the journey <b>as soon as it is published</b>.
                </div>
              )}

              {pane === 'date' && (
                <>
                  <div className="inline-fields">
                    <div>
                      <label className="field-label">Start date</label>
                      <input className="text-input input-md" defaultValue="07 Jul 2026" />
                    </div>
                    <div>
                      <label className="field-label">Send time</label>
                      <TimeGroup defaultH="11" defaultM="56" defaultAmPm="pm" />
                    </div>
                  </div>
                  <div className="preview-line">
                    User entry will start on <b>7th Jul 2026</b> at <b>11:56 pm</b> in <b>Asia/Calcutta +0530</b> time zone.
                  </div>
                </>
              )}

              {pane === 'daily' && (
                <>
                  <div className="inline-fields">
                    <div>
                      <label className="field-label">Entry time</label>
                      <TimeGroup defaultH="9" defaultM="00" defaultAmPm="am" />
                    </div>
                    <div>
                      <label className="field-label">Starts</label>
                      <input className="text-input input-md" defaultValue="08 Jul 2026" />
                    </div>
                  </div>
                  <div className="preview-line">
                    Matching users enter <b>every day at 9:00 am</b>, starting <b>8 Jul 2026</b>.
                  </div>
                </>
              )}

              {pane === 'weekly' && (
                <>
                  <label className="field-label">Repeat on</label>
                  <div className="day-chips">
                    {WEEK_DAYS.map((d, i) => (
                      <button
                        key={d.id}
                        className={`day-chip ${days[i] ? 'on' : ''}`}
                        onClick={() => setDays(days.map((v, j) => (j === i ? !v : v)))}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <div className="spacer-14" />
                  <div className="inline-fields">
                    <div>
                      <label className="field-label">Entry time</label>
                      <TimeGroup defaultH="8" defaultM="30" defaultAmPm="am" />
                    </div>
                  </div>
                  <div className="preview-line">
                    Users enter <b>every Mon, Wed and Fri at 8:30 am</b>.
                  </div>
                </>
              )}

              {pane === 'monthly' && (
                <>
                  <div className="inline-fields">
                    <div>
                      <label className="field-label">Day of month</label>
                      <select className="select input-sm" style={{ width: 110 }} defaultValue="5th">
                        <option>1st</option>
                        <option>5th</option>
                        <option>15th</option>
                        <option>Last day</option>
                      </select>
                    </div>
                    <div>
                      <label className="field-label">Entry time</label>
                      <TimeGroup defaultH="10" defaultM="00" defaultAmPm="am" />
                    </div>
                  </div>
                  <div className="preview-line">
                    Users enter on the <b>5th of every month at 10:00 am</b> — useful for SIP-date nudges.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="banner warn">
          <span className="b-ic">⚠</span>
          <span>
            Fixed-time entry is not supported for segments exceeding 10Mn users. Journeys with a target audience of more than 10
            million users will fail during run-time.
          </span>
        </div>
      </Card>
      <ExitConditionsCard />
    </>
  )
}

/* ── variant C: journey exit ──────────────────────────────────── */
function ExitPanel(props: {
  conds: ExitCondition[]
  setConds: (c: ExitCondition[]) => void
  delayNum: number
  setDelayNum: (n: number) => void
  delayUnit: string
  setDelayUnit: (u: string) => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  const [delayed, setDelayed] = useState(true)
  const delayName = `delay-exit-${React.useId()}`
  const remove = (id: number) => {
    if (props.conds.length <= 1) {
      props.toast('At least one condition is required', 'err')
      return
    }
    props.setConds(props.conds.filter(c => c.id !== id))
  }
  return (
    <>
      <Card title="If user performs">
        <div className="spacer-8" />
        <div className="cond-block">
          <div className="cond-block-title">Primary trigger(s)</div>
          <p className="cond-block-sub">
            User exit from specified journey &amp; exit-stage combinations allows them to enter this journey. Meeting at least one
            condition is mandatory if multiple options are provided.
          </p>
          {props.conds.map((c, i) => (
            <React.Fragment key={c.id}>
              {i > 0 && <span className="or-chip">OR</span>}
              <div className="cond-row">
                <span className="cond-verb">Has exited</span>
                <select
                  className="select input-md"
                  value={c.journey}
                  onChange={e => props.setConds(props.conds.map(x => (x.id === c.id ? { ...x, journey: e.target.value } : x)))}
                >
                  {JOURNEYS.map(j => (
                    <option key={j}>{j}</option>
                  ))}
                </select>
                <span className="cond-verb">from</span>
                <select
                  className="select input-sm"
                  style={{ width: 130 }}
                  value={c.exitStage}
                  onChange={e => props.setConds(props.conds.map(x => (x.id === c.id ? { ...x, exitStage: e.target.value } : x)))}
                >
                  {EXIT_STAGES.map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button className="x" aria-label="Remove condition" onClick={() => remove(c.id)}>
                  ✕
                </button>
              </div>
            </React.Fragment>
          ))}
          <button
            className="add-link sm"
            onClick={() => props.setConds([...props.conds, { id: ++condSeq, journey: 'Select journey', exitStage: 'any exit' }])}
          >
            ＋ Add alternate journey exit <span className="aux">(OR)</span>
          </button>
        </div>
        <button className="add-link" onClick={() => props.toast('Secondary trigger added')}>
          ＋ Add secondary trigger
        </button>
      </Card>

      <Card title="Then user enters the journey">
        <div className="radio-row" style={{ marginTop: 10 }}>
          <Radio name={delayName} label="Immediately" checked={!delayed} onChange={() => setDelayed(false)} />
          <Radio name={delayName} label="With delay" checked={delayed} onChange={() => setDelayed(true)} />
          {delayed && (
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <input
                className="text-input input-sm"
                type="number"
                min={1}
                value={props.delayNum}
                onChange={e => props.setDelayNum(Number(e.target.value) || 1)}
              />
              <select
                className="select input-sm"
                style={{ width: 110 }}
                value={props.delayUnit}
                onChange={e => props.setDelayUnit(e.target.value)}
              >
                <option>Minutes</option>
                <option>Hours</option>
                <option>Days</option>
              </select>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>after journey exit</span>
            </span>
          )}
        </div>
        <div className="banner info">
          <span className="b-ic">ⓘ</span>
          <span>
            The user will enter the journey{' '}
            <b>{delayed ? `${props.delayNum} ${props.delayUnit.toLowerCase()}` : 'immediately'}</b> after exiting the previous
            journey.
          </span>
        </div>
      </Card>

      <ScheduleCard scope="exit" toast={props.toast} />
      <SettingsCard />
      <ExitConditionsCard />
    </>
  )
}

/* ── the step ─────────────────────────────────────────────────── */
export default function Step2Trigger(props: {
  triggerType: TriggerType
  setTriggerType: (t: TriggerType) => void
  eventConds: EventCondition[]
  setEventConds: (c: EventCondition[]) => void
  exitConds: ExitCondition[]
  setExitConds: (c: ExitCondition[]) => void
  exitDelayNum: number
  setExitDelayNum: (n: number) => void
  exitDelayUnit: string
  setExitDelayUnit: (u: string) => void
  toast: (m: string, k?: 'ok' | 'err') => void
}) {
  const cards: { id: TriggerType; label: string }[] = [
    { id: 'event', label: 'On event trigger' },
    { id: 'fixed', label: 'At fixed time' },
    { id: 'exit', label: 'On journey exit' },
  ]
  return (
    <>
      <Card title="Users enter the journey" sub="Choose what brings a user into this journey.">
        <div className="trigger-cards">
          {cards.map(c => (
            <button
              key={c.id}
              className={`trigger-card ${props.triggerType === c.id ? 'selected' : ''}`}
              onClick={() => props.setTriggerType(c.id)}
            >
              <TriggerIcon type={c.id} />
              {c.label}
            </button>
          ))}
        </div>
      </Card>

      {props.triggerType === 'event' && (
        <EventPanel conds={props.eventConds} setConds={props.setEventConds} toast={props.toast} />
      )}
      {props.triggerType === 'fixed' && <FixedPanel toast={props.toast} />}
      {props.triggerType === 'exit' && (
        <ExitPanel
          conds={props.exitConds}
          setConds={props.setExitConds}
          delayNum={props.exitDelayNum}
          setDelayNum={props.setExitDelayNum}
          delayUnit={props.exitDelayUnit}
          setDelayUnit={props.setExitDelayUnit}
          toast={props.toast}
        />
      )}
    </>
  )
}
