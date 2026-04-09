import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | EU TMS` : 'EU TMS'
  }, [title])
}
