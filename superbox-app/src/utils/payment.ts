/* Luffa 钱包 + Endless 链 · $19.9 解锁支付
 *
 * 用 raw wx.invokeNativePlugin native bridge,完全不依赖任何 SDK
 * (Luffa Endless SDK / endless-ts-sdk / bignumber.js 都不需要)。
 *
 * 重写原因:SDK 内部用了 BigInt,SuperBox 1.1.6 的 JS 引擎在子包
 * 加载时直接抛 ReferenceError: BigInt is not defined → 小程序闪退。
 *
 * 改为 raw bridge 后,所有 BCS 序列化由 Luffa 客户端 native 端完成,
 * 客户端不需要 BigInt。
 */

declare const wx: any

/* ============ 配置 ============ */

const CONFIG = {
  /** 收款地址(Endless 链账户) */
  recipient: 'Bf8qoqsjPnT9ufHqLeEYoFyy5hxqm6ahrLxbkh2NPp4r',

  /** 价格(美元) */
  priceUsd: 19.9,

  /**
   * USDT 在 Endless 链上的 Fungible Asset Metadata 地址(占位)
   * 拿到官方地址后填进来,把 PAY_WITH_EDS_FALLBACK 切成 false
   */
  usdtTokenAddress: '0xREPLACE_ME_WITH_USDT_FA_METADATA_ADDRESS',
  usdtDecimals: 6,

  /** 默认走 EDS 兜底路径 */
  PAY_WITH_EDS_FALLBACK: true,

  /** EDS / USD 兑率假设(等真实汇率后调整) */
  edsUsdRate: 2.0
}

/* ============ 错误分类 ============ */

export type PaymentErrorCode =
  | 'NO_WALLET'
  | 'USER_REJECTED'
  | 'CHAIN_FAILED'
  | 'CONFIG_INVALID'
  | 'UNKNOWN'

export class PaymentError extends Error {
  code: PaymentErrorCode
  raw?: unknown
  constructor(code: PaymentErrorCode, msg: string, raw?: unknown) {
    super(msg)
    this.code = code
    this.raw = raw
  }
}

/* ============ Promise wrapper(raw bridge,内嵌避免循环依赖) ============ */

function luffa<T = any>(methodName: string, data: Record<string, any> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof wx === 'undefined' || !wx.invokeNativePlugin) {
      reject(new PaymentError('NO_WALLET',
        '未检测到 Luffa 钱包。请在 Luffa 客户端打开。'))
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

export function isWalletAvailable(): boolean {
  try {
    return typeof wx !== 'undefined' && typeof wx.invokeNativePlugin === 'function'
  } catch {
    return false
  }
}

/* ============ 把美元换成 base unit 字符串(无 BigInt) ============ */

/**
 * 浮点数 × 10^decimals,返回整数字符串。
 * 避免 JS 浮点误差:用字符串运算 + 截断到整数。
 */
function toBaseUnits(amount: number, decimals: number): string {
  const s = amount.toFixed(decimals + 2)
  const [intPart, fracPartRaw = ''] = s.split('.')
  let frac = fracPartRaw.slice(0, decimals)
  while (frac.length < decimals) frac += '0'
  const combined = (intPart + frac).replace(/^0+(?=\d)/, '')
  return combined === '' ? '0' : combined
}

/* ============ 连接钱包 ============ */

async function connect(): Promise<{ address: string }> {
  if (!isWalletAvailable()) {
    throw new PaymentError('NO_WALLET',
      '未检测到 Luffa 钱包。请在 Luffa 客户端打开。')
  }
  let res: any
  try {
    res = await luffa('connect', { network: 'mainnet' })
  } catch (e: any) {
    if (e instanceof PaymentError) throw e
    throw new PaymentError('USER_REJECTED', '用户取消了钱包连接', e)
  }
  const address = res?.address || res?.args?.address || res?.data?.address
  if (!address) {
    throw new PaymentError('UNKNOWN', '未获取到钱包地址', res)
  }
  return { address }
}

/* ============ 核心:执行解锁支付 ============ */

export interface PayResult {
  txHash: string
  fromAddress: string
  amount: string
  token: 'USDT' | 'EDS'
}

export async function payUnlock(): Promise<PayResult> {
  if (CONFIG.recipient.startsWith('0xREPLACE') || !CONFIG.recipient) {
    throw new PaymentError('CONFIG_INVALID', '收款地址未配置')
  }
  if (!CONFIG.PAY_WITH_EDS_FALLBACK && CONFIG.usdtTokenAddress.startsWith('0xREPLACE')) {
    throw new PaymentError('CONFIG_INVALID', 'USDT 合约地址未配置')
  }

  const { address: fromAddress } = await connect()

  let token: 'USDT' | 'EDS'
  let amountBase: string
  let functionArguments: string[]
  let typeArguments: string[] = []
  let functionId: string

  if (CONFIG.PAY_WITH_EDS_FALLBACK) {
    token = 'EDS'
    const edsAmount = CONFIG.priceUsd / CONFIG.edsUsdRate
    amountBase = toBaseUnits(edsAmount, 8)
    functionId = '0x1::endless_account::transfer'
    functionArguments = [CONFIG.recipient, amountBase]
  } else {
    token = 'USDT'
    amountBase = toBaseUnits(CONFIG.priceUsd, CONFIG.usdtDecimals)
    functionId = '0x1::endless_account::transfer_coins'
    functionArguments = [CONFIG.recipient, amountBase, CONFIG.usdtTokenAddress]
    typeArguments = ['0x1::fungible_asset::Metadata']
  }

  // Package — Luffa native 做 BCS encode
  let packaged: any
  try {
    packaged = await luffa('packageTransactionV2', {
      from: fromAddress,
      data: {
        payload: {
          function: functionId,
          functionArguments,
          typeArguments
        }
      }
    })
  } catch (e: any) {
    if (e instanceof PaymentError) throw e
    const msg = String(e?.errMsg || e?.message || e || '')
    if (/reject|cancel|denied|user/i.test(msg)) {
      throw new PaymentError('USER_REJECTED', '用户取消了支付', e)
    }
    throw new PaymentError('CHAIN_FAILED', `交易打包失败:${msg}`, e)
  }

  const serialized = packaged?.data || packaged?.args?.data
  if (!serialized) {
    throw new PaymentError('CHAIN_FAILED', '交易打包未返回数据', packaged)
  }

  // Sign + submit
  let submitted: any
  try {
    submitted = await luffa('signAndSubmitTransaction', {
      serializedTransaction: serialized
    })
  } catch (e: any) {
    if (e instanceof PaymentError) throw e
    const msg = String(e?.errMsg || e?.message || e || '')
    if (/reject|cancel|denied|user/i.test(msg)) {
      throw new PaymentError('USER_REJECTED', '用户取消了签名', e)
    }
    throw new PaymentError('CHAIN_FAILED', `链上交易失败:${msg}`, e)
  }

  const txHash = submitted?.hash || submitted?.args?.hash || submitted?.txHash
  if (!txHash) {
    throw new PaymentError('CHAIN_FAILED', '未拿到 tx hash', submitted)
  }

  return { txHash, fromAddress, amount: amountBase, token }
}

/* ============ 错误文案 ============ */

export function explainError(e: unknown): string {
  if (e instanceof PaymentError) {
    switch (e.code) {
      case 'NO_WALLET':      return '请在 Luffa 客户端打开后再支付'
      case 'USER_REJECTED':  return '已取消支付'
      case 'CONFIG_INVALID': return '支付未就绪,请稍后再试'
      case 'CHAIN_FAILED':   return '链上交易失败,请检查余额后重试'
      default:               return '支付出现未知错误'
    }
  }
  return '支付出现未知错误'
}

export function explainErrorEn(e: unknown): string {
  if (e instanceof PaymentError) {
    switch (e.code) {
      case 'NO_WALLET':      return 'Please open this in Luffa to pay'
      case 'USER_REJECTED':  return 'Payment cancelled'
      case 'CONFIG_INVALID': return 'Payment not configured yet'
      case 'CHAIN_FAILED':   return 'On-chain transaction failed; check balance and retry'
      default:               return 'Unknown payment error'
    }
  }
  return 'Unknown payment error'
}

export function paymentConfig() {
  return {
    recipient: CONFIG.recipient,
    priceUsd: CONFIG.priceUsd,
    isEdsFallback: CONFIG.PAY_WITH_EDS_FALLBACK,
    edsAmount: CONFIG.priceUsd / CONFIG.edsUsdRate
  }
}
