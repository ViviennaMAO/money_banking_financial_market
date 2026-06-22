import { PropsWithChildren, useEffect } from 'react'
import './app.scss'

declare const wx: any

/**
 * 应用启动时调用 Luffa 钱包 connect(审核硬性要求)
 *
 * 防御策略:
 *   1. 完全 inline,不 import 任何 utils — 排除模块加载时崩
 *   2. 双层 try/catch:setTimeout 外层 + 内部回调
 *   3. 最简参数 — 只传 { methodName, network }(去掉 uuid / metadata
 *      / 中文字符串,这些被怀疑会触发 publib 跨进程序列化的 Buffer alloc bug)
 *   4. 已连接过的不重复调(去抖 + 不骚扰)
 *   5. 任何错误都 swallow,绝不影响 App 渲染
 */
let _connectStarted = false

function safeConnect() {
  if (_connectStarted) return
  _connectStarted = true

  try {
    // 已经连过 — 跳过
    try {
      const cached = wx.getStorageSync('luffa-identity-v1')
      if (cached && cached.address && !cached.dismissed) return
      if (cached && cached.dismissed && cached.dismissedAt &&
          Date.now() - cached.dismissedAt < 6 * 60 * 60 * 1000) {
        return  // 6 小时内不再问
      }
    } catch { /* storage 异常也吞 */ }

    // 桥不可用 — web 调试 / 非 Luffa 环境
    if (typeof wx === 'undefined' || !wx || typeof wx.invokeNativePlugin !== 'function') return

    // 调 connect,极简参数
    try {
      wx.invokeNativePlugin({
        api_name: 'luffaWebRequest',
        data: {
          methodName: 'connect',
          network: 'mainnet'
        },
        success: (res: any) => {
          try {
            const addr = res?.address || res?.args?.address || res?.data?.address
            if (addr) {
              wx.setStorageSync('luffa-identity-v1', {
                address: addr,
                cid: res?.cid || res?.args?.cid,
                uid: res?.uid || res?.args?.uid,
                connectedAt: Date.now()
              })
            } else {
              wx.setStorageSync('luffa-identity-v1', {
                dismissed: true,
                dismissedAt: Date.now()
              })
            }
          } catch { /* swallow */ }
        },
        fail: () => {
          try {
            wx.setStorageSync('luffa-identity-v1', {
              dismissed: true,
              dismissedAt: Date.now()
            })
          } catch { /* swallow */ }
        }
      })
    } catch { /* invokeNativePlugin 同步异常吞 */ }
  } catch { /* 顶层兜底 */ }
}

function App({ children }: PropsWithChildren<{}>) {
  useEffect(() => {
    // 延迟 800ms,让首屏先渲染(避免开屏即弹窗 + 给 publib 完成自身初始化时间)
    const tid = setTimeout(() => {
      safeConnect()
    }, 800)
    return () => clearTimeout(tid)
  }, [])

  return children
}

export default App
