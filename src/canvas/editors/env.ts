import { createContext, useContext } from 'react'

export interface NodeOption {
  id: string
  title: string
}

/* Options an editor may need beyond its own config — currently the other nodes
   in the graph (for the Jump target picker). Provided by NodeEditorSheet. */
export const EditorEnvContext = createContext<{ nodeOptions: NodeOption[] }>({ nodeOptions: [] })
export const useEditorEnv = () => useContext(EditorEnvContext)
