import { createContext, useState, type ReactNode } from 'react'

type SearchContextValue = {
  query: string
  setQuery: (q: string) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  )
}
