# Consistency sweep (P4)

Component-reuse pass across the Journey Builder. Goal: one shared implementation
per pattern, no bespoke re-implementations of things that already exist.

## Swaps made

| Area | Before | After |
|---|---|---|
| **Info "i" buttons** | `.info-i` circle button with a `title` tooltip on "Conversion goal" (Step 1) | **Removed.** The card's descriptive sub-text already explains it. `.info-i` class deleted from `index.css`; zero `.info-i` instances remain. |
| **Timezone selector** | `TimezoneRow` in `ui.tsx`, zone `<option>`s hard-coded inline | **`TimezoneSelect`** — single component backed by one `TIMEZONES` source array. Used in all three scheduling surfaces (event/exit `ScheduleCard` ×2, `FixedPanel`). |
| **Rollout / holdout %** | control-group **`<input type="range">`** slider *and* a separate `.reach-bar` display div — two different percentage visuals | **`RolloutBar`** — one component, `readOnly` prop toggles control vs. meter. Drives both the control-group holdout (interactive) and the estimated-reach meter (read-only). Same brand-gradient fill + hover `%` flag everywhere. |
| **Hover tooltip** | native `title` attributes only (no bespoke hover cards) | Added one shared **`Tooltip`** and applied it to the canvas DRAFT/LIVE status chip. See note below. |
| **Pill groups** (done earlier, P2/P3) | ad-hoc segmented controls | shared **`PillGroup`** (priority, source, size, action, etc.) |
| **Segment chips** (P3) | inline `seg-chip` toggle lists | shared **`SegmentSelect`** droplist (active cohorts only) |
| **Event selects** (P3) | three separate `<select>` lists | shared **`EventPicker`** |

## Intentionally left

- **Native `title` tooltips** on icon-only buttons (canvas toolbar zoom/fit/undo,
  node toolbar Edit/Duplicate/Test/Delete). These are lightweight, accessible,
  and platform-standard; there were **no bespoke hover-card implementations** to
  consolidate. `Tooltip` is available for any spot that needs a richer bubble;
  the icon buttons don't. Swapping all of them to a JS tooltip would add cost
  without changing behavior.
- **Banner info icons** (`ⓘ` in `.banner.info`) are decorative status glyphs,
  not info buttons — left as-is.
- **`Card`, `Radio`, `Toggle`, `ToggleRow`, `TimeGroup`, `RadioRail`** are already
  the single shared primitives and are reused throughout — no change needed.

## Result

`grep` shows a single `TimezoneSelect`, a single `RolloutBar`, and a single
`Tooltip` component in use; zero `.info-i`. Visual output is unchanged except
where the shared component intentionally differs (the holdout is now the
brand-gradient rollout bar with a hover `%` flag instead of a raw range input).
`npm run typecheck && npm run build` pass.
