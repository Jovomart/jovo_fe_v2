'use client'
import { useEffect, useState, useRef } from 'react'

interface TimeLeft {
  hours: string
  mins: string
  secs: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function getTarget() {
  const t = new Date()
  t.setHours(23, 59, 59, 0)
  if (new Date() >= t) t.setDate(t.getDate() + 1)
  return t
}

/** Counts down to the end of the day - flash-sale timer. */
export function useCountdown() {
  const targetRef = useRef<Date>(getTarget())
  const [time, setTime] = useState<TimeLeft>({ hours: '00', mins: '00', secs: '00' })

  useEffect(() => {
    const update = () => {
      const diff = targetRef.current.getTime() - Date.now()
      if (diff <= 0) {
        targetRef.current = getTarget()
        return
      }
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

export default useCountdown
