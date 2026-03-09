import { useShallow } from 'zustand/react/shallow'
import useFlowStore from '../store/flowStore'

const AI_TECH_OPTIONS = [
  'Claude API',
  'ChatGPT / GPT-4',
  'RPA / UiPath',
  'Python Script',
  'n8n',
  'Make.com',
  'Vibe Coding',
  'Custom Dev',
  'Google AI',
  'Line Bot',
]

const ResponsibleBtn = ({ value, current, label, color, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`
      flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all
      ${current === value ? `${color.bg} ${color.border} ${color.text}` : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}
    `}
  >
    {label}
  </button>
)

function NumInput({ label, unit, value, onChange }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 pr-6"
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none">{unit}</span>
      </div>
    </div>
  )
}

function EdgePanel({ edge, updateEdge, deleteEdge, setSelectedEdge }) {
  const isException = edge.isException || false

  const toggleException = () => {
    updateEdge(edge.id, {
      isException: !isException,
      style: !isException
        ? { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6,3' }
        : { stroke: '#64748b', strokeWidth: 2 },
      animated: !isException,
    })
  }

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-bold text-slate-700">連線屬性</span>
        <button onClick={() => setSelectedEdge(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">連線標籤</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={edge.label || ''}
            onChange={(e) => updateEdge(edge.id, { label: e.target.value })}
            placeholder="例：是、否、例外..."
          />
        </div>

        {/* Exception toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">路徑類型</label>
          <button
            onClick={toggleException}
            className={`w-full py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
              isException
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {isException ? '🔴 例外 / 錯誤路徑' : '⬜ 正常路徑（點擊切換）'}
          </button>
          {isException && (
            <p className="text-[11px] text-red-400 mt-1.5">紅色虛線 = 例外 / 錯誤處理路徑</p>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-400 leading-relaxed">
          💡 例外路徑用於標記：AI 信心度不足轉人工、錯誤回滾、超時處理等非主要流程。
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => deleteEdge(edge.id)}
          className="w-full py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          刪除此連線
        </button>
      </div>
    </div>
  )
}

export default function NodePanel() {
  const {
    nodes, edges, selectedNodeId, selectedEdgeId,
    setSelectedNode, setSelectedEdge, updateNodeData, deleteNode,
    updateEdge, deleteEdge,
  } = useFlowStore(
    useShallow((s) => ({
      nodes: s.nodes, edges: s.edges,
      selectedNodeId: s.selectedNodeId, selectedEdgeId: s.selectedEdgeId,
      setSelectedNode: s.setSelectedNode, setSelectedEdge: s.setSelectedEdge,
      updateNodeData: s.updateNodeData, deleteNode: s.deleteNode,
      updateEdge: s.updateEdge, deleteEdge: s.deleteEdge,
    }))
  )

  const node = nodes.find((n) => n.id === selectedNodeId)
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId)

  // Edge panel
  if (!node && selectedEdge) {
    return (
      <EdgePanel
        edge={selectedEdge}
        updateEdge={updateEdge}
        deleteEdge={deleteEdge}
        setSelectedEdge={setSelectedEdge}
      />
    )
  }

  // Empty state
  if (!node) {
    return (
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
          <span className="text-3xl">🖱️</span>
        </div>
        <p className="text-sm font-medium text-slate-600">點擊節點查看屬性</p>
        <p className="text-xs text-slate-400 mt-1">點擊連線可設定例外路徑</p>
      </div>
    )
  }

  const update = (field, value) => updateNodeData(node.id, { [field]: value })

  const toggleTech = (tech) => {
    const current = node.data.aiTech || []
    const next = current.includes(tech) ? current.filter((t) => t !== tech) : [...current, tech]
    update('aiTech', next)
  }

  const vol = Number(node.data.monthlyVolume) || 0
  const manual = Number(node.data.manualTime) || 0
  const auto = Number(node.data.autoTime) || 0
  const stepSavedMin = vol > 0 && manual > 0 ? vol * (manual - auto) : null
  const stepSavedHours = stepSavedMin !== null ? Math.round(stepSavedMin / 60 * 10) / 10 : null

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-bold text-slate-700">節點屬性</span>
        <button
          onClick={() => setSelectedNode(null)}
          className="text-slate-400 hover:text-slate-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            步驟名稱
          </label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            value={node.data.label}
            onChange={(e) => update('label', e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            步驟描述
          </label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
            rows={2}
            placeholder="簡述此步驟的內容..."
            value={node.data.description || ''}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        {/* Responsible Type — only for process nodes */}
        {(node.type === 'process' || node.type === 'decision') && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              執行類型
            </label>
            <div className="flex gap-2">
              <ResponsibleBtn
                value="ai"
                current={node.data.responsible}
                label="🤖 AI"
                color={{ bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-700' }}
                onClick={(v) => update('responsible', v)}
              />
              <ResponsibleBtn
                value="hybrid"
                current={node.data.responsible}
                label="⚡ 混合"
                color={{ bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700' }}
                onClick={(v) => update('responsible', v)}
              />
              <ResponsibleBtn
                value="human"
                current={node.data.responsible}
                label="👤 人工"
                color={{ bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700' }}
                onClick={(v) => update('responsible', v)}
              />
            </div>
          </div>
        )}

        {/* AI Tech — only when AI or hybrid */}
        {(node.data.responsible === 'ai' || node.data.responsible === 'hybrid') && node.type !== 'startEnd' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              建議技術
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AI_TECH_OPTIONS.map((tech) => {
                const selected = (node.data.aiTech || []).includes(tech)
                return (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`
                      text-xs px-2.5 py-1.5 rounded-lg border transition-all
                      ${selected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }
                    `}
                  >
                    {tech}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Difficulty + Priority */}
        {node.type !== 'startEnd' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                難度
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                value={node.data.difficulty || 'medium'}
                onChange={(e) => update('difficulty', e.target.value)}
              >
                <option value="easy">簡單</option>
                <option value="medium">中等</option>
                <option value="hard">困難</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                優先級
              </label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                value={node.data.priority || 'medium'}
                onChange={(e) => update('priority', e.target.value)}
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
        )}

        {/* Department */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            所屬部門
          </label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
            placeholder="例：業務部、IT 部..."
            value={node.data.department || ''}
            onChange={(e) => update('department', e.target.value)}
          />
        </div>

        {/* System Used */}
        {node.type !== 'startEnd' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              使用系統 / 工具
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
              placeholder="例：Salesforce、SAP、Excel、Google Form..."
              value={node.data.system || ''}
              onChange={(e) => update('system', e.target.value)}
            />
          </div>
        )}

        {/* Input / Output */}
        {node.type !== 'startEnd' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                輸入資料
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
                rows={3}
                placeholder="表單、CSV、API...&#10;每行一項"
                value={node.data.inputData || ''}
                onChange={(e) => update('inputData', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                輸出資料
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
                rows={3}
                placeholder="報表、Email、DB...&#10;每行一項"
                value={node.data.outputData || ''}
                onChange={(e) => update('outputData', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ROI / Volume fields — only for process nodes */}
        {node.type === 'process' && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
              ⏱ 工作量估算
            </label>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <NumInput
                  label="月執行量"
                  unit="次"
                  value={node.data.monthlyVolume}
                  onChange={(v) => update('monthlyVolume', v)}
                />
                <NumInput
                  label="人工耗時"
                  unit="分"
                  value={node.data.manualTime}
                  onChange={(v) => update('manualTime', v)}
                />
                <NumInput
                  label="自動化後"
                  unit="分"
                  value={node.data.autoTime}
                  onChange={(v) => update('autoTime', v)}
                />
              </div>
              {stepSavedHours !== null && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-[10px] text-slate-500">此步驟每月節省</span>
                  <span className={`text-xs font-bold ${stepSavedHours >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stepSavedHours >= 0 ? `${stepSavedHours} 小時` : `增加 ${Math.abs(stepSavedHours)} 小時`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes for dev */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
            給技術團隊的備註
          </label>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 resize-none"
            rows={3}
            placeholder="API 規格、特殊需求、注意事項..."
            value={node.data.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </div>

      {/* Delete button */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          刪除此節點
        </button>
      </div>
    </div>
  )
}
