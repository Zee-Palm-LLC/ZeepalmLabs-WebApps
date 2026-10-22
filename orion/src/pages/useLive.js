import { useEffect, useState } from 'react'

// Steps through data snapshots on a timer while live updates are on.
export function useLiveIndex(count, running, every = 4200) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), every)
    return () => clearInterval(id)
  }, [count, running, every])
  return index
}
