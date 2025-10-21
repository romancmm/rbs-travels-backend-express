import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

type AnyObj = Record<string, any>

function deepMerge(target: AnyObj, source: AnyObj): AnyObj {
 for (const key of Object.keys(source)) {
  const t = target[key]
  const s = source[key]
  if (t && Array.isArray(t) && Array.isArray(s)) {
   target[key] = Array.from(new Set([...t, ...s]))
  } else if (t && typeof t === 'object' && s && typeof s === 'object') {
   target[key] = deepMerge({ ...t }, s)
  } else {
   target[key] = s
  }
 }
 return target
}

function readYamlFiles(dir: string): AnyObj[] {
 const files: string[] = []
 const stack = [dir]
 while (stack.length) {
  const current = stack.pop()!
  const entries = fs.readdirSync(current, { withFileTypes: true })
  for (const e of entries) {
   const full = path.join(current, e.name)
   if (e.isDirectory()) stack.push(full)
   else if (e.isFile() && full.endsWith('.yaml')) files.push(full)
  }
 }
 return files.map((f) => YAML.parse(fs.readFileSync(f, 'utf8')) as AnyObj)
}

function buildOpenApiSpec(): AnyObj {
 const baseDir = path.resolve(process.cwd(), 'docs/openapi')
 const parts = readYamlFiles(baseDir)
 if (parts.length === 0) {
  // Fallback minimal spec so /docs still loads
  return {
   openapi: '3.1.0',
   info: { title: 'Travel Agency API', version: '1.0.0' },
   servers: [{ url: '/api/v1' }],
   paths: {},
  }
 }
 // Merge all yaml parts with a simple deep merge, concatenating paths/components
 return parts.reduce((acc, cur) => deepMerge(acc, cur), {
  openapi: '3.1.0',
  info: { title: 'Travel Agency API', version: '1.0.0' },
  servers: [{ url: '/api/v1' }],
  paths: {},
  components: {},
 } as AnyObj)
}

const swaggerSpec = buildOpenApiSpec()
export default swaggerSpec
