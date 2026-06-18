import { useState, useCallback, useEffect } from 'react'
import type { ComplianceDocument } from '../lib/supabase'
import { seedComplianceDocuments } from '../data/seed'
import { createAdapter } from '../services'
import { normalizeComplianceDocument, getComplianceStatus } from '../lib/tooltrack'

const adapter = createAdapter<ComplianceDocument>('tooltrack_compliance_documents', 'asset_documents', seedComplianceDocuments)

type ComplianceCreateInput = Omit<ComplianceDocument, 'id' | 'created_at' | 'updated_at' | 'status'>

export function useCompliance() {
  const [documents, setDocuments] = useState<ComplianceDocument[]>(() => {
    const stored = localStorage.getItem('tooltrack_compliance_documents')
    if (stored) return JSON.parse(stored)
    return seedComplianceDocuments
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    void adapter.getAll().then(items => setDocuments(items.map(normalizeComplianceDocument)))
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    const items = await adapter.getAll()
    setDocuments(items.map(normalizeComplianceDocument))
    setLoading(false)
  }, [])

  const create = useCallback(async (data: ComplianceCreateInput) => {
    setLoading(true)
    const now = new Date().toISOString()
    const created = await adapter.create({
      ...data,
      status: getComplianceStatus(data.expires_at),
      created_at: now,
      updated_at: now,
    })
    const normalized = normalizeComplianceDocument(created)
    setDocuments(prev => [...prev, normalized])
    setLoading(false)
    return normalized
  }, [])

  const update = useCallback(async (id: string, data: Partial<ComplianceDocument>) => {
    setLoading(true)
    const patch = { ...data, updated_at: new Date().toISOString() }
    if (data.expires_at) {
      patch.status = getComplianceStatus(data.expires_at)
    }
    const updated = await adapter.update(id, patch)
    const normalized = normalizeComplianceDocument(updated)
    setDocuments(prev => prev.map(item => item.id === id ? normalized : item))
    setLoading(false)
    return normalized
  }, [])

  const remove = useCallback(async (id: string) => {
    await adapter.remove(id)
    setDocuments(prev => prev.filter(item => item.id !== id))
  }, [])

  const stats = {
    total: documents.length,
    vigente: documents.filter(item => item.status === 'vigente').length,
    vencePronto: documents.filter(item => item.status === 'vence_pronto').length,
    vencido: documents.filter(item => item.status === 'vencido').length,
    ausente: documents.filter(item => item.status === 'ausente').length,
  }

  const expiringSoon = documents.filter(item => item.status === 'vence_pronto')
  const expired = documents.filter(item => item.status === 'vencido')

  return {
    documents,
    loading,
    stats,
    expiringSoon,
    expired,
    create,
    update,
    remove,
    refresh,
  }
}
