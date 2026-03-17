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
  const classAssignments = []
  
  // Clean up code: remove <br/>
  let cleanCode = mermaidCode.replace(/<br\s*\/?>/gi, ' ')
  
  const lines = cleanCode.split('\n')
  
  // First Pass: Nodes and Edges
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('graph') || trimmed.startsWith('direction') || trimmed.startsWith('classDef')) return
    if (trimmed.startsWith('%%')) return

    // Collect class assignments for the second pass
    if (trimmed.startsWith('class ')) {
      classAssignments.push(trimmed)
      return
    }

    // Handle connections
    // Arrow regex: --> or -.-> or ==> or any combination of -, =, . ending in >
    const connectionRegex = /^(.+?)\s*([-=\.]+>)\s*(?:\|([^|]+)\|)?\s*(.+)$/
    const connMatch = trimmed.match(connectionRegex)
    
    if (connMatch) {
      const [, sourcePart, arrow, pipeLabel, targetPart] = connMatch
      const sourceNode = parseNodeFromPart(sourcePart, nodeMap, nodes)
      const targetNode = parseNodeFromPart(targetPart, nodeMap, nodes)
      
      if (sourceNode && targetNode) {
        let label = pipeLabel || ''
        label = label.trim().replace(/^["']|["']$/g, '').trim().replace(/^["']|["']$/g, '').trim()
        
        const isException = arrow && arrow.includes('.')

        edges.push({
          id: `e-${sourceNode.id}-${targetNode.id}-${Math.random().toString(36).substr(2, 9)}`,
          source: sourceNode.id,
          target: targetNode.id,
          type: 'step',
          label: label,
          isException: isException,
          style: isException 
            ? { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6,3' }
            : { stroke: '#94a3b8', strokeWidth: 2 },
          animated: isException,
          markerEnd: {
            type: 'arrowclosed',
            color: isException ? '#ef4444' : '#94a3b8',
          }
        })
      }
      return
    }

    // Handle standalone node declarations
    parseNodeFromPart(trimmed, nodeMap, nodes)
  })

  // Second Pass: Apply Classes
  classAssignments.forEach(assignment => {
    const parts = assignment.split(/\s+/)
    if (parts.length >= 3) {
      const nodeId = parts[1]
      const className = parts[2]
      const node = nodeMap.get(nodeId)
      if (node) {
        if (['ai', 'human', 'hybrid'].includes(className)) {
          node.data.responsible = className
        } else if (['system', 'wait', 'file', 'mail', 'startEnd'].includes(className)) {
          node.type = className
        }
      }
    }
  })

  return { nodes, edges }
}

/**
 * Helper to identify and create/update a node from a string part like "id((Label))"
 */
const parseNodeFromPart = (part, nodeMap, nodes) => {
  const trimmedPart = part.trim()
  // Pattern: id or id[...] or id(...) or id((...)) or id{...} or id[[...]] or id>...] etc
  // We first try to split the ID from the shape
  const idMatch = trimmedPart.match(/^([a-zA-Z0-9_]+)/)
  if (!idMatch) return null
  
  const id = idMatch[1]
  const rest = trimmedPart.substring(id.length).trim()
  
  let label = null
  let shapeOpen = null
  
  if (rest) {
    // Look for shape brackets and content inside
    const shapeMatch = rest.match(/^([\(\[\{>]{1,2})(.*?)([\)\}\]]{1,2})$/)
    if (shapeMatch) {
      shapeOpen = shapeMatch[1]
      label = shapeMatch[2].trim()
      // Strip quotes if present
      label = label.replace(/^["']|["']$/g, '').trim()
    }
  }
  
  const finalLabel = label || id
  
  if (nodeMap.has(id)) {
    const existingNode = nodeMap.get(id)
    if (label) existingNode.data.label = finalLabel
    updateTypeFromShape(existingNode, shapeOpen, finalLabel)
    return existingNode
  } else {
    const newNode = createParsedNode(id, finalLabel, 'process')
    updateTypeFromShape(newNode, shapeOpen, finalLabel)
    nodes.push(newNode)
    nodeMap.set(id, newNode)
    return newNode
  }
}

const updateTypeFromShape = (node, shape, label) => {
  if (!shape) return
  
  if (shape === '{') {
    node.type = 'decision'
  } else if (shape.startsWith('(')) {
    node.type = 'startEnd'
    const isStartLabel = label === '開始' || label.toLowerCase().includes('start') || label.toLowerCase().includes('發起')
    node.data.nodeType = isStartLabel ? 'start' : 'end'
  } else if (shape === '[(') {
    node.type = 'system'
  } else if (shape === '[[') {
    node.type = 'file'
  } else if (shape === '>') {
    node.type = 'wait'
  }
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
