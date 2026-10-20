import { useEffect, useState } from 'react'

/**
 * 本地时钟：每秒更新，返回当前时间（供状态栏等组件复用）。
 * 格式化为展示字符串由调用方决定。
 */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return now
}
