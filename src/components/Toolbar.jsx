import { useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useFlowStore from '../store/flowStore'
import { exportToPng, exportToJSON, readJSONFile } from '../utils/exportUtils'

export default function Toolbar({ flowRef, onOpenAIGenerate }) {
  const { projectName, setProjectName, addNode, clearCanvas, loadFromJSON, autoLayout, nodes, edges } = useFlowStore(
    useShallow((s) => ({
      projectName: s.projectName, setProjectName: s.setProjectName,
      addNode: s.addNode, clearCanvas: s.clearCanvas,
      loadFromJSON: s.loadFromJSON, autoLayout: s.autoLayout, nodes: s.nodes, edges: s.edges,
    }))
  )
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(projectName)
  const [exporting, setExporting] = useState(false)
  const [saved, setSaved] = useState(false)
  const nameRef = useRef()

  const handleNameSubmit = () => {
    setProjectName(nameVal)
    setEditingName(false)
    showSaved()
  }

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExportPng = async () => {
    if (!flowRef.current) return
    setExporting(true)
    await exportToPng(flowRef.current, projectName)
    setExporting(false)
  }

  const handleImport = async () => {
    try {
      const data = await readJSONFile()
      loadFromJSON(data)
    } catch (e) {
      alert('匯入失敗：' + e.message)
    }
  }

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-sm z-10 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <span className="text-sm font-bold text-slate-700 hidden sm:block">流程顧問</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Project Name */}
      {editingName ? (
        <input
          ref={nameRef}
          className="border border-indigo-300 rounded-lg px-2 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-40"
          value={nameVal}
          autoFocus
          onChange={(e) => setNameVal(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
        />
      ) : (
        <button
          className="text-sm font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 max-w-[180px] truncate"
          onClick={() => { setNameVal(projectName); setEditingName(true) }}
        >
          <span className="truncate">{projectName}</span>
          <span className="text-slate-400 text-xs flex-shrink-0">✏️</span>
        </button>
      )}

      {/* Saved indicator */}
      {saved && (
        <span className="text-xs text-emerald-500 font-medium animate-pulse">已儲存</span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI Generate */}
      <button
        onClick={onOpenAIGenerate}
        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-sm flex items-center gap-1.5"
      >
        ✨ AI 生成流程
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Add Node Buttons */}
      <span className="text-xs text-slate-400 hidden md:block">新增節點：</span>
      <button
        onClick={() => addNode('process')}
        className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
      >
        ＋ 流程步驟
      </button>
      <button
        onClick={() => addNode('decision')}
        className="px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition-colors"
      >
        ＋ 判斷節點
      </button>
      <button
        onClick={() => addNode('startEnd')}
        className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
      >
        ＋ 結束
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Auto Layout */}
      <button
        onClick={autoLayout}
        title="一鍵自動排版（左到右）"
        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
      >
        ⊞ 一鍵排版
      </button>

      {/* Import */}
      <button
        onClick={handleImport}
        title="匯入 JSON"
        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
      >
        📂 匯入
      </button>

      {/* Export JSON */}
      <button
        onClick={() => { exportToJSON(nodes, edges, projectName); showSaved() }}
        title="匯出 JSON（下次繼續編輯）"
        className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
      >
        💾 存檔
      </button>

      {/* Export PNG */}
      <button
        onClick={handleExportPng}
        disabled={exporting}
        title="匯出為 PNG 圖片"
        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {exporting ? '匯出中...' : '🖼️ 匯出圖片'}
      </button>

      {/* Clear */}
      <button
        onClick={() => {
          if (confirm('確定要清空畫布？此操作不可復原。')) clearCanvas()
        }}
        title="清空畫布"
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-colors"
      >
        🗑️
      </button>
    </div>
  )
}
