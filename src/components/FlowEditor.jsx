import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
  MarkerType,
  useReactFlow,
} from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import useFlowStore from '../store/flowStore'
import ProcessNode  from './nodes/ProcessNode'
import DecisionNode from './nodes/DecisionNode'
import StartEndNode from './nodes/StartEndNode'
import SystemNode   from './nodes/SystemNode'
import WaitNode     from './nodes/WaitNode'
import FileNode     from './nodes/FileNode'
import MailNode     from './nodes/MailNode'
import NoteNode     from './nodes/NoteNode'

const nodeTypes = {
  process:  ProcessNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  system:   SystemNode,
  wait:     WaitNode,
  file:     FileNode,
  mail:     MailNode,
  note:     NoteNode,
}

const NODE_ICONS = {
  process: '🟦', decision: '🔶', startEnd: '⚪',
  system: '🖥️', wait: '⏳', file: '📄', mail: '✉️', note: '📝',
}

const NODE_NAMES = {
  process: '步驟', decision: '判斷', startEnd: '起止',
  system: '系統', wait: '等待', file: '資料', mail: '郵件', note: '便利貼',
}

const nodeColor = (node) => {
  if (node.type === 'note') return '#fbbf24'
  const map = { ai: '#10b981', human: '#3b82f6', hybrid: '#f59e0b' }
  return map[node.data?.responsible] || '#94a3b8'
}

// Search panel — uses useReactFlow, must be rendered inside ReactFlow tree
function SearchPanel() {
  const { setCenter } = useReactFlow()
  const { nodes, searchQuery, isSearchOpen, setSearchQuery, toggleSearch, setSelectedNode } = useFlowStore(
    useShallow((s) => ({
      nodes: s.nodes,
      searchQuery: s.searchQuery,
      isSearchOpen: s.isSearchOpen,
      setSearchQuery: s.setSearchQuery,
      toggleSearch: s.toggleSearch,
      setSelectedNode: s.setSelectedNode,
    }))
  )

  if (!isSearchOpen) return null

  const query   = searchQuery.trim().toLowerCase()
  const matches = query
    ? nodes.filter((n) => (n.data.label || '').toLowerCase().includes(query)).slice(0, 8)
    : []

  const focusNode = (node) => {
    setCenter(node.position.x + 110, node.position.y + 50, { zoom: 1.5, duration: 400 })
    setSelectedNode(node.id)
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-64 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
        <span className="text-slate-400 text-sm">🔍</span>
        <input
          autoFocus
          className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400"
          placeholder="搜尋節點名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && toggleSearch()}
        />
        <button onClick={toggleSearch} className="text-slate-400 hover:text-slate-600 text-sm leading-none">✕</button>
      </div>

      {matches.length > 0 && (
        <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
          {matches.map((node) => (
            <button
              key={node.id}
              onClick={() => focusNode(node)}
              className="w-full px-3 py-2 text-left hover:bg-indigo-50 flex items-center gap-2 transition-colors"
            >
              <span className="text-sm flex-shrink-0">{NODE_ICONS[node.type] || '🟦'}</span>
              <span className="text-sm text-slate-700 truncate flex-1">{node.data.label}</span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">{NODE_NAMES[node.type]}</span>
            </button>
          ))}
        </div>
      )}

      {query && matches.length === 0 && (
        <div className="px-3 py-3 text-sm text-slate-400 text-center">未找到節點</div>
      )}

      {!query && (
        <div className="px-3 py-2 text-xs text-slate-400">輸入關鍵字搜尋節點名稱</div>
      )}
    </div>
  )
}

export default function FlowEditor({ flowRef }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, setSelectedEdge } =
    useFlowStore(useShallow((s) => ({
      nodes: s.nodes, edges: s.edges,
      onNodesChange: s.onNodesChange, onEdgesChange: s.onEdgesChange,
      onConnect: s.onConnect, setSelectedNode: s.setSelectedNode,
      setSelectedEdge: s.setSelectedEdge,
    })))

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.id)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  const onEdgeClick = useCallback((_, edge) => {
    setSelectedEdge(edge.id)
    setSelectedNode(null)
  }, [setSelectedEdge, setSelectedNode])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  return (
    <div ref={flowRef} className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: 'step',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          animated: false,
          labelStyle: { fontSize: 10, fontWeight: 600, fill: '#64748b' },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} className="rounded-lg shadow-md" />
        <MiniMap
          nodeColor={nodeColor}
          className="rounded-lg shadow-md border border-slate-200"
          maskColor="rgba(241,245,249,0.7)"
        />
        <Panel position="top-left" className="mt-1 ml-1">
          <SearchPanel />
        </Panel>
        <Panel position="bottom-center" className="mb-2">
          <div className="bg-white/80 backdrop-blur-sm text-xs text-slate-400 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            點擊節點選取 · Shift+點擊多選 · Delete 刪除 · Ctrl+F 搜尋
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
