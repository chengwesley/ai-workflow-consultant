import { Handle, Position } from '@xyflow/react'

export default function StartEndNode({ data, selected }) {
  const isStart = data.nodeType === 'start'

  return (
    <div
      className={`
        px-6 py-2.5 rounded-full border-2 shadow-md min-w-[100px] text-center
        ${isStart ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-400 text-gray-700'}
        ${selected ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}
        transition-all duration-150 cursor-pointer
      `}
    >
      {!isStart && <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />}

      <span className="text-sm font-bold tracking-wide">{data.label}</span>

      {isStart && <Handle type="source" position={Position.Right} style={{ background: '#94a3b8' }} />}
    </div>
  )
}
