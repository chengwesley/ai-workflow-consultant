import { Handle, Position } from '@xyflow/react'
import MermaidRenderer from '../MermaidRenderer'

export default function DecisionNode({ data, selected }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-w-[140px]">
      <Handle type="target" position={Position.Left} style={{ background: '#f97316' }} />

      <div className="relative flex items-center justify-center w-full min-h-[80px]">
        {/* Diamond shape via CSS */}
        <div
          className={`
            absolute inset-0 bg-orange-50 border-2 border-orange-400
            ${selected ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}
          `}
          style={{
            transform: 'rotate(45deg)',
            borderRadius: '6px',
            boxShadow: selected ? undefined : '0 2px 8px rgba(0,0,0,0.1)',
          }}
        />

        {/* Text in center (no rotation) */}
        <div className="relative z-10 text-center px-4 py-2">
          <div className="text-xs font-semibold text-orange-800 leading-tight break-words max-w-[100px]">
            {data.label}
          </div>
          {data.description && (
            <div className="text-[10px] text-orange-600 mt-0.5 line-clamp-1">{data.description}</div>
          )}
        </div>
      </div>

      {/* Mermaid visualization (if available) - rendered below the diamond */}
      {data.mermaidCode && (
        <div className="mt-4 p-2 bg-white/60 border border-orange-200 rounded-lg shadow-sm z-20 w-full">
           <div className="text-[8px] text-orange-400 mb-1 flex items-center gap-1 uppercase tracking-wider font-bold">
             <span>🔍 判斷邏輯細節</span>
           </div>
           <MermaidRenderer 
             chartCode={data.mermaidCode} 
             className="max-h-[100px]" 
           />
        </div>
      )}

      <Handle type="source" position={Position.Right} id="right" style={{ background: '#f97316' }} />
      <Handle type="source" position={Position.Top} id="top" style={{ background: '#f97316' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#f97316' }} />
    </div>
  )
}
