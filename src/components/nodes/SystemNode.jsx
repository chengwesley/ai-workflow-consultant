import { Handle, Position } from '@xyflow/react'

export default function SystemNode({ data, selected }) {
  return (
    <div className={`
      relative px-4 py-3 min-w-[120px] 
      bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg shadow-xl
      ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
      transition-all duration-200 group
    `}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-slate-400" />
      
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <span className="text-xs font-bold text-slate-100 uppercase tracking-tighter">System</span>
        </div>
        
        <div className="w-full h-px bg-slate-700/50 my-1" />
        
        <div className="text-sm font-semibold text-white text-center leading-tight">
          {data.label}
        </div>
        
        {data.system && (
          <div className="text-[10px] text-slate-400 font-medium">
            {data.system}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-slate-400" />
      
      {/* Premium Cylinder Effect Decor */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-slate-600/30 rounded-full blur-[1px]" />
    </div>
  )
}
