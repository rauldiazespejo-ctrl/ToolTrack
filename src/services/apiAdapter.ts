import type { ApiService } from './api'

type TokenProvider = () => Promise<string | null>

let tokenProvider: TokenProvider | null = null
export function setAuthTokenProvider(fn: TokenProvider) {
  tokenProvider = fn
}

const BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8787'

function toCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase())
}
function toSnake(key: string): string {
  return key.replace(/([A-Z])/g, (_m, c: string) => '_' + c.toLowerCase())
}
function mapKeys(obj: object, fn: (k: string) => string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) out[fn(k)] = v
  return out
}

async function authHeaders(): Promise<Record<string, string>> {
  if (!tokenProvider) return {}
  const token = await tokenProvider()
  return token ? { Authorization: 'Bearer ' + token } : {}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authHeaders()),
    ...(init.headers as Record<string, string> | undefined),
  }
  const res = await fetch(BASE_URL + path, { ...init, headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error('API ' + (init.method || 'GET') + ' ' + path + ' -> ' + res.status + ': ' + body)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export class ApiAdapter<T extends { id: string }> implements ApiService<T> {
  private resource: string

  constructor(resource: string) {
    this.resource = resource
  }

  async getAll(): Promise<T[]> {
    const rows = await request<Record<string, unknown>[]>('/api/' + this.resource)
    return rows.map(r => mapKeys(r, toSnake)) as T[]
  }

  async getById(id: string): Promise<T | null> {
    try {
      const row = await request<Record<string, unknown>>('/api/' + this.resource + '/' + id)
      return mapKeys(row, toSnake) as T
    } catch (e) {
      if ((e as Error).message.includes('404')) return null
      throw e
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const payload = mapKeys(data, toCamel)
    const row = await request<Record<string, unknown>>('/api/' + this.resource, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapKeys(row, toSnake) as T
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const payload = mapKeys(data, toCamel)
    const row = await request<Record<string, unknown>>('/api/' + this.resource + '/' + id, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return mapKeys(row, toSnake) as T
  }

  async remove(id: string): Promise<void> {
    await request<{ ok: true }>('/api/' + this.resource + '/' + id, { method: 'DELETE' })
  }
}
