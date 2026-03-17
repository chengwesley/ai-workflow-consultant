import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

// Initialize mermaid with basic theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#ffffff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#cbd5e1',
    lineColor: '#64748b',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#f1f5f9',
    
    // Node overrides for different roles
    // These can be used in the mermaid code via classDef
  },
  securityLevel: 'loose',
})

// Define CSS classes for node types that can be injected into mermaid code
const MERMAID_STYLES = `
  classDef ai fill:#f0fdf4,stroke:#34d399,stroke-width:2px;
  classDef human fill:#eff6ff,stroke:#60a5fa,stroke-width:2px;
  classDef hybrid fill:#fffbeb,stroke:#fbbf24,stroke-width:2px;
  classDef default fill:#ffffff,stroke:#cbd5e1,stroke-width:1px;
`

export default function MermaidRenderer({ chartCode, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !chartCode) return

    const renderChart = async () => {
      try {
        // Clear previous content
        containerRef.current.innerHTML = ''
        
        // Append styles and code
        const fullCode = `${chartCode}\n${MERMAID_STYLES}`
        
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        const { svg } = await mermaid.render(id, fullCode)
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          
          // Fix SVG dimensions for scaling
          const svgElement = containerRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.maxWidth = '100%'
            svgElement.style.height = 'auto'
          }
        }
      } catch (error) {
        console.error('Mermaid render error:', error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-[10px] text-red-400 p-2 border border-red-100 rounded">圖表語法錯誤</div>`
        }
      }
    }

    renderChart()
  }, [chartCode])

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-container flex justify-center items-center overflow-hidden ${className}`}
    />
  )
}
