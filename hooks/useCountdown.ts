'use client'
import { useEffect, useState } from 'react'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTarget() {
  const t = new Date()
  t.setHours(23, 59, 59, 0)
  if (new Date() >= t) t.setDate(t.getDate() + 1)
  return t
}

export function useCountdown() {
  const [time, setTime] = useState({ hours: '00', mins: '00', secs: '00' })

  useEffect(() => {
    const target = getTarget()
    const update = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) { setTime({ hours: '00', mins: '00', secs: '00' }); return }
      setTime({
        hours: pad(Math.floor(diff / 3600000)),
        mins: pad(Math.floor((diff % 3600000) / 60000)),
        secs: pad(Math.floor((diff % 60000) / 1000)),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
