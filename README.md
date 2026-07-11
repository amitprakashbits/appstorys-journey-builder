# AppStorys — Journey Creation Wizard (Setup + Canvas)

Multi-step journey creation flow for the AppStorys dashboard, built in the
AppStorys design system (Poppins, orange `#FB6514` brand gradient, cream
selected states, light shell with side nav). Modeled on the MoEngage
create-flow reference, adapted to AppStorys naming and conventions.

Built with **React 18 + TypeScript + Vite + Tailwind CSS**.

## Quick start

```bash
npm install
npm run dev        # local dev server (http://localhost:5173)
npm run typecheck  # tsc --noEmit
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # serve the production build
```

Node 18+ recommended.

## Screens & flows

- **Step 1 — Details and goals**: journey name (synced with top bar), removable
  tags with add-on-Enter, conversion goals (name / goal event / attribution
  window, max 3).
- **Step 2 — When will users enter the journey**, three switchable variants:
  - **On event trigger** — "Has executed" event rows with alternate (OR) and
    secondary (AND) triggers, Immediately / With delay, journey schedule
    (ASAP with Ends Never/On, or specific date-time), limit-entry settings,
    exit-based-on-conditions.
  - **At fixed time** — One time (ASAP / specific date & time) and Periodic
    (Daily / Weekly with day chips / Monthly with day-of-month), live preview
    lines, 10Mn-segment warning banner.
  - **On journey exit** — "Has exited [journey] from [exit stage]" rows,
    delay-after-exit with live banner, schedule, settings, exit conditions.
- **Step 3 — Who will enter the journey**: All users / Segments / Custom rules,
  segment chips with counts, AND rule builder, exclusion segments,
  control-group holdout slider, and a live **estimated reach** panel.
- **Canvas** (n8n-like, React Flow): a free-form, infinite pan/zoom editor.
  Nodes are draggable cards placed anywhere; connect by dragging from a node's
  right-edge port to another node's left port (drop on empty canvas to add +
  connect in one go); hover any edge for a midpoint "+" to insert inline; drag
  palette rows onto the canvas or onto an edge. The "Add to journey" palette is
  a searchable, categorized picker of 22 node types across 6 families
  (Campaigns · Messages · Branching · Delay · Data · Flow control), each with a
  bespoke editor. Condition and Random-split nodes fork into branches. Entry trigger shows as a badge on the first node — no
  Start/End nodes. Bottom toolbar (zoom / fit / snap / tidy-up / undo-redo),
  restyled minimap, full keyboard layer (delete, ⌘D duplicate, ⌘Z/⇧⌘Z
  undo-redo, ⌘A select-all, arrow-nudge), and publish validation (≥1 node,
  trigger configured, no orphaned Condition branch). See
  [docs/canvas-engine.md](docs/canvas-engine.md).

"Skip to canvas" in the top bar and "Save & continue to canvas" on step 3 both
land on the canvas; "Back to setup" returns to step 1 with all state intact.

## Project structure

```
index.html                     Vite entry (loads Poppins)
src/
  main.tsx                     React root
  App.tsx                      shell: side nav, top bar, stepper, footer, toast,
                               and all wizard state (single source of truth)
  types.ts                     shared model types
  index.css                    Tailwind directives + the AppStorys design system
                               (ported 1:1 from the approved prototype)
  components/
    ui.tsx                     Radio, Toggle, ToggleRow, AmPm, TimeGroup, Card,
                               TimezoneRow primitives
    Step1Details.tsx           details & goals
    Step2Trigger.tsx           all three entry-trigger variants
    Step3Audience.tsx          audience + estimated reach
    Canvas.tsx                 thin adapter → src/canvas/JourneyCanvas
  canvas/                      n8n-like React Flow editor
    JourneyCanvas.tsx          engine wiring, toolbar, minimap, keyboard, DnD
    useJourneyGraph.ts         graph state + named actions + undo/redo (choke point)
    registry.ts                NodeKind registry (single place to add a kind)
    NodePalette.tsx            searchable, draggable step palette
    layout.ts                  dagre left-to-right "tidy up"
    nodes/JourneyNodeView.tsx  custom node card + handles + NodeToolbar
    edges/JourneyEdgeView.tsx  custom bezier edge + midpoint "+"
prototype/
  journey-setup-prototype-appstorys-ui.html   approved standalone prototype
                                              (AppStorys light design system)
  journey-setup-prototype-dark.html           earlier dark-theme exploration
tailwind.config.js             brand color scale (brand.*) + Poppins font
```

## Styling approach

Tailwind is configured (JIT, `brand` scale, Poppins in `tailwind.config.js`)
and utilities can be used anywhere. The pixel-faithful AppStorys look lives as
component classes in `src/index.css` so the approved prototype design ports
over exactly — the standalone HTML files in `prototype/` are the visual source
of truth.

## Wiring notes for engineering

- All wizard state lives in `App.tsx`; steps are controlled components, so
  swapping mock option lists (events, segments, journeys, properties) for API
  data is localized to the constant arrays at the top of each step file.
- Estimated reach in `Step3Audience.tsx` is a mock formula — replace with the
  segment-count endpoint.
- Publish validation in `Canvas.tsx` currently checks steps > 0 and a selected
  trigger event; extend with server-side validation as needed.
