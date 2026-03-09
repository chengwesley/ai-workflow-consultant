import { useMemo } from 'react'
import useFlowStore from '../store/flowStore'

function computeAssessment(nodes) {
  const processNodes = nodes.filter((n) => n.type === 'process' || n.type === 'decision')
  const ai = processNodes.filter((n) => n.data.responsible === 'ai').length
  const human = processNodes.filter((n) => n.data.responsible === 'human').length
  const hybrid = processNodes.filter((n) => n.data.responsible === 'hybrid').length
  const total = processNodes.length
  const allTechs = processNodes.flatMap((n) => n.data.aiTech || [])
  const techCount = allTechs.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {})

  // ROI calculation
  let totalManualMin = 0
  let savedMin = 0
  let hasROIData = false
  processNodes.forEach((n) => {
    const vol = Number(n.data.monthlyVolume) || 0
    const manual = Number(n.data.manualTime) || 0
    const auto = Number(n.data.autoTime) || 0
    if (vol > 0 && manual > 0) {
      hasROIData = true
      totalManualMin += vol * manual
      if (n.data.responsible === 'ai' || n.data.responsible === 'hybrid') {
        savedMin += vol * (manual - auto)
      }
    }
  })
  const savedHours = Math.round(savedMin / 60 * 10) / 10
  const totalHours = Math.round(totalManualMin / 60 * 10) / 10

  return {
    total, ai, human, hybrid,
    aiPercent: total ? Math.round((ai / total) * 100) : 0,
    hybridPercent: total ? Math.round((hybrid / total) * 100) : 0,
    autoPercent: total ? Math.round(((ai + hybrid) / total) * 100) : 0,
    techCount,
    hasROIData, savedHours, totalHours,
  }
}

const TECH_ICONS = {
  'Claude API': '🤖',
  'ChatGPT / GPT-4': '💬',
  'RPA / UiPath': '⚙️',
  'Python Script': '🐍',
  'n8n': '🔗',
  'Make.com': '⚡',
  'Vibe Coding': '🎵',
  'Custom Dev': '💻',
  'Google AI': '🔍',
  'Line Bot': '📱',
}

function ProgressBar({ value, color }) {
  return (
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function AssessmentPanel() {
  const nodes = useFlowStore((s) => s.nodes)
  const { total, ai, human, hybrid, aiPercent, hybridPercent, autoPercent, techCount, hasROIData, savedHours, totalHours } = useMemo(
    () => computeAssessment(nodes),
    [nodes]
  )

  const techEntries = Object.entries(techCount).sort((a, b) => b[1] - a[1])

  return (
    <div className="h-24 bg-white border-t border-slate-200 flex items-center px-6 gap-8 flex-shrink-0 overflow-x-auto">
      {/* Overall score */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-center">
          <div className="text-2xl font-black text-indigo-600">{autoPercent}%</div>
          <div className="text-[10px] text-slate-400 font-medium">可自動化</div>
        </div>
        <div className="w-px h-10 bg-slate-200" />
      </div>

      {/* Stats */}
      <div className="flex gap-6 flex-shrink-0">
        {/* Total */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-xs text-slate-500">
            共 <span className="font-bold text-slate-700">{total}</span> 步驟
          </span>
        </div>

        {/* AI */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <span className="text-xs text-slate-500">
              AI 自動化 <span className="font-bold text-emerald-600">{ai}</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ProgressBar value={aiPercent} color="bg-emerald-400" />
              <span className="text-[10px] text-slate-400 w-8">{aiPercent}%</span>
            </div>
          </div>
        </div>

        {/* Hybrid */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div>
            <span className="text-xs text-slate-500">
              AI 輔助 <span className="font-bold text-amber-600">{hybrid}</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ProgressBar value={hybridPercent} color="bg-amber-400" />
              <span className="text-[10px] text-slate-400 w-8">{hybridPercent}%</span>
            </div>
          </div>
        </div>

        {/* Human */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <span className="text-xs text-slate-500">
            人工 <span className="font-bold text-blue-600">{human}</span>
          </span>
        </div>
      </div>

      {/* ROI */}
      {hasROIData && (
        <>
          <div className="w-px h-10 bg-slate-200 flex-shrink-0" />
          <div className="flex-shrink-0 text-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600">{savedHours}</span>
              <span className="text-xs text-slate-400 font-medium">小時/月</span>
            </div>
            <div className="text-[10px] text-slate-400">
              可節省（共 {totalHours}h）
            </div>
          </div>
        </>
      )}

      {/* Divider */}
      {techEntries.length > 0 && <div className="w-px h-10 bg-slate-200 flex-shrink-0" />}

      {/* Tech used */}
      {techEntries.length > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex-shrink-0">技術棧</span>
          <div className="flex flex-wrap gap-1.5">
            {techEntries.map(([tech, count]) => (
              <span
                key={tech}
                className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
              >
                {TECH_ICONS[tech] || '🔧'} {tech}
                {count > 1 && <span className="ml-1 text-indigo-400">×{count}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <span className="text-xs text-slate-400 italic">新增節點後，自動化評估結果將顯示在此</span>
      )}
    </div>
  )
}
