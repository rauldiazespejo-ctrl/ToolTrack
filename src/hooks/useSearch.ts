import { useContext } from 'react'
import { SearchContext } from '../context/SearchContext'

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}
