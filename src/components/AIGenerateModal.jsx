import { useState, useEffect } from 'react'
import useFlowStore from '../store/flowStore'

const API_KEY_STORAGE = 'anthropic-api-key'

const SYSTEM_PROMPT = `You are an expert AI workflow automation consultant. The user will describe a business process in natural language (possibly in Traditional Chinese). Your job is to:
1. Break down the process into clear steps
2. For each step, determine if it can be automated by AI, requires human action, or is a hybrid
3. Identify decision points
4. Suggest appropriate AI technologies for automatable steps
5. Note what systems are used and what data flows in/out

Respond ONLY with a valid JSON object in this exact structure (no markdown, no explanation):
{
  "projectName": "concise project name in Traditional Chinese",
  "nodes": [
    {
      "id": "node-1",
      "type": "startEnd",
      "position": { "x": 400, "y": 50 },
      "data": {
        "label": "開始",
        "nodeType": "start",
        "responsible": "human",
        "description": "",
        "aiTech": [],
        "difficulty": "easy",
        "priority": "medium",
        "notes": "",
        "department": "",
        "system": "",
        "inputData": "",
        "outputData": "",
        "monthlyVolume": 0,
        "manualTime": 0,
        "autoTime": 0
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node-1",
      "target": "node-2",
      "label": "",
      "style": { "stroke": "#64748b", "strokeWidth": 2 }
    }
  ]
}

Node rules (LEFT-TO-RIGHT layout — x increases for each step, y is centered around 350):
- ALWAYS start with type "startEnd" (nodeType: "start") at position x:50, y:350
- ALWAYS end with type "startEnd" (nodeType: "end") at far right
- Process steps: type "process", increase x by 260 for each sequential step (y stays ~350)
- Decision nodes: type "decision" (width 140, height 80), place at next x column, y:320
- For decision branches: main branch goes RIGHT (sourceHandle:"right", same y), up-branch goes TOP (sourceHandle:"top", y-160), down-branch goes BOTTOM (sourceHandle:"bottom", y+160)
- After branches merge back, continue at next x column
- "responsible": "ai" = fully AI automatable, "human" = human only, "hybrid" = AI assisted
- "aiTech": only for ai/hybrid, choose from: ["Claude API","ChatGPT / GPT-4","RPA / UiPath","Python Script","n8n","Make.com","Vibe Coding","Custom Dev","Google AI","Line Bot"]
- "difficulty": "easy" | "medium" | "hard"
- "priority": "high" | "medium" | "low"
- "system": name of software/tool used (e.g. "Salesforce", "Excel", "Google Forms")
- "inputData": what data/documents enter this step
- "outputData": what data/documents exit this step
- Edge labels: use "是" / "否" for decision branches, empty for regular connections
- ROI estimation (for process nodes only, startEnd/decision leave as 0):
  - "monthlyVolume": estimated number of times this step runs per month (integer, e.g. 100~500 for high-volume, 10~50 for low-volume)
  - "manualTime": minutes a human currently spends on this step each time (integer, realistic estimate: data entry=5~15, review=10~30, complex analysis=30~60)
  - "autoTime": minutes after automation (0 for full AI, 1~5 for hybrid needing human review, same as manualTime for human-only steps)
- Write all labels, descriptions, notes in Traditional Chinese`

const SAMPLE_DATA = {
  projectName: "客戶詢問處理流程",
  nodes: [
    { id: "node-start", type: "startEnd", position: { x: 50, y: 350 },
      data: { label: "開始", nodeType: "start", responsible: "human", description: "", aiTech: [], difficulty: "easy", priority: "medium", notes: "", department: "", system: "", inputData: "", outputData: "", monthlyVolume: 0, manualTime: 0, autoTime: 0 } },
    { id: "node-1", type: "process", position: { x: 230, y: 350 },
      data: { label: "接收客戶詢問 Email", nodeType: "process", responsible: "ai", description: "系統自動接收並解析客戶信件，擷取主旨、內容與聯絡資訊", aiTech: ["Claude API", "Make.com"], difficulty: "easy", priority: "high", notes: "串接 Gmail API 自動觸發，AI 解析信件重點", department: "客服部", system: "Gmail / Outlook", inputData: "客戶 Email\n聯絡表單", outputData: "結構化信件資料\n客戶基本資訊", monthlyVolume: 200, manualTime: 5, autoTime: 0 } },
    { id: "node-2", type: "process", position: { x: 490, y: 350 },
      data: { label: "客服人員閱讀 Email", nodeType: "process", responsible: "hybrid", description: "AI 預先摘要信件並標注分類，客服人員確認後決定處理方向", aiTech: ["Claude API", "ChatGPT / GPT-4"], difficulty: "easy", priority: "high", notes: "AI 生成摘要與建議回覆，客服做最終確認", department: "客服部", system: "CRM / Gmail", inputData: "原始 Email 內容", outputData: "信件摘要\n初步分類", monthlyVolume: 200, manualTime: 8, autoTime: 2 } },
    { id: "node-decision", type: "decision", position: { x: 750, y: 320 },
      data: { label: "判斷問題類型", nodeType: "decision", responsible: "hybrid", description: "判斷客戶問題屬於：退貨、產品問題、還是報價需求", aiTech: ["ChatGPT / GPT-4", "Claude API"], difficulty: "medium", priority: "high", notes: "AI 分類準確率約 85-90%，低信心度需人工複核", department: "客服部", system: "AI 分類模型", inputData: "信件摘要\n分類標籤", outputData: "問題類型判斷", monthlyVolume: 0, manualTime: 0, autoTime: 0 } },
    { id: "node-3a", type: "process", position: { x: 960, y: 180 },
      data: { label: "退貨申請處理", nodeType: "process", responsible: "hybrid", description: "自動建立退貨申請單，通知倉庫確認退貨資格", aiTech: ["RPA / UiPath", "Python Script"], difficulty: "medium", priority: "high", notes: "退貨金額超過 NT$5000 需主管審核", department: "客服 / 倉管", system: "ERP 系統", inputData: "訂單編號\n退貨原因", outputData: "退貨單\n退款通知", monthlyVolume: 40, manualTime: 15, autoTime: 3 } },
    { id: "node-3b", type: "process", position: { x: 960, y: 350 },
      data: { label: "建立產品問題工單", nodeType: "process", responsible: "hybrid", description: "建立工單並指派技術支援人員處理", aiTech: ["RPA / UiPath"], difficulty: "medium", priority: "medium", notes: "自動指派對應產品線的技術支援人員", department: "技術支援", system: "ERP / Jira", inputData: "產品序號\n問題描述", outputData: "技術支援工單", monthlyVolume: 80, manualTime: 10, autoTime: 2 } },
    { id: "node-3c", type: "process", position: { x: 960, y: 520 },
      data: { label: "自動生成報價單", nodeType: "process", responsible: "ai", description: "根據客戶需求自動查詢產品目錄並生成報價單", aiTech: ["Claude API", "Python Script"], difficulty: "medium", priority: "medium", notes: "報價單自動發送業務確認後轉交客戶", department: "業務部", system: "ERP / 報價系統", inputData: "客戶需求\n產品目錄", outputData: "報價單 PDF", monthlyVolume: 80, manualTime: 20, autoTime: 1 } },
    { id: "node-4", type: "process", position: { x: 1220, y: 350 },
      data: { label: "在 ERP 建立工單/訂單", nodeType: "process", responsible: "hybrid", description: "RPA 自動將處理結果同步至 ERP，建立對應工單或訂單記錄", aiTech: ["RPA / UiPath", "Python Script"], difficulty: "medium", priority: "high", notes: "RPA 機器人自動填寫 ERP 表單，無需人工登打", department: "客服 / IT", system: "SAP / Odoo", inputData: "工單資料\n客戶資訊", outputData: "工單編號\nERP 訂單記錄", monthlyVolume: 200, manualTime: 12, autoTime: 1 } },
    { id: "node-5", type: "process", position: { x: 1480, y: 350 },
      data: { label: "通知物流部門安排後續", nodeType: "process", responsible: "ai", description: "自動發送通知給物流部門，安排取件、換貨或配送", aiTech: ["n8n", "Make.com", "Line Bot"], difficulty: "easy", priority: "medium", notes: "n8n 自動化同步發送 Email + Line 通知給物流負責人", department: "物流部", system: "n8n / Line Notify", inputData: "工單編號\n客戶地址", outputData: "物流通知\n預計處理時間", monthlyVolume: 200, manualTime: 5, autoTime: 0 } },
    { id: "node-end", type: "startEnd", position: { x: 1740, y: 350 },
      data: { label: "結束", nodeType: "end", responsible: "human", description: "", aiTech: [], difficulty: "easy", priority: "low", notes: "", department: "", system: "", inputData: "", outputData: "", monthlyVolume: 0, manualTime: 0, autoTime: 0 } },
  ],
  edges: [
    { id: "e-s-1", source: "node-start", target: "node-1", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-1-2", source: "node-1", target: "node-2", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-2-d", source: "node-2", target: "node-decision", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-d-3a", source: "node-decision", target: "node-3a", sourceHandle: "top", label: "退貨", style: { stroke: "#f97316", strokeWidth: 2 } },
    { id: "e-d-3b", source: "node-decision", target: "node-3b", sourceHandle: "right", label: "產品問題", style: { stroke: "#f97316", strokeWidth: 2 } },
    { id: "e-d-3c", source: "node-decision", target: "node-3c", sourceHandle: "bottom", label: "報價", style: { stroke: "#f97316", strokeWidth: 2 } },
    { id: "e-3a-4", source: "node-3a", target: "node-4", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-3b-4", source: "node-3b", target: "node-4", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-3c-4", source: "node-3c", target: "node-4", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-4-5", source: "node-4", target: "node-5", style: { stroke: "#64748b", strokeWidth: 2 } },
    { id: "e-5-e", source: "node-5", target: "node-end", style: { stroke: "#64748b", strokeWidth: 2 } },
  ],
}

async function callClaudeAPI(apiKey, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API 錯誤 (${response.status})`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 回應格式錯誤，請重試')

  return JSON.parse(jsonMatch[0])
}

const STEPS = ['描述流程', 'AI 分析中', '確認結果']

export default function AIGenerateModal({ onClose }) {
  const loadFromJSON = useFlowStore((s) => s.loadFromJSON)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || '')
  const [showApiKey, setShowApiKey] = useState(!localStorage.getItem(API_KEY_STORAGE))
  const [description, setDescription] = useState('')
  const [step, setStep] = useState(0) // 0=input, 1=loading, 2=preview
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!apiKey.trim()) { setError('請輸入 Anthropic API Key'); return }
    if (!description.trim()) { setError('請輸入流程描述'); return }

    setError('')
    setStep(1)
    try {
      localStorage.setItem(API_KEY_STORAGE, apiKey.trim())
      const data = await callClaudeAPI(apiKey.trim(), description)
      setResult(data)
      setStep(2)
    } catch (e) {
      setError(e.message)
      setStep(0)
    }
  }

  const handleApply = () => {
    loadFromJSON(result)
    onClose()
  }

  const handleLoadSample = () => {
    setResult(SAMPLE_DATA)
    setStep(2)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">AI 生成流程圖</h2>
              <p className="text-xs text-slate-400">用自然語言描述，AI 自動產出初版</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step === i ? 'bg-indigo-500 text-white' : step > i ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-400'}`}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === i ? 'text-indigo-600' : step > i ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 0: Input */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  描述你的業務流程 <span className="text-red-400">*</span>
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-slate-50 focus:bg-white transition-colors"
                  rows={7}
                  placeholder="例如：
業務收到客戶詢價後，先確認庫存，庫存不足需通知採購部門補貨。庫存充足則由業務人員手動填寫報價單（Excel）發給客戶，客戶回覆後登錄至 CRM 系統，若客戶同意報價則開立訂單，否則結束流程。"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-slate-400">{description.length} 字</span>
                </div>
              </div>

              {/* API Key */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowApiKey((v) => !v)}
                >
                  <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    🔑 Anthropic API Key {apiKey && !showApiKey ? '（已設定）' : ''}
                  </span>
                  <span className="text-amber-500 text-xs">{showApiKey ? '▲' : '▼'}</span>
                </button>
                {showApiKey && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="password"
                      className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="sk-ant-api03-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-[11px] text-amber-600">
                      Key 僅儲存在你的瀏覽器 localStorage，不會上傳到任何伺服器。
                      前往 <span className="font-mono">console.anthropic.com</span> 取得 API Key。
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Loading */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-700">AI 正在分析流程...</p>
                <p className="text-sm text-slate-400 mt-1">識別步驟、判斷自動化潛力、建議技術</p>
              </div>
              <div className="flex gap-2">
                {['分析流程步驟', '評估自動化', '建議技術棧', '生成流程圖'].map((t, i) => (
                  <span key={t} className="text-[11px] bg-indigo-50 text-indigo-500 px-2 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && result && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-emerald-500 text-lg">✅</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">分析完成！</p>
                  <p className="text-xs text-emerald-600">已生成 {result.nodes?.filter(n => n.type !== 'startEnd').length} 個流程步驟</p>
                </div>
              </div>

              {/* Preview list */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">專案：{result.projectName}</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {result.nodes?.filter(n => n.type !== 'startEnd').map((node) => {
                    const colors = { ai: 'text-emerald-600 bg-emerald-50', human: 'text-blue-600 bg-blue-50', hybrid: 'text-amber-600 bg-amber-50' }
                    const labels = { ai: '🤖 AI', human: '👤 人工', hybrid: '⚡ 混合' }
                    return (
                      <div key={node.id} className="flex items-start gap-3 px-4 py-2.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5 ${colors[node.data.responsible] || colors.human}`}>
                          {labels[node.data.responsible] || '👤 人工'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700">{node.data.label}</p>
                          {node.data.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{node.data.description}</p>}
                          {node.data.system && <p className="text-xs text-slate-400">系統：{node.data.system}</p>}
                          {node.data.aiTech?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {node.data.aiTech.map(t => (
                                <span key={t} className="text-[10px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">套用後可繼續在畫布上調整節點位置與屬性</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          {step === 0 && (
            <>
              <button onClick={onClose} className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button
                onClick={handleLoadSample}
                className="py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                📋 載入範例
              </button>
              <button
                onClick={handleGenerate}
                disabled={!description.trim() || !apiKey.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-bold hover:from-violet-600 hover:to-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✨ 開始 AI 分析
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                ← 重新描述
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
              >
                套用到畫布
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
