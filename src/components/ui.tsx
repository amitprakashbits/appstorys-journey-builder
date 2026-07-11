import React, { useState } from 'react'

/* ── Radio ────────────────────────────────────────────────────── */
export function Radio(props: {
  name: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  /* Selected styling derives from the `checked` prop (React state), NOT from
     the native :checked pseudo-class alone — so the visual can never drift
     out of sync with state if two radio groups ever share a DOM name. */
  return (
    <label className={`radio ${props.checked ? 'selected' : ''}`}>
      <input type="radio" name={props.name} checked={props.checked} onChange={props.onChange} />
      <span className="r-dot" />
      <span>{props.label}</span>
    </label>
  )
}

/* ── RadioRail — single-select vertical rail ──────────────────────
   One controlled source of truth (`selectedId`) per rail. The radio group
   `name` is namespaced by a per-instance React id so two rails can never
   collide at the DOM level (the historical multi-select bug). Optional
   `group` on an item renders a section header when the group changes. */
export interface RailItem<Id extends string = string> {
  id: Id
  label: string
  group?: string
}

export function RadioRail<Id extends string>(props: {
  /** Stable rail identifier, used (with a per-instance id) as the radio name. */
  rail: string
  items: RailItem<Id>[]
  selectedId: Id
  onSelect: (id: Id) => void
  className?: string
}) {
  const name = `${props.rail}-${React.useId()}`

  /* Dev invariant: with a single scalar source of truth, at most one item can
     resolve as selected. More than one means duplicate item ids upstream. */
  if (import.meta.env.DEV) {
    const selectedCount = props.items.filter(it => it.id === props.selectedId).length
    if (selectedCount > 1) {
      // eslint-disable-next-line no-console
      console.error(
        `[RadioRail:${props.rail}] ${selectedCount} items resolve as selected for "${props.selectedId}" — rail item ids must be unique.`,
      )
    }
  }

  let lastGroup: string | undefined
  return (
    <div className={props.className}>
      {props.items.map(it => {
        const header = it.group && it.group !== lastGroup ? it.group : null
        lastGroup = it.group
        return (
          <React.Fragment key={it.id}>
            {header && <div className="rail-group">{header}</div>}
            <Radio
              name={name}
              label={it.label}
              checked={it.id === props.selectedId}
              onChange={() => props.onSelect(it.id)}
            />
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── PillGroup — single-select segmented control ──────────────── */
export function PillGroup<T extends string>(props: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <span className="pill-group">
      {props.options.map(o => (
        <button
          type="button"
          key={o.value}
          className={props.value === o.value ? 'on' : ''}
          onClick={() => props.onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </span>
  )
}

/* ── Toggle ───────────────────────────────────────────────────── */
export function Toggle(props: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={props.checked} onChange={e => props.onChange(e.target.checked)} />
      <span className="track" />
      <span className="knob" />
    </label>
  )
}

/* ── Toggle row (label + sub + optional reveal) ───────────────── */
export function ToggleRow(props: {
  label: string
  sub: string
  checked: boolean
  onChange: (v: boolean) => void
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div className="toggle-row" style={props.style}>
      <Toggle checked={props.checked} onChange={props.onChange} />
      <div style={{ flex: 1 }}>
        <div className="t-label">{props.label}</div>
        <div className="t-sub">{props.sub}</div>
        {props.checked && props.children && <div className="reveal">{props.children}</div>}
      </div>
    </div>
  )
}

/* ── AM/PM picker ─────────────────────────────────────────────── */
export function AmPm(props: { value: 'am' | 'pm'; onChange: (v: 'am' | 'pm') => void }) {
  return (
    <span className="ampm">
      <button type="button" className={props.value === 'am' ? 'on' : ''} onClick={() => props.onChange('am')}>
        am
      </button>
      <button type="button" className={props.value === 'pm' ? 'on' : ''} onClick={() => props.onChange('pm')}>
        pm
      </button>
    </span>
  )
}

/* ── hh : mm + am/pm ──────────────────────────────────────────── */
export function TimeGroup(props: { defaultH: string; defaultM: string; defaultAmPm: 'am' | 'pm' }) {
  const [ap, setAp] = useState<'am' | 'pm'>(props.defaultAmPm)
  return (
    <div className="time-group">
      <input className="text-input input-sm" style={{ width: 56 }} defaultValue={props.defaultH} />
      <span style={{ color: 'var(--tx4)' }}>:</span>
      <input className="text-input input-sm" style={{ width: 56 }} defaultValue={props.defaultM} />
      <AmPm value={ap} onChange={setAp} />
    </div>
  )
}

/* ── Card ─────────────────────────────────────────────────────── */
export function Card(props: { title?: React.ReactNode; sub?: string; children: React.ReactNode }) {
  return (
    <div className="card">
      {props.title && <div className="card-title">{props.title}</div>}
      {props.sub && <p className="card-sub">{props.sub}</p>}
      {props.children}
    </div>
  )
}

/* ── Timezone select — single shared source of zones ──────────── */
export const TIMEZONES = ['Asia/Calcutta (UTC+0530)', 'UTC', 'America/New_York (UTC−0400)', 'Europe/London (UTC+0100)']

export function TimezoneSelect() {
  return (
    <div className="tz-row">
      <div className="wrap">
        <label className="field-label">Campaign time zone</label>
        <select className="select input-md" defaultValue={TIMEZONES[0]}>
          {TIMEZONES.map(tz => (
            <option key={tz}>{tz}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

/* ── Tooltip — the one shared hover bubble ────────────────────── */
export function Tooltip(props: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span className="tooltip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {props.children}
      {show && <span className="tooltip-bubble" role="tooltip">{props.label}</span>}
    </span>
  )
}

/* ── RolloutBar — the single percentage bar (interactive or read-only) ──
   Same fill styling + hover readout everywhere a % is shown or set. */
export function RolloutBar(props: {
  value: number
  onChange?: (v: number) => void
  min?: number
  max?: number
  readOnly?: boolean
}) {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const [hover, setHover] = useState(false)
  const pct = Math.round(((props.value - min) / (max - min)) * 100)
  return (
    <div
      className={`rollout-bar ${props.readOnly ? 'read-only' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="rollout-track">
        <div className="rollout-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
        {!props.readOnly && (
          <input
            className="rollout-input"
            type="range"
            min={min}
            max={max}
            value={props.value}
            onChange={e => props.onChange?.(Number(e.target.value))}
            aria-label="Rollout percentage"
          />
        )}
        {(hover || props.readOnly) && (
          <span className="rollout-flag" style={{ left: `${Math.min(Math.max(pct, 6), 94)}%` }}>
            {props.value}%
          </span>
        )}
      </div>
    </div>
  )
}
