import { useEffect, useState } from 'react'

export const routes = {
  '/': 'globe',
  '/network': 'network',
  '/roadmap': 'roadmap',
  '/sales': 'sales',
}

export function navigate(path) {
  if (path === location.pathname) return
  history.pushState(null, '', path + location.search)
  window.dispatchEvent(new Event('orion:navigate'))
}

export function usePath() {
  const [path, setPath] = useState(location.pathname in routes ? location.pathname : '/')
  useEffect(() => {
    const update = () => setPath(location.pathname in routes ? location.pathname : '/')
    window.addEventListener('popstate', update)
    window.addEventListener('orion:navigate', update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener('orion:navigate', update)
    }
  }, [])
  return path
}
