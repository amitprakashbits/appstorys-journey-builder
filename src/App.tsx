import React, { useEffect, useRef, useState } from 'react'
import Step1Details from './components/Step1Details'
import Step2Trigger from './components/Step2Trigger'
import Step3Audience from './components/Step3Audience'
import Canvas from './components/Canvas'
import type {
  AudienceMode,
  EventCondition,
  ExitCondition,
  Goal,
  StepId,
  ToastState,
  TriggerType,
} from './types'

/* ── side-nav icons ───────────────────────────────────────────── */
const NAV = [
  { label: 'Dashboard', d: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></> },
  { label: 'Campaigns', d: <path d="M3 11l18-7-7 18-2.5-7.5L3 11z" /> },
  { label: 'Stories', d: <><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></> },
  { label: 'Journeys', d: <><circle cx="5" cy="6" r="2.2" /><circle cx="19" cy="12" r="2.2" /><circle cx="8" cy="19" r="2.2" /><path d="M7 7.5L17 11M17 13.5l-7 4" /></>, active: true },
  { label: 'Analytics', d: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /> },
  { label: 'Segments', d: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c.6-3.4 2.9-5 5.5-5s4.9 1.6 5.5 5M16.5 8.5a3 3 0 010 5" /></> },
  { label: 'Settings', d: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z" /></> },
]

const STEP_HINTS: Record<number, string> = {
  1: 'Step 1 of 3 · Details and goals',
  2: 'Step 2 of 3 · Entry trigger',
  3: 'Step 3 of 3 · Audience',
}

export default function App() {
  /* ── wizard state ───────────────────────────────────────────── */
  const [step, setStep] = useState<StepId>(1)
  const [maxReached, setMaxReached] = useState(1)
  const [journeyName, setJourneyName] = useState('Test USE')
  const [goals, setGoals] = useState<Goal[]>([])
  const [triggerType, setTriggerType] = useState<TriggerType>('event')
  const [eventConds, setEventConds] = useState<EventCondition[]>([{ id: 1, event: 'Select an event' }])
  const [exitConds, setExitConds] = useState<ExitCondition[]>([{ id: 2, journey: 'Select journey', exitStage: 'any exit' }])
  const [exitDelayNum, setExitDelayNum] = useState(3)
  const [exitDelayUnit, setExitDelayUnit] = useState('Days')
  const [audMode, setAudMode] = useState<AudienceMode>('all')

  /* ── toast ──────────────────────────────────────────────────── */
  const [toastState, setToastState] = useState<ToastState | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()
  const toast = (msg: string, kind: 'ok' | 'err' = 'ok') => {
    setToastState({ msg, kind, key: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState(null), 2600)
  }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  /* ── navigation ─────────────────────────────────────────────── */
  const mainRef = useRef<HTMLDivElement>(null)
  const goToStep = (n: StepId) => {
    setStep(n)
    if (typeof n === 'number') setMaxReached(m => Math.max(m, n))
    mainRef.current?.scrollTo({ top: 0 })
  }
  const nextStep = () => (step === 3 ? goToStep('canvas') : typeof step === 'number' && goToStep((step + 1) as StepId))
  const prevStep = () => typeof step === 'number' && step > 1 && goToStep((step - 1) as StepId)

  const isCanvas = step === 'canvas'
  const stepDone = (i: number) => (typeof step === 'number' ? i < step || maxReached > i : true)

  return (
    <>
      {/* ── side nav ── */}
      <nav className="snav">
        <div className="snav-brand">
          <div className="mark">A</div>
          <div className="wm">
            App<b>Storys</b>
          </div>
        </div>
        {NAV.map(n => (
          <button className={`snav-item ${n.active ? 'on' : ''}`} key={n.label}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7}>
              {n.d}
            </svg>
            {n.label}
          </button>
        ))}
        <div className="snav-foot">
          <div className="av">AP</div>
          <div>
            <div className="who">Amit Prakash</div>
            <div className="role">Admin · smallcase</div>
          </div>
        </div>
      </nav>

      {/* ── app column ── */}
      <div className="app">
        <header className="topbar">
          <div className="crumb">
            Engage <span>›</span> Journeys <span>›</span> <b>Create journey</b>
          </div>
          <input
            className="journey-name"
            value={journeyName}
            aria-label="Journey name"
            onChange={e => setJourneyName(e.target.value)}
          />
          <div className="topbar-right">
            <span className="env-pill">Live</span>
            <span className="ws-pill">Tickertape ▾</span>
            <button className="ghost-link" onClick={() => goToStep('canvas')}>
              Skip to canvas →
            </button>
          </div>
        </header>

        {!isCanvas && (
          <div className="stepper-wrap">
            <div className="stepper">
              {[1, 2, 3].map(i => (
                <React.Fragment key={i}>
                  {i > 1 && (
                    <div className={`step-line ${stepDone(i - 1) || maxReached >= i ? 'filled' : ''}`}>
                      <span className="fill" />
                    </div>
                  )}
                  <button
                    className={`step ${step === i ? 'active' : ''} ${stepDone(i) && step !== i ? 'done' : ''}`}
                    onClick={() => goToStep(i as StepId)}
                  >
                    <span className="step-num">{stepDone(i) && step !== i ? '✓' : i}</span>
                    {i === 1 ? 'Details and goals' : i === 2 ? 'When will users enter the journey' : 'Who will enter the journey'}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <main className="main" ref={mainRef}>
          {step === 1 && (
            <div className="screen">
              <Step1Details name={journeyName} setName={setJourneyName} goals={goals} setGoals={setGoals} toast={toast} />
            </div>
          )}
          {step === 2 && (
            <div className="screen">
              <Step2Trigger
                triggerType={triggerType}
                setTriggerType={setTriggerType}
                eventConds={eventConds}
                setEventConds={setEventConds}
                exitConds={exitConds}
                setExitConds={setExitConds}
                exitDelayNum={exitDelayNum}
                setExitDelayNum={setExitDelayNum}
                exitDelayUnit={exitDelayUnit}
                setExitDelayUnit={setExitDelayUnit}
                toast={toast}
              />
            </div>
          )}
          {step === 3 && (
            <div className="screen">
              <Step3Audience audMode={audMode} setAudMode={setAudMode} toast={toast} />
            </div>
          )}
          {isCanvas && (
            <Canvas
              journeyName={journeyName}
              triggerType={triggerType}
              eventConds={eventConds}
              exitConds={exitConds}
              exitDelayNum={exitDelayNum}
              exitDelayUnit={exitDelayUnit}
              audMode={audMode}
              onBackToSetup={() => goToStep(1)}
              toast={toast}
            />
          )}
        </main>

        {!isCanvas && (
          <footer className="footer">
            <div className="footer-inner">
              <span className="footer-hint">{typeof step === 'number' ? STEP_HINTS[step] : ''}</span>
              {typeof step === 'number' && step > 1 && (
                <button className="btn" onClick={prevStep}>
                  Previous
                </button>
              )}
              <button className="btn primary" onClick={nextStep}>
                {step === 3 ? 'Save & continue to canvas' : 'Next'}
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* ── toast ── */}
      {toastState && (
        <div className={`toast show ${toastState.kind}`} key={toastState.key}>
          <span className="t-dot" />
          <span>{toastState.msg}</span>
        </div>
      )}
    </>
  )
}
