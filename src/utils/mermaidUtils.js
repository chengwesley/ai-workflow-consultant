/**
 * Utility to convert React Flow nodes and edges to Mermaid graph TD format
 */
export const convertFlowToMermaid = (nodes, edges, projectName) => {
  let mermaidCode = `graph TD\n`
  
  // Style definitions
  mermaidCode += `  classDef ai fill:#f0fdf4,stroke:#10b981,stroke-width:2px,color:#065f46;\n`
  mermaidCode += `  classDef human fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e40af;\n`
  mermaidCode += `  classDef hybrid fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#92400e;\n`
  mermaidCode += `  classDef startEnd fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#334155;\n\n`

  // 1. Process Nodes
  nodes.forEach(node => {
    const id = node.id.replace(/[^a-zA-Z0-9]/g, '_')
    const label = node.data.label.replace(/"/g, "'")
    
    let nodeShape = `["${label}"]` // Default square
    
    if (node.type === 'decision') {
      nodeShape = `{"${label}"}` // Rhombus for decisions
    } else if (node.type === 'startEnd') {
      nodeShape = `(["${label}"])` // Rounded for start/end
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
