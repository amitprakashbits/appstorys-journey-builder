import type { ReactNode } from 'react'
import type { NodeKind } from './types'

/* stroke glyphs (24×24, currentColor) — one per node kind */
export const NODE_ICONS: Record<NodeKind, ReactNode> = {
  animations: (
    <>
      <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5 10.1 10.9 5.5 9l4.6-1.4L12 3z" />
      <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </>
  ),
  bottomsheet: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M4 13h16" />
      <path d="M9 16.5h6" />
    </>
  ),
  carousel: (
    <>
      <rect x="7" y="6" width="10" height="12" rx="2" />
      <path d="M4 9v6M20 9v6" />
    </>
  ),
  spotlight: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  floater: (
    <>
      <circle cx="17" cy="17" r="4" />
      <path d="M17 15.3v3.4M15.3 17h3.4" />
      <path d="M4 5h8M4 9h6" />
    </>
  ),
  gamification: (
    <>
      <rect x="3" y="8" width="18" height="9" rx="4" />
      <path d="M8 12.5h3M9.5 11v3M15 12h.01M17 13.5h.01" />
    </>
  ),
  modal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <path d="M9 12h6" />
    </>
  ),
  pagepop: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  pinnedbanner: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <rect x="4" y="4" width="16" height="5" rx="2.5" />
    </>
  ),
  tooltip: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="3" />
      <path d="M9 16l2 3 2-3" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9l5 3-5 3z" />
    </>
  ),
  widgets: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  push: (
    <>
      <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.5-4A7.5 7.5 0 1120 12a7.5 7.5 0 01-11 6.6L4 20z" />
      <path d="M9 10c0 3 2 5 5 5l1.2-1.2-2-1-1 .8c-1-.4-1.9-1.3-2.3-2.3l.8-1-1-2L9 10z" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  sms: (
    <>
      <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </>
  ),
  msg_seen: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M8.5 12s1.3-2.2 3.5-2.2S15.5 12 15.5 12s-1.3 2.2-3.5 2.2S8.5 12 8.5 12z" />
      <circle cx="12" cy="12" r="0.8" />
    </>
  ),
  msg_clicked: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M10 9l5 2.5-2 .8-.8 2z" />
    </>
  ),
  msg_closed: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2.5" />
      <path d="M10 10l4 4M14 10l-4 4" />
    </>
  ),
  path_optimizer: (
    <>
      <path d="M9 18a4 4 0 01-2-7.5A3.5 3.5 0 0110 6a3 3 0 015 1 3.5 3.5 0 011.5 6.5A3.5 3.5 0 0113 18z" />
      <path d="M12 8v8M9.5 11h5" />
    </>
  ),
  check_attr: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.2 2.9-4.6 5.5-4.6 1.1 0 2.1.2 3 .7" />
      <path d="M14.5 17l1.8 1.8 3.2-3.6" />
    </>
  ),
  has_done_event: (
    <>
      <path d="M10 10V6a1.5 1.5 0 013 0v5" />
      <path d="M13 9.5a1.4 1.4 0 012.6 0M15.6 10a1.4 1.4 0 012.4 1v3a5 5 0 01-5 5h-1.6a4 4 0 01-2.9-1.3L7 14.8a1.4 1.4 0 012-2l1 1" />
    </>
  ),
  cond: (
    <>
      <path d="M6 4v6a3 3 0 003 3h6" />
      <path d="M15 10l3 3-3 3" />
      <circle cx="6" cy="4" r="1.6" />
    </>
  ),
  randomsplit: (
    <>
      <path d="M6 5v4a3 3 0 003 3h9M18 12l-3-2M18 12l-3 2" />
      <path d="M9 19a3 3 0 003-3" />
      <circle cx="6" cy="5" r="1.6" />
    </>
  ),
  delay: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  setattr: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  segment: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.2 2.9-4.6 5.5-4.6s4.9 1.4 5.5 4.6M16.5 8.5a3 3 0 010 5" />
    </>
  ),
  jump: (
    <>
      <path d="M4 12h13" />
      <path d="M13 7l5 5-5 5" />
      <path d="M20 5v14" />
    </>
  ),
}

export function NodeGlyph({ kind, size = 20 }: { kind: NodeKind; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} stroke="currentColor">
      {NODE_ICONS[kind]}
    </svg>
  )
}
