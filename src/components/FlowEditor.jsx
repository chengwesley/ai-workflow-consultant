import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import { useShallow } from 'zustand/react/shallow'
import useFlowStore from '../store/flowStore'
import ProcessNode from './nodes/ProcessNode'
import DecisionNode from './nodes/DecisionNode'
import StartEndNode from './nodes/StartEndNode'
import SystemNode from './nodes/SystemNode'
import WaitNode from './nodes/WaitNode'
import FileNode from './nodes/FileNode'
import MailNode from './nodes/MailNode'

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  system: SystemNode,
  wait: WaitNode,
  file: FileNode,
  mail: MailNode,
}

const nodeColor = (node) => {
  const map = { ai: '#10b981', human: '#3b82f6', hybrid: '#f59e0b' }
  return map[node.data?.responsible] || '#94a3b8'
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
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          animated: false,
          labelStyle: { fontSize: 10, fontWeight: 600, fill: '#64748b' },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
          labelBgPadding: [4, 2],
          borderRadius: 12,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls showInteractive={false} className="rounded-lg shadow-md" />
        <MiniMap
          nodeColor={nodeColor}
          className="rounded-lg shadow-md border border-slate-200"
          maskColor="rgba(241,245,249,0.7)"
        />
        <Panel position="bottom-center" className="mb-2">
          <div className="bg-white/80 backdrop-blur-sm text-xs text-slate-400 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            點擊節點選取 · 點擊連線編輯 · Delete 刪除
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
