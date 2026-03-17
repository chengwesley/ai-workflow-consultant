import { create } from 'zustand'
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import dagre from 'dagre'

const STORAGE_KEY = 'ai-flow-consultant-data'
const MAX_HISTORY = 50

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
const initialNodes = saved?.nodes || defaultNodes
const initialEdges = saved?.edges || []

const useFlowStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  selectedEdgeId: null,
  projectName: saved?.projectName || '未命名專案',
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,

  _pushHistory: () => {
    const { nodes, edges, history, historyIndex } = get()
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    }
    const next = [...history.slice(0, historyIndex + 1), snapshot]
    const trimmed = next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
    set({ history: trimmed, historyIndex: trimmed.length - 1 })
  },

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const { nodes, edges } = history[newIndex]
    set({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      historyIndex: newIndex,
      selectedNodeId: null,
      selectedEdgeId: null,
    })
    get()._save()
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const { nodes, edges } = history[newIndex]
    set({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      historyIndex: newIndex,
      selectedNodeId: null,
      selectedEdgeId: null,
    })
    get()._save()
  },

  onNodesChange: (changes) => {
    if (changes.some(c => c.type === 'remove')) get()._pushHistory()
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }))
    get()._save()
  },

  onEdgesChange: (changes) => {
    if (changes.some(c => c.type === 'remove')) get()._pushHistory()
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }))
    get()._save()
  },

  onConnect: (connection) => {
    get()._pushHistory()
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: 'step',
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        },
        state.edges
      ),
    }))
    get()._save()
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id }),

  addNode: (type) => {
    get()._pushHistory()
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
    get()._pushHistory()
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
    get()._pushHistory()
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }))
    get()._save()
  },

  deleteNode: (id) => {
    get()._pushHistory()
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
    get()._pushHistory()
    set({ nodes: defaultNodes, edges: [], selectedNodeId: null })
    get()._save()
  },

  loadFromJSON: (json) => {
    try {
      get()._pushHistory()
      const data = typeof json === 'string' ? JSON.parse(json) : json
      set({ nodes: data.nodes || [], edges: data.edges || [], projectName: data.projectName || '匯入專案', selectedNodeId: null })
      get()._save()
    } catch (e) {
      console.error('Failed to load JSON', e)
    }
  },

  importMermaidData: ({ nodes, edges }) => {
    get()._pushHistory()
    set({ nodes, edges, selectedNodeId: null, selectedEdgeId: null })
    get().autoLayout()
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
    if (nodes.length === 0) return

    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 160 })
    g.setDefaultEdgeLabel(() => ({}))

    const nodeWidth = 220
    const nodeHeight = 100

    nodes.forEach((node) => {
      g.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target)
    })

    dagre.layout(g)

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = g.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      }
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
