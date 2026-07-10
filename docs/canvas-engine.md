# Canvas engine — React Flow vs. in-house

**Decision: adopt [React Flow](https://reactflow.dev) (`reactflow` v11).** No blocker found.
This note is the feasibility check required by P1 before wiring it in.

## Why we needed to choose

The pre-P1 canvas was a static horizontal flex row (`.chain`) of `.node` cards
joined by `.connector` divs, with `overflow-x: auto`. It cannot pan/zoom, has no
edge model, and every node is a plain div with no port/anchor concept. P1
(scrollable n8n-style canvas), P6 (insert-on-edge interactions) and P7 (template
hydration of nodes/edges) all need a real graph engine with pan/zoom, a typed
node/edge model, custom node + edge renderers, and edge-interaction hooks.

## Comparison

| Capability | React Flow v11 | In-house (extend `.chain`) |
|---|---|---|
| Pan / zoom (drag, trackpad, pinch, space+drag) | Built in, battle-tested | Weeks of custom transform/gesture math |
| Fit-view on load | `fitView` prop + `useReactFlow().fitView()` | Hand-rolled bbox + transform |
| Custom node renderer | `nodeTypes` — renders any React component; we wrap our existing `.node` markup 1:1 | We already have the markup, but no positioning/viewport layer |
| Custom edge renderer | `edgeTypes` + `getSmoothStepPath`; trivially themed to `#F0AA7B` | SVG path + arrow marker by hand |
| Edge interaction APIs (needed for P6) | `onEdgeMouseEnter/Leave`, edge label renderer, `onConnect`, drop targets | Would need bespoke hit-testing on SVG paths |
| Controlled, typed state | `Node<TData>[]` / `Edge[]`, `useNodesState`/`useEdgesState`; our data typed as `AppNodeData` | Typed, but we build every helper |
| Undo-friendliness | State is a plain serialisable array we own → snapshot/restore is trivial | Same, but only after building the model |
| Bundle size | ~45 KB gzipped (`reactflow` core) | ~0, but offset by the code we'd write + maintain |

## Bundle-size note

`reactflow` adds ~45 KB gzip. Acceptable: it replaces code we would otherwise
write and maintain, and it is the same engine n8n-style tools use, so P6's
insert-on-edge feel comes largely for free. If size ever matters we can import
from `@reactflow/core` + only the packs we use.

## How we use it (P1 scope)

- **Source of truth:** `Node<AppNodeData>[]` + `Edge[]`, controlled via
  `useNodesState` / `useEdgesState`. `AppNodeData` is fully typed (no `any`).
- **No Start/End nodes.** Entry is implicit: the node with no incoming edge is
  the entry step and renders the wizard's trigger config as a **badge**. A node
  with no outgoing edge is terminal and renders a small dot cap on its source
  port. Both flags are derived from the edge set each render, never stored.
- **Custom node** (`AppFlowNode`) wraps the existing `.node` card markup 1:1 so
  the cards look identical to before; `<Handle>`s are added for wiring.
- **Custom edge** (`AppEdge`) draws a smooth-step path in the connector color
  `#F0AA7B`. P6 extends this same edge with the hover-`+` insert affordance.
- **Bottom toolbar** (custom, not React Flow's default `<Controls>`) holds
  zoom-out / zoom-in / fit-view / add-step. Nothing is docked top-left/right;
  the page toolbar (Back / name / status / Save / Publish) stays above the canvas.

## Risks / follow-ups

- React Flow renders an attribution badge (bottom-right) on the MIT tier; we keep
  it. P7's bottom-right floater must sit clear of it and of the bottom toolbar.
- Node auto-layout is a simple left-to-right append in P1. If journeys grow
  branches (Condition yes/no), a layout pass (e.g. dagre) may be worth adding.
