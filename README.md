# AI 流程自動化顧問工具

> 一款為 AI 導入顧問設計的互動式流程圖工具，幫助客戶快速視覺化、評估與規劃業務流程的自動化潛力。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)

---

## ✨ 功能特色

### 🤖 AI 一鍵生成流程
- 輸入自然語言描述（支援中文），呼叫 Claude API 自動產生完整流程圖
- 自動識別每個步驟的自動化類型：**AI 自動化 / AI 輔助 / 人工**
- 自動推薦合適的 AI 工具（Claude API、RPA/UiPath、n8n、Make.com 等）

### 🗺️ 互動式流程圖編輯
- 拖曳節點、連線自由編輯
- 支援三種節點類型：**開始/結束**、**流程步驟**、**判斷節點**
- 點擊連線可標記為**例外路徑**（紅色虛線）
- 一鍵自動排版（左→右水平佈局）

### 📊 ROI 即時估算
- 每個步驟填入：月執行量、人工耗時、自動化後耗時
- 底部面板即時顯示 **每月可節省小時數**
- 協助顧問向客戶展示自動化的投資回報

### 🎯 自動化評估儀表板
- 整體可自動化比例（百分比）
- AI 自動化 / AI 輔助 / 人工 步驟數量分佈
- 視覺化圓餅圖

### 🛠️ 節點屬性編輯
- 步驟名稱、描述、負責部門
- 執行系統、輸入/輸出資料
- 難度、優先度、技術備註
- AI 技術標籤

### 📤 匯出功能
- 儲存流程（localStorage 自動持久化）
- 匯出為 PNG 圖片
- 匯入/匯出 JSON 流程檔案

---

## 🛠️ 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| Vite | 7 | 建置工具 |
| TailwindCSS | 4 | 樣式框架 |
| @xyflow/react | 12 | 流程圖引擎 |
| Zustand | 5 | 狀態管理 |
| html-to-image | 1.11 | PNG 匯出 |
| Claude API | claude-opus-4-6 | AI 流程生成 |

---

## 🚀 快速開始

### 環境需求
- Node.js 18+
- npm 9+

### 安裝

```bash
# Clone 專案
git clone https://github.com/chengwesley/ai-workflow-consultant.git
cd ai-workflow-consultant

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器訪問 `http://localhost:5173`

### 設定 API Key

本工具需要 Anthropic API Key 才能使用 AI 生成功能：

1. 前往 [Anthropic Console](https://console.anthropic.com/) 取得 API Key
2. 點擊工具列右側的 **API Key** 按鈕
3. 輸入並儲存 Key（僅存於本機 localStorage，不會上傳）

> ⚠️ 若無 API Key，可使用「📋 載入範例」功能體驗所有功能

---

## 📖 使用指南

### 方法一：AI 生成流程
1. 點擊工具列的「✨ AI 生成流程」
2. 描述你的業務流程（例如：「我們的訂單處理流程包含收單、審核、備貨、出貨、通知客戶」）
3. 點擊「開始分析」，等待 AI 生成
4. 預覽結果後點擊「套用到畫布」

### 方法二：手動建立
1. 使用工具列的「+ 流程步驟」、「判斷節點」、「+ 結束」新增節點
2. 拖曳節點連線
3. 點擊節點開啟右側屬性面板進行編輯

### 評估流程自動化潛力
- 在每個節點的「⏱ 工作量估算」填入月執行量與耗時
- 底部面板自動計算整體 ROI
- 點擊連線可標記例外/錯誤路徑（紅色虛線）

---

## 🏗️ 專案結構

```
src/
├── components/
│   ├── nodes/
│   │   ├── ProcessNode.jsx      # 流程步驟節點
│   │   ├── DecisionNode.jsx     # 判斷節點
│   │   └── StartEndNode.jsx     # 開始/結束節點
│   ├── FlowEditor.jsx           # 主要流程圖編輯器
│   ├── NodePanel.jsx            # 節點屬性 + 連線面板
│   ├── AssessmentPanel.jsx      # 底部評估儀表板
│   ├── Toolbar.jsx              # 頂部工具列
│   └── AIGenerateModal.jsx      # AI 生成模態框
└── store/
    └── flowStore.js             # Zustand 全域狀態
```

---

## ☁️ 部署到 Vercel

```bash
# 建置
npm run build

# 使用 Vercel CLI
npm i -g vercel
vercel
```

或直接在 [Vercel](https://vercel.com) 匯入此 GitHub 倉庫，自動偵測 Vite 框架並完成部署。

---

## 📝 License

MIT © 2026 chengwesley
