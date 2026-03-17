import { Handle, Position } from '@xyflow/react'

const COLORS = {
  yellow: { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-900',  fold: '#fcd34d' },
  green:  { bg: 'bg-green-50',  border: 'border-green-300',  text: 'text-green-900',  fold: '#6ee7b7' },
  blue:   { bg: 'bg-sky-50',    border: 'border-sky-300',    text: 'text-sky-900',    fold: '#7dd3fc' },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-300',   text: 'text-pink-900',   fold: '#f9a8d4' },
}

export default function NoteNode({ data, selected }) {
  const c = COLORS[data.noteColor || 'yellow']

  return (
    <div
      className={`
        relative w-44 min-h-[80px] rounded-sm border
        ${c.bg} ${c.border}
        ${selected ? 'ring-2 ring-offset-1 ring-amber-400 shadow-xl' : 'shadow-md hover:shadow-lg'}
        transition-all duration-150 cursor-pointer
      `}
      style={{ boxShadow: '2px 3px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' }}
    >
      {/* Dog-ear fold */}
      <div
        className="absolute top-0 right-0 w-5 h-5"
        style={{
          background: `linear-gradient(225deg, ${c.fold} 50%, transparent 50%)`,
          borderLeft: '1px solid rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      />

      <div className="p-3 pr-5">
        <p className={`text-sm ${c.text} whitespace-pre-wrap break-words leading-relaxed`}>
          {data.label || '📝 點擊編輯便利貼'}
        </p>
      </div>

      <Handle type="target" position={Position.Left}  style={{ width: 8, height: 8, opacity: 0.35, background: '#94a3b8' }} />
      <Handle type="source" position={Position.Right} style={{ width: 8, height: 8, opacity: 0.35, background: '#94a3b8' }} />
    </div>
  )
}
