import { Handle, Position } from '@xyflow/react'

const RESPONSIBLE_STYLES = {
  ai: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700',
    handle: '#10b981',
    label: 'AI 自動化',
    dot: 'bg-emerald-400',
  },
  human: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    handle: '#3b82f6',
    label: '人工執行',
    dot: 'bg-blue-400',
  },
  hybrid: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    handle: '#f59e0b',
    label: 'AI 輔助',
    dot: 'bg-amber-400',
  },
}

const DIFFICULTY_COLORS = {
  easy: 'text-emerald-600',
  medium: 'text-amber-600',
  hard: 'text-red-600',
}

const DIFFICULTY_LABELS = { easy: '易', medium: '中', hard: '難' }
const PRIORITY_LABELS = { high: '高', medium: '中', low: '低' }

export default function ProcessNode({ data, selected }) {
  const style = RESPONSIBLE_STYLES[data.responsible] || RESPONSIBLE_STYLES.human
  const handleColor = style.handle

  return (
    <div
      className={`
        min-w-[160px] max-w-[220px] rounded-xl border-2 shadow-md
        ${style.bg} ${style.border}
        ${selected ? 'ring-2 ring-offset-1 ring-indigo-400 shadow-lg' : ''}
        transition-all duration-150 cursor-pointer
      `}
    >
      <Handle type="target" position={Position.Left} style={{ background: handleColor }} />

      <div className="px-3 pt-2.5 pb-2">
        {/* Badge row */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
            {style.label}
          </span>
          {data.priority === 'high' && (
            <span className="text-[10px] font-semibold text-red-500 ml-auto">⚡</span>
          )}
        </div>

        {/* Label */}
        <div className="text-sm font-semibold text-gray-800 leading-tight break-words">
          {data.label}
        </div>

        {/* Description */}
        {data.description && (
          <div className="text-[11px] text-gray-500 mt-1 leading-tight line-clamp-2">
            {data.description}
          </div>
        )}

        {/* AI Tech tags */}
        {data.aiTech?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {data.aiTech.slice(0, 2).map((tech) => (
              <span key={tech} className="text-[10px] bg-white/70 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                {tech}
              </span>
            ))}
            {data.aiTech.length > 2 && (
              <span className="text-[10px] text-gray-400">+{data.aiTech.length - 2}</span>
            )}
          </div>
        )}

        {/* Footer */}
        {(data.difficulty || data.priority) && (
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-black/5">
            {data.difficulty && (
              <span className={`text-[10px] font-medium ${DIFFICULTY_COLORS[data.difficulty]}`}>
                難度：{DIFFICULTY_LABELS[data.difficulty]}
              </span>
            )}
            {data.priority && (
              <span className="text-[10px] text-gray-400 ml-auto">
                優先：{PRIORITY_LABELS[data.priority]}
              </span>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ background: handleColor }} />
    </div>
  )
}
