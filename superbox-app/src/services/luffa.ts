/* Luffa SuperBox API 封装 · 基于 wx.* 命名空间 */
import Taro from '@tarojs/taro'

export const luffa = {
  // 鉴权:wx.login 拿 code,后端换 sessionKey
  async login() {
    const { code } = await Taro.login()
    return code
  },

  async getUserProfile() {
    return await Taro.getUserProfile({ desc: '用于个性化学习路径分流' })
  },

  // 分享:在 Luffa 好友 / 朋友圈
  enableShare() {
    Taro.showShareMenu({
      withShareTicket: true,
      // @ts-ignore SuperBox 文档显示该字段
      showShareItems: ['LuffachatFriends', 'LuffachatMoment']
    })
  },

  // 推送(模板消息)— 间隔复习
  async subscribePush(templateIds: string[]) {
    return await Taro.requestSubscribeMessage({ tmplIds: templateIds })
  },

  // 通用 HTTP 请求
  async apiCall<T>(endpoint: string, payload?: unknown): Promise<T> {
    const baseUrl = 'https://api.example.com' // TODO: 真实环境替换
    const result = await Taro.request<T>({
      url: `${baseUrl}${endpoint}`,
      data: payload,
      method: payload ? 'POST' : 'GET',
      header: { 'Content-Type': 'application/json' }
    })
    return result.data
  },

  // 待 Luffa BD 答 Q-A · Channel API 占位
  async joinChannel(_channelId: string) {
    throw new Error('Channel API 待 Luffa BD 答复')
  }
}
