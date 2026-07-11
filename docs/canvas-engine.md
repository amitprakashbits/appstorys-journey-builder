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

## Adding a new node kind (registry steps)

1. Add the literal to `NodeKind` in `src/canvas/types.ts` and a `…Config`
   variant to the `JourneyNodeConfig` union.
2. Add a `NODE_KINDS[kind]` entry in `src/canvas/registry.ts` (label, color,
   category, description, defaults; `branches` if it forks like Condition) and a
   `case` in `makeDefaultConfig` — the `never` guard makes a missing case a
   compile error.
3. Add it to a `PALETTE_CATEGORIES` group, and add a `case` to `summarize()`
   (the node-card meta line) — again `never`-guarded.
4. Add an editor to `NODE_EDITORS` in `src/canvas/editors/` — the registry is
   typed `{ [K in NodeKind]: EditorFor<K> }`, so a missing editor is a **compile
   error** (no dead nodes). Double-clicking a node (or its toolbar Edit button)
   opens the right-side `NodeEditorSheet`, which renders this editor against a
   draft config and writes back via `updateNodeData` on Save.

That is all — the custom node renderer, palette, minimap tint, validation and
editor are all driven off the registries.

## Notes / follow-ups

- React Flow measurement + zoom are `requestAnimationFrame`-gated, so the canvas
  renders blank in a **hidden/background browser tab** (rAF is paused there). It
  renders correctly in a visible tab — verify in a foregrounded window.
- Animated “flow” dash on edges is wired (`.canvas-shell.simulate`) for a future
  simulate mode; static otherwise. All motion respects `prefers-reduced-motion`.
