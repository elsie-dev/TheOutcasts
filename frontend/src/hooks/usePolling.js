import { useEffect, useRef } from 'react'

/**
 * Call `fn` immediately and then every `intervalMs`.
 * Stops when the component unmounts.
 */
export function usePolling(fn, intervalMs = 2000) {
  const savedFn = useRef(fn)

  useEffect(() => {
    savedFn.current = fn
  }, [fn])

  useEffect(() => {
    let active = true

    async function tick() {
      if (active) {
        await savedFn.current()
      }
    }

    tick()
    const id = setInterval(tick, intervalMs)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [intervalMs])
}
