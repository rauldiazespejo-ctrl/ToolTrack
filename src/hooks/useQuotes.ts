import { useState, useCallback, useEffect } from 'react'
import type { QuoteRequest } from '../lib/supabase'
import { seedQuoteRequests } from '../data/seed'
import { createAdapter } from '../services'
import { buildQuoteCode } from '../lib/tooltrack'

const adapter = createAdapter<QuoteRequest>('tooltrack_quote_requests', 'quote_requests', seedQuoteRequests)

type QuoteCreateInput = Omit<QuoteRequest, 'id' | 'quote_code' | 'created_at' | 'updated_at'>

export function useQuotes() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>(() => {
    const stored = localStorage.getItem('tooltrack_quote_requests')
    if (stored) return JSON.parse(stored)
    return seedQuoteRequests
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void adapter.getAll().then(setQuotes)
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setQuotes(items)
    setLoading(false)
  }, [])

  const create = useCallback(async (data: QuoteCreateInput) => {
    setLoading(true)
    const now = new Date().toISOString()
    const created = await adapter.create({
      ...data,
      quote_code: buildQuoteCode(),
      status: data.status || 'pending_quote',
      supplier_name: data.supplier_name ?? null,
      estimated_cost: data.estimated_cost ?? null,
      created_at: now,
      updated_at: now,
    })
    setQuotes(prev => [...prev, created])
    setLoading(false)
    return created
  }, [])

  const update = useCallback(async (id: string, data: Partial<QuoteRequest>) => {
    setLoading(true)
    const updated = await adapter.update(id, { ...data, updated_at: new Date().toISOString() })
    setQuotes(prev => prev.map(item => item.id === id ? updated : item))
    setLoading(false)
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setQuotes(prev => prev.filter(item => item.id !== id))
  }, [])

  const stats = {
    total: quotes.length,
    pendingQuote: quotes.filter(item => item.status === 'pending_quote').length,
    quoted: quotes.filter(item => item.status === 'quoted').length,
    purchaseApproved: quotes.filter(item => item.status === 'purchase_approved').length,
    purchased: quotes.filter(item => item.status === 'purchased').length,
    received: quotes.filter(item => item.status === 'received').length,
    cancelled: quotes.filter(item => item.status === 'cancelled').length,
  }

  return { quotes, loading, stats, create, update, remove, refresh }
}
