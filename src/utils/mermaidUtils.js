/**
 * Utility to convert React Flow nodes and edges to Mermaid graph TD format
 */
export const convertFlowToMermaid = (nodes, edges, projectName) => {
  let mermaidCode = `graph TD\n`
  
  // Style definitions
  mermaidCode += `  classDef ai fill:#f0fdf4,stroke:#10b981,stroke-width:2px,color:#065f46;\n`
  mermaidCode += `  classDef human fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af;\n`
  mermaidCode += `  classDef hybrid fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#92400e;\n`
  mermaidCode += `  classDef startEnd fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#334155;\n`
  mermaidCode += `  classDef system fill:#1e293b,stroke:#475569,stroke-width:2px,color:#f8fafc;\n`
  mermaidCode += `  classDef wait fill:#fffbeb,stroke:#fbbf24,stroke-width:2px,stroke-dasharray: 5 5,color:#92400e;\n`
  mermaidCode += `  classDef file fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46;\n`
  mermaidCode += `  classDef mail fill:#f0f9ff,stroke:#0ea5e9,stroke-width:2px,color:#0369a1;\n\n`

  // 1. Process Nodes
  nodes.forEach(node => {
    const id = node.id.replace(/[^a-zA-Z0-9]/g, '_')
    const label = node.data.label.replace(/"/g, "'")
    
    let nodeShape = `["${label}"]` // Default square
    
    if (node.type === 'decision') {
      nodeShape = `{"${label}"}` // Rhombus for decisions
    } else if (node.type === 'startEnd') {
      nodeShape = `(["${label}"])` // Rounded for start/end
    } else if (node.type === 'system') {
      nodeShape = `[("${label}")]` // Cylinder for systems
    } else if (node.type === 'file') {
      nodeShape = `[["${label}"]]` // Subroutine shape for files
    } else if (node.type === 'wait') {
      nodeShape = `> "${label}" ]` // Asymmetric shape for wait
    }
    
    mermaidCode += `  ${id}${nodeShape}\n`
    
    // Apply styling based on responsible or type
    if (node.type === 'startEnd') {
      mermaidCode += `  class ${id} startEnd\n`
    } else if (node.data.responsible === 'ai') {
      mermaidCode += `  class ${id} ai\n`
    } else if (node.data.responsible === 'human') {
      mermaidCode += `  class ${id} human\n`
    } else if (node.data.responsible === 'hybrid') {
      mermaidCode += `  class ${id} hybrid\n`
    } else if (node.type === 'system' || node.type === 'wait' || node.type === 'file' || node.type === 'mail') {
      mermaidCode += `  class ${id} ${node.type}\n`
    }
  })

  mermaidCode += `\n`

  // 2. Process Edges
  edges.forEach(edge => {
    const sourceId = edge.source.replace(/[^a-zA-Z0-9]/g, '_')
    const targetId = edge.target.replace(/[^a-zA-Z0-9]/g, '_')
    const label = edge.label ? `|"${edge.label}"| ` : ''
    
    let arrow = '-->'
    if (edge.isException) {
      arrow = '-.->' // Dashed for exceptions
    }
    
    mermaidCode += `  ${sourceId} ${arrow} ${label}${targetId}\n`
  })

  return mermaidCode
}

/**
 * Generates a template for sub-process based on node label
 */
export const generateSubProcessTemplate = (nodeLabel) => {
  return `graph LR
  Start([開始]) --> Action[進行 ${nodeLabel}]
  Action --> End([結束])
  
  classDef ai fill:#f0fdf4,stroke:#34d399,stroke-width:2px;
  classDef human fill:#eff6ff,stroke:#60a5fa,stroke-width:2px;
  classDef hybrid fill:#fffbeb,stroke:#fbbf24,stroke-width:2px;
  
  %% 根據需要手動調整 class Action ai`
}

/**
 * Parses a Mermaid graph TD/LR string into React Flow nodes and edges
 * Supporting basic node declarations and connections
 */
export const parseMermaidToFlow = (mermaidCode) => {
  const nodes = []
  const edges = []
  const nodeMap = new Map()
  
  const lines = mermaidCode.split('\n')
  
  // Basic Regex patterns
  // 1. Node pattern: id["Label"] or id("Label") or id{"Label"} or id
  const nodeRegex = /([a-zA-Z0-9_]+)(?:(\[|\{|\()(?:"|')?([^\]\n"}]+)(?:"|')?(\]|\}|\)))?/
  
  // 2. Connection pattern: id1 --> id2 or id1 --|Label|--> id2
  const edgeRegex = /([a-zA-Z0-9_]+)\s*(-{2,}>|\.-\.-?>)\s*(?:\|(?:"|')?([^|]+)(?:"|')?\|\s*)?([a-zA-Z0-9_]+)/

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('graph') || trimmed.startsWith('classDef') || trimmed.startsWith('class ')) return

    // Check for edges first as they contain node IDs
    const edgeMatch = trimmed.match(edgeRegex)
    if (edgeMatch) {
      const [, sourceId, arrow, label, targetId] = edgeMatch
      
      // Ensure nodes exist
      if (!nodeMap.has(sourceId)) {
        const newNode = createParsedNode(sourceId, sourceId)
        nodes.push(newNode)
        nodeMap.set(sourceId, newNode)
      }
      if (!nodeMap.has(targetId)) {
        const newNode = createParsedNode(targetId, targetId)
        nodes.push(newNode)
        nodeMap.set(targetId, newNode)
      }
      
      edges.push({
        id: `e-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        label: label || '',
        isException: arrow.includes('.'),
        style: arrow.includes('.') 
          ? { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6,3' }
          : { stroke: '#64748b', strokeWidth: 2 },
        animated: arrow.includes('.')
      })
      return
    }

    // Check for individual node declarations
    const nodeMatch = trimmed.match(nodeRegex)
    if (nodeMatch) {
      const [, id, shape, label] = nodeMatch
      const finalLabel = label || id
      
      if (nodeMap.has(id)) {
        // Update existing node data if label found
        const existingNode = nodeMap.get(id)
        existingNode.data.label = finalLabel
        if (shape === '{' || shape === '}') existingNode.type = 'decision'
        if (shape === '(' || shape === ')') {
          existingNode.type = 'startEnd'
          existingNode.data.nodeType = (finalLabel === '開始' || finalLabel === 'Start') ? 'start' : 'end'
        }
        if (shape === '[(') existingNode.type = 'system'
        if (shape === '[[') existingNode.type = 'file'
        if (shape === '>') existingNode.type = 'wait'
      } else {
        let type = 'process'
        if (shape === '{') type = 'decision'
        if (shape === '(') type = 'startEnd'
        if (shape === '[(') type = 'system'
        if (shape === '[[') type = 'file'
        if (shape === '>') type = 'wait'
        
        const newNode = createParsedNode(id, finalLabel, type)
        nodes.push(newNode)
        nodeMap.set(id, newNode)
      }
    }
  })

  return { nodes, edges }
}

const createParsedNode = (id, label, type = 'process') => {
  return {
    id,
    type,
    position: { x: 0, y: 0 }, // Auto layout will handle this later
    data: {
      label,
      nodeType: type === 'startEnd' ? (label === '開始' ? 'start' : 'end') : type,
      responsible: 'human',
      description: '',
      aiTech: [],
      difficulty: 'medium',
      priority: 'medium',
      notes: '',
      department: '',
      system: '',
      inputData: '',
      outputData: '',
      monthlyVolume: 0,
      manualTime: 0,
      autoTime: 0,
      mermaidCode: '',
    }
  }
}
