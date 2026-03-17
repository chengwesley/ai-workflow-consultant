import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'

const STORAGE_KEY = 'ai-flow-consultant-data'

const defaultNodes = [
  {
    id: 'start-1',
    type: 'startEnd',
    position: { x: 50, y: 350 },
    data: {
      label: '開始',
      nodeType: 'start',
      responsible: 'human',
      description: '',
      aiTech: [],
      difficulty: 'easy',
      priority: 'medium',
      notes: '',
      department: '',
      system: '',
      inputData: '',
      outputData: '',
      monthlyVolume: 0,
      manualTime: 0,
      autoTime: 0,
      mermaidCode: '',
    },
  },
]

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Failed to load from storage', e)
  }
  return null
}

const saved = loadFromStorage()

const useFlowStore = create((set, get) => ({
  nodes: saved?.nodes || defaultNodes,
  edges: saved?.edges || [],
  selectedNodeId: null,
  selectedEdgeId: null,
  projectName: saved?.projectName || '未命名專案',

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }))
    get()._save()
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }))
    get()._save()
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge({ ...connection, animated: false, style: { stroke: '#64748b', strokeWidth: 2 } }, state.edges),
    }))
    get()._save()
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id }),

  addNode: (type) => {
    const id = `${type}-${Date.now()}`
    const labels = { process: '新流程步驟', decision: '判斷條件', startEnd: '結束' }
    const { nodes } = get()
    const maxX = nodes.reduce((m, n) => Math.max(m, n.position.x), 0)
    const newNode = {
      id,
      type,
      position: { x: maxX + 260, y: 350 + Math.round((Math.random() - 0.5) * 60) },
      data: {
        label: labels[type] || '新步驟',
        nodeType: type === 'startEnd' ? 'end' : type,
        responsible: 'human',
        description: '',
        aiTech: [],
        difficulty: 'medium',
        priority: 'medium',
        notes: '',
        department: '',
        system: '',
        inputData: '',
        outputData: '',
        monthlyVolume: 0,
        manualTime: 0,
        autoTime: 0,
        mermaidCode: '',
      },
    }
    set((state) => ({ nodes: [...state.nodes, newNode], selectedNodeId: id, selectedEdgeId: null }))
    get()._save()
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    }))
    get()._save()
  },

  changeNodeType: (id, newType) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, type: newType } : n)),
    }))
    get()._save()
  },

  updateEdge: (id, props) => {
    set((state) => ({
      edges: state.edges.map((e) => e.id === id ? { ...e, ...props } : e),
    }))
    get()._save()
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }))
    get()._save()
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }))
    get()._save()
  },

  setProjectName: (name) => {
    set({ projectName: name })
    get()._save()
  },

  clearCanvas: () => {
    set({ nodes: defaultNodes, edges: [], selectedNodeId: null })
    get()._save()
  },

  loadFromJSON: (json) => {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json
      set({ nodes: data.nodes || [], edges: data.edges || [], projectName: data.projectName || '匯入專案', selectedNodeId: null })
      get()._save()
    } catch (e) {
      console.error('Failed to load JSON', e)
    }
  },

  importMermaidData: ({ nodes, edges }) => {
    set({ nodes, edges, selectedNodeId: null, selectedEdgeId: null })
    get().autoLayout() // Automatically arrange the imported nodes
    get()._save()
  },

  _save: () => {
    const { nodes, edges, projectName } = get()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, projectName }))
    } catch (e) {
      console.error('Failed to save', e)
    }
  },

  autoLayout: () => {
    const { nodes, edges } = get()
    const inDegree = Object.fromEntries(nodes.map((n) => [n.id, 0]))
    const outEdges = Object.fromEntries(nodes.map((n) => [n.id, []]))
    edges.forEach((e) => {
      if (inDegree[e.target] !== undefined) inDegree[e.target]++
      if (outEdges[e.source]) outEdges[e.source].push(e.target)
    })
    // BFS to assign depth levels
    const levels = {}
    const roots = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id)
    roots.forEach((id) => { levels[id] = 0 })
    const queue = [...roots]
    const visited = new Set(roots)
    let head = 0
    while (head < queue.length) {
      const id = queue[head++]
      ;(outEdges[id] || []).forEach((tid) => {
        levels[tid] = Math.max(levels[tid] ?? 0, (levels[id] ?? 0) + 1)
        if (!visited.has(tid)) { visited.add(tid); queue.push(tid) }
      })
    }
    nodes.forEach((n) => { if (levels[n.id] === undefined) levels[n.id] = 0 })
    // Group by level
    const levelGroups = {}
    nodes.forEach((n) => {
      const lv = levels[n.id]
      if (!levelGroups[lv]) levelGroups[lv] = []
      levelGroups[lv].push(n.id)
    })
    const H_GAP = 320 // Increased from 260
    const V_GAP = 180 // Increased from 150
    const CENTER_Y = 400
    
    // Sort nodes within each level to maintain some consistency (e.g., by ID or Type)
    Object.keys(levelGroups).forEach(lv => {
      levelGroups[lv].sort((a, b) => a.localeCompare(b))
    })

    const newNodes = nodes.map((n) => {
      const lv = levels[n.id]
      const group = levelGroups[lv]
      const idx = group.indexOf(n.id)
      
      // Calculate X and Y with better spacing
      const x = lv * H_GAP + 100
      // Center the group vertically around CENTER_Y
      const y = CENTER_Y + (idx - (group.length - 1) / 2) * V_GAP
      
      return { ...n, position: { x, y } }
    })
    set({ nodes: newNodes })
    get()._save()
  },

  getAssessment: () => {
    const { nodes } = get()
    const processNodes = nodes.filter((n) => n.type === 'process' || n.type === 'decision')
    const ai = processNodes.filter((n) => n.data.responsible === 'ai').length
    const human = processNodes.filter((n) => n.data.responsible === 'human').length
    const hybrid = processNodes.filter((n) => n.data.responsible === 'hybrid').length
    const total = processNodes.length

    const allTechs = processNodes.flatMap((n) => n.data.aiTech || [])
    const techCount = allTechs.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {})

    return {
      total,
      ai,
      human,
      hybrid,
      aiPercent: total ? Math.round((ai / total) * 100) : 0,
      hybridPercent: total ? Math.round((hybrid / total) * 100) : 0,
      autoPercent: total ? Math.round(((ai + hybrid) / total) * 100) : 0,
      techCount,
    }
  },
}))

export default useFlowStore
