// Build plugin: publishes content-hashes.json, a truncated SHA-256 of every string
// literal in the built bundle. The tutor backend fetches it to confirm that text sent
// for read-aloud or tutoring is this app's own content, so the endpoints can't be used
// to voice arbitrary text. Keep normalizeText/hashText in sync with the backend's
// api/_shared.js copy.
import { createHash } from 'node:crypto'

export const normalizeText = s => String(s).replace(/\s+/g, ' ').trim()
export const hashText = s => createHash('sha256').update(normalizeText(s)).digest('hex').slice(0, 16)

export default function contentHashes() {
  return {
    name: 'content-hashes',
    apply: 'build',
    generateBundle(_, bundle) {
      const hashes = new Set()
      const add = s => { if (normalizeText(s).length >= 2) hashes.add(hashText(s)) }
      const walk = node => {
        if (Array.isArray(node)) return node.forEach(walk)
        if (!node || typeof node.type !== 'string') return
        if (node.type === 'Literal' && typeof node.value === 'string') add(node.value)
        else if (node.type === 'TemplateElement') add(node.value.cooked ?? node.value.raw)
        for (const k in node) if (node[k] && typeof node[k] === 'object') walk(node[k])
      }
      for (const chunk of Object.values(bundle)) if (chunk.type === 'chunk') walk(this.parse(chunk.code))
      this.emitFile({ type: 'asset', fileName: 'content-hashes.json', source: JSON.stringify({ v: 1, hashes: [...hashes].sort() }) })
    },
  }
}
