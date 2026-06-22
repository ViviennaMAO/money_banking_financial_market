import { PropsWithChildren } from 'react'
import './app.scss'

/**
 * App 根 — 暂保持纯 shell,不在 onLaunch 触发任何 native 调用。
 *
 * 背景:用户真机调试遇到 Luffa publib_remote_helper:1020 Buffer/TypedArray
 * 抛错,经排查不在我们主包(dist 内 grep TYPED_ARRAY_SUPPORT=0),
 * 但仍导致闪退。先让 App 根尽量空,确认问题是否来自其他位置(子包预热 /
 * 平台 SDK)。
 *
 * 钱包连接已移到 pages/unlock 子包 + 首页"立即解锁"按钮主动触发(用户点击时)。
 * 这仍然满足"用户在使用过程中调用钱包授权"的合规要求 —— Luffa 多数审核样例
 * 也是用户主动点击触发,非 onLaunch 强制弹窗。
 */
function App({ children }: PropsWithChildren<{}>) {
  return children
}

export default App
