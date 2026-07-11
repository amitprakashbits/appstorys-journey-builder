# Canvas engine — React Flow, n8n-style

**Decision: [React Flow](https://reactflow.dev) (`reactflow` v11).** The Journey
Builder canvas is a free-form, direct-manipulation editor modelled on n8n but
skinned 100% in the AppStorys light/orange/Poppins system.

## Why React Flow (not in-house)

The pre-canvas builder was a static horizontal flex chain — no pan/zoom, no edge
model, no ports. Every interaction below would have been weeks of custom gesture,
hit-testing and transform math. React Flow gives us pan/zoom, a typed
node/edge model, custom node/edge renderers, connection dragging, edge
reconnection, a minimap and viewport helpers out of the box (~45 KB gzip, plus
dagre ~30 KB for auto-layout). No blocker found.

## n8n interactions replicated

| n8n interaction | How |
|---|---|
| Free-form draggable nodes | Default RF node drag; position persisted on `node.position`. No forced lane. |
| Drag palette row → drop on canvas | HTML5 DnD; `screenToFlowPosition` maps the drop point; `addNode` at that point. Ghost = `setDragImage` of a 60%-scale node card. |
| Drag handle → node = connect | RF connection drag; `connectionRadius=24` magnetic snap; handles are 18px hit / 10px visual. |
| Drag handle → empty canvas = connect + add | `onConnectStart` records the source; `onConnectEnd` on the pane opens the palette; pick → `addNodeWithConnection`. |
| Reconnect / detach an edge | `edgesUpdatable` + `onEdgeUpdate` (rewire) / `onEdgeUpdateEnd` (drop on empty → `detachEdge`). |
| Hover edge → midpoint “+” | Custom edge renders an `EdgeLabelRenderer` “+”; click opens the palette; `insertOnEdge` splits the edge and nudges downstream nodes. |
| Drag palette row → drop on edge | `onDragOver` hit-tests `[data-edge-id]`, highlights it; drop → `insertOnEdge`. |
| Marquee select / shift-multiselect | `selectionOnDrag`, `multiSelectionKeyCode="Shift"`. |
| Space/middle drag pan, ⌘-scroll zoom | `panActivationKeyCode="Space"`, `panOnDrag={[1,2]}`, `panOnScroll`. |
| Node hover toolbar | RF `<NodeToolbar>` — Edit / Duplicate / Test / Delete pill. |

Invalid connections (self, into the entry node, duplicates, cycles) are blocked
by `isValidConnection` and explained with an error toast.

## State model

```
App.tsx ──props──▶ Canvas.tsx ──▶ JourneyCanvas (ReactFlowProvider)
                                     │
                                     ▼
                            useJourneyGraph()  ← single mutation choke point
                              { nodes, edges, entryId }        + history stack (≤50)
                              actions: addNode · addNodeWithConnection · insertOnEdge
                                       connect · reconnect · detachEdge · deleteSelection
                                       duplicateSelection · deleteNode · duplicateNode
                                       nudgeSelection · selectAll · setLayout · undo · redo
                                     │
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                       ▼
      JourneyNodeView          JourneyEdgeView           NodePalette
   (.node card + handles     (bezier #F0AA7B +        (search + categories,
    + NodeToolbar)            midpoint “+”)            draggable rows)
```

- **Single choke point:** components never call `setNodes`/`setEdges`; every
  mutation is a named action on `useJourneyGraph`, so undo/redo has one place to
  snapshot. RF change events (`onNodesChange`/`onEdgesChange`) apply transiently;
  drags snapshot once on `onNodeDragStart` (`beginInteraction`).
- **Derived, not stored:** a node is the *entry* if `id === entryId` (first node
  added); it is *terminal* per handle if no edge leaves that handle (read from
  the RF store inside the node). Neither is written into node data.
- **Undo/redo:** bounded (50) past/future stacks of `{nodes, edges, entryId}`
  snapshots. Continuous ops (drag, arrow-nudge) coalesce to one entry.

## Node catalog

28 types across 9 families, all driven off the registry:

- **Campaigns** (in-app messaging, 12): Animations, Bottom Sheet, Carousel,
  Element Spotlight, Floater, Gamification, Modal, Page Pop, Pinned Banner,
  Tooltip, Video, Widgets
- **Messages** (4): Push Notification, WhatsApp, Email, SMS
- **Action conditions** (3, YES/NO): Has seen / clicked / closed mobile in-app message
- **AI tools** (1): Intelligent path optimizer (routes to the best of N arms)
- **User conditions** (2, YES/NO): Check User Attribute, Has done event
- **Split user path** (2): Conditional Split (YES/NO), A/B Split (weighted paths)
- **Delay** (1): Delay · **Data** (2): Update Backend Attribute, Add/update a Live Segment
- **Flow control** (1): Jump / Go to node

Each `kind` belongs to a `family` (drives accent colour + palette grouping) and
carries a per-kind config (`ConfigByKind`). Campaign types are "create or import"
with content edited in the campaign flow (handoff); branching kinds expose output
branches via `branchesFor()`.

## Adding a new node kind (four typed touch-points)

1. **Type** — add the literal to `NodeKind` (`src/canvas/types.ts`) and its config
   shape to `ConfigByKind`.
2. **Registry** — add a `NODE_TYPES[kind]` entry (family, name, description,
   defaultTitle) in `registry.ts`, plus a `case` in `makeDefaultConfig` and in
   `summarize` (the node-card meta line). Both are `never`-guarded → a missing
   case is a compile error. If it forks, extend `branchesFor`.
3. **Icon** — add a glyph to `NODE_ICONS` in `icons.tsx` (typed `Record<NodeKind,…>`).
4. **Editor** — add a bespoke editor to `NODE_EDITORS` in `editors/` (typed
   `{ [K in NodeKind]: EditorFor<K> }`) so there are **no dead nodes**.

The palette (auto-grouped by family with live counts), minimap tint, publish
validation and the editor sheet all pick it up automatically.

## Notes / follow-ups

- React Flow measurement + zoom are `requestAnimationFrame`-gated, so the canvas
  renders blank in a **hidden/background browser tab** (rAF is paused there). It
  renders correctly in a visible tab — verify in a foregrounded window.
- Animated “flow” dash on edges is wired (`.canvas-shell.simulate`) for a future
  simulate mode; static otherwise. All motion respects `prefers-reduced-motion`.
