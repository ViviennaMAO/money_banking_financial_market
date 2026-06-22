import { PropsWithChildren, useEffect } from 'react'
import { ensureConnected } from './utils/identity'
import './app.scss'

/** 已在本会话内触发过 connect → 不再重复 */
let _initOnce = false

function initLuffaIdentity() {
  if (_initOnce) return
  _initOnce = true

  // 延迟 1 秒,先让首屏渲染出来再弹钱包窗(更友好,不让用户一开屏就看到弹窗)
  setTimeout(() => {
    ensureConnected({
      network: 'mainnet',
      title: '货币金融学互动学习',
      desc: '使用 Luffa 钱包登录 · 用于身份验证 + 付费解锁'
    }).then(id => {
      if (id.address) {
        // eslint-disable-next-line no-console
        console.log('[luffa] connected:', id.address.slice(0, 8) + '...' + id.address.slice(-6))
      }
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.warn('[luffa] connect failed:', err)
    })
  }, 1000)
}

function App({ children }: PropsWithChildren<{}>) {
  // Taro 4:App 根组件挂载 = 应用冷启动(onLaunch 阶段)
  useEffect(() => {
    initLuffaIdentity()
  }, [])

  return children
}

export default App
