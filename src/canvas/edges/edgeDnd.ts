import { createContext, useContext } from 'react'

/* Which edge (if any) a palette item is currently hovering over during a
   drag — only edges consume this, so a drag doesn't re-render the nodes. */
export const EdgeDnDContext = createContext<string | null>(null)
export const useDropEdgeId = () => useContext(EdgeDnDContext)
