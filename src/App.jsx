import { useRef, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Toolbar from './components/Toolbar'
import FlowEditor from './components/FlowEditor'
import NodePanel from './components/NodePanel'
import AssessmentPanel from './components/AssessmentPanel'
import AIGenerateModal from './components/AIGenerateModal'

export default function App() {
  const flowRef = useRef(null)
  const [showAIModal, setShowAIModal] = useState(false)

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50">
        <Toolbar flowRef={flowRef} onOpenAIGenerate={() => setShowAIModal(true)} />
        <div className="flex flex-1 overflow-hidden">
          <FlowEditor flowRef={flowRef} />
          <NodePanel />
        </div>
        <AssessmentPanel />
      </div>
      {showAIModal && <AIGenerateModal onClose={() => setShowAIModal(false)} />}
    </ReactFlowProvider>
  )
}
