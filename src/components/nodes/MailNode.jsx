import { Handle, Position } from '@xyflow/react'

export default function MailNode({ data, selected }) {
  return (
    <div className={`
      relative px-4 py-3 min-w-[130px] 
      bg-sky-50/90 backdrop-blur-sm border-2 border-sky-300 rounded-md shadow-md
      ${selected ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
      transition-all duration-200
    `}>
      <Handle type="target" position={Position.Left} style={{ background: '#0ea5e9' }} />
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center text-white shadow-inner">
          <span className="text-sm">✉️</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-sky-600 uppercase">Notification</span>
          <div className="text-xs font-bold text-sky-900 leading-tight">
            {data.label}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: '#0ea5e9' }} />
      
      {/* Envelope flap effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-sky-400 group-hover:h-2 transition-all" />
    </div>
  )
}
