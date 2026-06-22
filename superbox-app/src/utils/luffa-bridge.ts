/* Luffa 原生桥 — Promise 包装 wx.invokeNativePlugin
 *
 * 不依赖任何 SDK,主包友好(< 1KB),用于 onLaunch 时调用钱包连接
 * 真正的链上签名/转账走 src/utils/payment.ts(进 unlock 子包)
 */

declare const wx: any

export function luffa<T = any>(methodName: string, data: Record<string, any> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || !wx.invokeNativePlugin) {
      reject(new Error('wx.invokeNativePlugin is unavailable. Run inside Luffa client / SuperBox Cloud-Devtools.'))
      return
    }
    wx.invokeNativePlugin({
      api_name: 'luffaWebRequest',
      data: { methodName, ...data },
      success: resolve,
      fail: reject
    })
  })
}

export function sessionUuid(): string {
  return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10)
}

/** 判断 Luffa 桥是否可用(开发者工具 web 模式 / 真机判断)*/
export function bridgeAvailable(): boolean {
  try {
    return typeof wx !== 'undefined' && typeof wx.invokeNativePlugin === 'function'
  } catch {
    return false
  }
}
