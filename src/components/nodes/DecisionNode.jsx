import { Handle, Position } from '@xyflow/react'

export default function DecisionNode({ data, selected }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 80 }}>
      <Handle type="target" position={Position.Left} style={{ background: '#f97316' }} />

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
      <div className="relative z-10 text-center px-2">
        <div className="text-xs font-semibold text-orange-800 leading-tight break-words max-w-[100px]">
          {data.label}
        </div>
        {data.description && (
          <div className="text-[10px] text-orange-600 mt-0.5 line-clamp-1">{data.description}</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="right" style={{ background: '#f97316' }} />
      <Handle type="source" position={Position.Top} id="top" style={{ background: '#f97316' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#f97316' }} />
    </div>
  )
}
