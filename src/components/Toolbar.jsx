import { useRef, useState, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useFlowStore from '../store/flowStore'
import { exportToPng, exportToJSON, readJSONFile } from '../utils/exportUtils'
import { convertFlowToMermaid, parseMermaidToFlow } from '../utils/mermaidUtils'

export default function Toolbar({ flowRef, onOpenAIGenerate }) {
  const {
    projectName, setProjectName,
    addNode, clearCanvas,
    loadFromJSON, importMermaidData,
    autoLayout, nodes, edges,
    undo, redo, historyIndex, historyLen,
    toggleSearch,
    snapshots, saveSnapshot, restoreSnapshot, deleteSnapshot,
  } = useFlowStore(
    useShallow((s) => ({
      projectName: s.projectName, setProjectName: s.setProjectName,
      addNode: s.addNode, clearCanvas: s.clearCanvas,
      loadFromJSON: s.loadFromJSON, importMermaidData: s.importMermaidData,
      autoLayout: s.autoLayout, nodes: s.nodes, edges: s.edges,
      undo: s.undo, redo: s.redo,
      historyIndex: s.historyIndex,
      historyLen: s.history.length,
      toggleSearch: s.toggleSearch,
      snapshots: s.snapshots,
      saveSnapshot: s.saveSnapshot,
      restoreSnapshot: s.restoreSnapshot,
      deleteSnapshot: s.deleteSnapshot,
    }))
  )

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyLen - 1

  const [editingName, setEditingName]       = useState(false)
  const [nameVal, setNameVal]               = useState(projectName)
  const [exporting, setExporting]           = useState(false)
  const [saved, setSaved]                   = useState(false)
  const [mermaidModal, setMermaidModal]     = useState(false)
  const [mermaidInput, setMermaidInput]     = useState('')
  const [snapshotModal, setSnapshotModal]   = useState(false)
  const [snapshotName, setSnapshotName]     = useState('')
  const nameRef = useRef()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'
      if (isInput) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault(); toggleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, toggleSearch])

  const handleNameSubmit = () => { setProjectName(nameVal); setEditingName(false); showSaved() }
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const handleExportPng = async () => {
    if (!flowRef.current) return
    setExporting(true)
    await exportToPng(flowRef.current, projectName)
    setExporting(false)
  }

  const handleImport = async () => {
    try { const data = await readJSONFile(); loadFromJSON(data) }
    catch (e) { alert('匯入失敗：' + e.message) }
  }

  const handleExportMermaid = () => {
    const code = convertFlowToMermaid(nodes, edges, projectName)
    navigator.clipboard.writeText(code)
      .then(() => alert('已複製 Mermaid 語法到剪貼簿！'))
      .catch(() => { console.log(code); alert('複製失敗，語法已輸出到 console。') })
  }

  const handleDoImportMermaid = () => {
    if (!mermaidInput.trim()) return
    try {
      const { nodes: n, edges: e } = parseMermaidToFlow(mermaidInput)
      if (n.length === 0) { alert('未能識別有效的 Mermaid 節點。請確認語法。'); return }
      importMermaidData({ nodes: n, edges: e })
      alert(`成功匯入 ${n.length} 個節點與 ${e.length} 條連線！`)
      setMermaidModal(false); setMermaidInput('')
    } catch (e) { alert('匯入失敗：' + e.message) }
  }

  const handleSaveSnapshot = () => {
    saveSnapshot(snapshotName.trim() || undefined)
    setSnapshotName('')
  }

  return (
    <>
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shadow-sm z-10 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <span className="text-sm font-bold text-slate-700 hidden sm:block">流程顧問</span>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Project Name */}
        {editingName ? (
          <input ref={nameRef} className="border border-indigo-300 rounded-lg px-2 py-1 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-40" value={nameVal} autoFocus onChange={(e) => setNameVal(e.target.value)} onBlur={handleNameSubmit} onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()} />
        ) : (
          <button className="text-sm font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 max-w-[180px] truncate" onClick={() => { setNameVal(projectName); setEditingName(true) }}>
            <span className="truncate">{projectName}</span>
            <span className="text-slate-400 text-xs flex-shrink-0">✏️</span>
          </button>
        )}
        {saved && <span className="text-xs text-emerald-500 font-medium animate-pulse">已儲存</span>}

        <div className="flex-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} title="復原 (Ctrl+Z)" className="p-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">↩</button>
          <button onClick={redo} disabled={!canRedo} title="重做 (Ctrl+Y)" className="p-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">↪</button>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* AI Generate */}
        <button onClick={onOpenAIGenerate} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-sm flex items-center gap-1.5">
          ✨ AI 生成流程
        </button>

        <div className="w-px h-6 bg-slate-200" />

        {/* Add Node Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mr-1 hidden lg:block">Add Node:</span>
          <button onClick={() => addNode('process')}  className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all flex items-center gap-1"><span>🟦</span><span className="hidden xl:inline">步驟</span></button>
          <button onClick={() => addNode('decision')} className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-all flex items-center gap-1"><span>🔶</span><span className="hidden xl:inline">判斷</span></button>

          <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200 ml-1">
            <button onClick={() => addNode('system')} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-xs transition-all" title="新增系統節點">🖥️</button>
            <button onClick={() => addNode('wait')}   className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-xs transition-all" title="新增等待節點">⏳</button>
            <button onClick={() => addNode('file')}   className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-xs transition-all" title="新增資料/文件節點">📄</button>
            <button onClick={() => addNode('mail')}   className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-xs transition-all" title="新增郵件/通知節點">✉️</button>
            <button onClick={() => addNode('note')}   className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-xs transition-all" title="新增便利貼">📝</button>
          </div>

          <button onClick={() => addNode('startEnd')} className="px-2.5 py-1.5 rounded-lg bg-gray-100 border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all ml-1"><span>⚪</span><span className="hidden xl:inline"> 結束</span></button>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        {/* Search */}
        <button onClick={toggleSearch} title="搜尋節點 (Ctrl+F)" className="p-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm hover:bg-slate-100 transition-colors">🔍</button>

        {/* Auto Layout */}
        <button onClick={autoLayout} title="一鍵自動排版（左到右）" className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors">⊞ 排版</button>

        {/* Snapshots */}
        <button onClick={() => setSnapshotModal(true)} title="版本快照" className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors flex items-center gap-1">
          📸 <span className="hidden lg:inline">快照</span>
          {snapshots.length > 0 && <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 rounded-full">{snapshots.length}</span>}
        </button>

        {/* Import JSON */}
        <button onClick={handleImport} title="匯入 JSON" className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors">📂 匯入</button>

        {/* Import Mermaid */}
        <button onClick={() => setMermaidModal(true)} title="從 Mermaid 語法匯入" className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-indigo-600 text-xs font-semibold hover:bg-slate-100 transition-colors">📥 Mermaid</button>

        {/* Export JSON */}
        <button onClick={() => { exportToJSON(nodes, edges, projectName); showSaved() }} title="匯出 JSON" className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors">💾 存檔</button>

        {/* Export Mermaid */}
        <button onClick={handleExportMermaid} title="複製 Mermaid 語法" className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors">🔗 Mermaid</button>

        {/* Export PNG */}
        <button onClick={handleExportPng} disabled={exporting} title="匯出為 PNG" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {exporting ? '匯出中...' : '🖼️ PNG'}
        </button>

        {/* Clear */}
        <button onClick={() => { if (confirm('確定要清空畫布？可用 Ctrl+Z 復原。')) clearCanvas() }} title="清空畫布" className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-400 transition-colors">🗑️</button>
      </div>

      {/* ── Mermaid Import Modal ──────────────────────────────────────── */}
      {mermaidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={(e) => e.key === 'Escape' && setMermaidModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[640px] max-h-[80vh] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">匯入 Mermaid 語法</h3>
              <button onClick={() => setMermaidModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              支援 <code className="bg-slate-100 px-1 rounded">graph TD/LR</code>、節點形狀、邊框標籤、<code className="bg-slate-100 px-1 rounded">:::類別</code>。
              保留字（<code className="bg-slate-100 px-1 rounded">End</code>、<code className="bg-slate-100 px-1 rounded">Start</code>）會自動重命名。
            </p>
            <textarea
              className="flex-1 min-h-[280px] border border-slate-200 rounded-lg p-3 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
              placeholder={`graph TD\n    FlowStart((開始)):::startEnd --> Step1["處理步驟"]:::process\n    Step1 --> Decision{"判斷"}:::decision\n    Decision -- "是" --> Step2["下一步"]:::process\n    Decision -- "否" --> FlowEnd((結束)):::startEnd`}
              value={mermaidInput}
              onChange={(e) => setMermaidInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setMermaidModal(false); setMermaidInput('') }} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors">取消</button>
              <button onClick={handleDoImportMermaid} disabled={!mermaidInput.trim()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40">匯入</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Snapshot Modal ────────────────────────────────────────────── */}
      {snapshotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onKeyDown={(e) => e.key === 'Escape' && setSnapshotModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[480px] max-h-[80vh] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">📸 版本快照</h3>
              <button onClick={() => setSnapshotModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>

            {/* Save new snapshot */}
            <div className="flex gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <input
                className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                placeholder="快照名稱（選填）"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSnapshot()}
              />
              <button onClick={handleSaveSnapshot} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap">
                儲存目前版本
              </button>
            </div>

            {/* Snapshot list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">尚無快照。儲存快照後可隨時還原。</div>
              ) : (
                [...snapshots].reverse().map((snap) => (
                  <div key={snap.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white group">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{snap.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(snap.timestamp).toLocaleString('zh-TW')} · {snap.nodes.length} 個節點
                      </div>
                    </div>
                    <button
                      onClick={() => { if (confirm(`還原到「${snap.name}」？目前狀態會存入 Undo 紀錄。`)) { restoreSnapshot(snap.id); setSnapshotModal(false) } }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-xs font-medium text-slate-600 transition-colors whitespace-nowrap"
                    >
                      還原
                    </button>
                    <button
                      onClick={() => { if (confirm(`刪除快照「${snap.name}」？`)) deleteSnapshot(snap.id) }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-[11px] text-slate-400">還原快照不會影響快照列表，目前狀態可透過 Ctrl+Z 復原。</p>
          </div>
        </div>
      )}
    </>
  )
}
