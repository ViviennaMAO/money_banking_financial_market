import { PropsWithChildren, useEffect } from 'react'
import { ensureConnected } from './utils/identity'
import { bridgeAvailable } from './utils/luffa-bridge'
import './app.scss'

/** 已在本会话内触发过 connect → 不再重复 */
let _initOnce = false

/**
 * 安全地触发 Luffa 钱包连接 — 任何错误都不允许传播到 App 根。
 * 设计目标:即使 Luffa 平台 publib 自身有 bug,小程序也必须能继续运行。
 */
function initLuffaIdentitySafe() {
  if (_initOnce) return
  _initOnce = true

  // 延迟 3 秒,让首屏完全渲染、用户开始浏览后再请求(更友好,且躲开冷启动期 publib 不稳定)
  setTimeout(() => {
    try {
      if (!bridgeAvailable()) return

      // 这里用 Promise.resolve(...).catch 而不是 async/await,确保不会抛同步错
      Promise.resolve()
        .then(() => ensureConnected({ network: 'mainnet' }))
        .then(id => {
          if (id && id.address) {
            // eslint-disable-next-line no-console
            console.log('[luffa] connected:', id.address.slice(0, 8) + '...' + id.address.slice(-6))
          }
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.warn('[luffa] connect failed (non-fatal):', err)
        })
    } catch (err) {
      // 兜底:任何同步异常都吞掉
      // eslint-disable-next-line no-console
      console.warn('[luffa] init exception (non-fatal):', err)
    }
  }, 3000)
}

function App({ children }: PropsWithChildren<{}>) {
  useEffect(() => {
    initLuffaIdentitySafe()
  }, [])

  return children
}

export default App
