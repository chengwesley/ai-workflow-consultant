import { toPng } from 'html-to-image'

export async function exportToPng(element, filename = 'flow-diagram') {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#f8fafc',
      pixelRatio: 2,
      filter: (node) => {
        // Exclude controls and minimap from export
        if (node.classList) {
          if (
            node.classList.contains('react-flow__controls') ||
            node.classList.contains('react-flow__minimap') ||
            node.classList.contains('react-flow__panel')
          ) {
            return false
          }
        }
        return true
      },
    })
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
    return true
  } catch (e) {
    console.error('Export PNG failed', e)
    return false
  }
}

export function exportToJSON(nodes, edges, projectName) {
  const data = JSON.stringify({ nodes, edges, projectName, exportedAt: new Date().toISOString() }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${projectName || 'flow'}.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

export function readJSONFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return reject(new Error('No file selected'))
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          resolve(JSON.parse(ev.target.result))
        } catch {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.readAsText(file)
    }
    input.click()
  })
}
