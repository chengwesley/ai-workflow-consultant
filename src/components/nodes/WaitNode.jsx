import { Handle, Position } from '@xyflow/react'

export default function WaitNode({ data, selected }) {
  return (
    <div className={`
      relative px-6 py-3 min-w-[100px] 
      bg-amber-50/90 backdrop-blur-sm border-2 border-dashed border-amber-300 rounded-2xl shadow-lg
      ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
      transition-all duration-200
    `}>
      <Handle type="target" position={Position.Left} style={{ background: '#d97706' }} />
      
      <div className="flex flex-col items-center gap-1">
        <span className="text-xl animate-pulse">⏳</span>
        <div className="text-sm font-bold text-amber-900 text-center">
          {data.label || '等待...'}
        </div>
        {data.manualTime > 0 && (
          <div className="text-[10px] font-semibold bg-amber-200/50 px-1.5 rounded text-amber-700">
            {data.manualTime} 分鐘
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#d97706' }} />
    </div>
  )
}
