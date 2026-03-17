import { Handle, Position } from '@xyflow/react'

export default function FileNode({ data, selected }) {
  return (
    <div className={`
      relative px-4 py-3 min-w-[110px] 
      bg-emerald-50/90 backdrop-blur-sm border-2 border-emerald-200 rounded-tr-2xl rounded-bl-sm rounded-tl-sm rounded-br-sm shadow-md
      ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
      transition-all duration-200
    `}>
      <Handle type="target" position={Position.Top} style={{ background: '#059669' }} />
      
      <div className="flex items-center gap-2">
        <span className="text-lg">📄</span>
        <div className="flex flex-col">
          <div className="text-xs font-bold text-emerald-800 leading-tight">
            {data.label}
          </div>
          <div className="text-[9px] text-emerald-600 font-medium truncate max-w-[80px]">
            {data.inputData || data.outputData || '資料節點'}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#059669' }} />
      
      {/* Dog-ear fold effect */}
      <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-100 border-l border-b border-emerald-200 rounded-bl-md" />
    </div>
  )
}
