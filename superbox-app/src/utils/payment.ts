/* Luffa 钱包 + Endless 链 · $19.9 解锁支付
 *
 * 收款:Bf8qoqsjPnT9ufHqLeEYoFyy5hxqm6ahrLxbkh2NPp4r(Endless 钱包地址)
 *
 * Phase 1(当前):用 EDS 兜底走通流程(USDT 合约地址待补)
 * Phase 2:配齐 USDT FA Metadata 地址后切回 USDT 路径
 *
 * 用法:
 *   import { payUnlock, explainError, PaymentError } from '../../utils/payment'
 *   try {
 *     const { txHash, fromAddress } = await payUnlock()
 *     markUnlocked('paid', { txId: txHash, address: fromAddress })
 *   } catch (e) {
 *     Taro.showToast({ title: explainError(e), icon: 'none' })
 *   }
 */

import { EndlessLuffaSdk, UserResponseStatus } from '@luffalab/luffa-endless-sdk'
import BigNumber from 'bignumber.js'

/* ============ 配置 ============ */

const CONFIG = {
  network: 'mainnet' as 'testnet' | 'mainnet',

  /** 收款地址(Endless 链账户) */
  recipient: 'Bf8qoqsjPnT9ufHqLeEYoFyy5hxqm6ahrLxbkh2NPp4r',

  /** 价格(美元) */
  priceUsd: 19.9,

  /**
   * USDT 在 Endless 链上的 Fungible Asset Metadata 地址。
   * TODO:拿到官方地址后填进来,并把下面 PAY_WITH_EDS_FALLBACK 切成 false。
   */
  usdtTokenAddress: '0xREPLACE_ME_WITH_USDT_FA_METADATA_ADDRESS',
  usdtDecimals: 6,

  /**
   * 当前默认:走 EDS 兜底路径。
   * 等 USDT 地址确认后改为 false。
   */
  PAY_WITH_EDS_FALLBACK: true,

  /** EDS 兜底:1 EDS = $X 的假设汇率(可调) */
  edsUsdRate: 2.0
}

/* ============ 错误分类 ============ */

export type PaymentErrorCode =
  | 'NO_WALLET'        // Luffa 钱包不可用(不在 SuperBox / IDE 环境)
  | 'USER_REJECTED'    // 用户取消签名/连接
  | 'CHAIN_FAILED'     // 链上交易失败 / 超时
  | 'CONFIG_INVALID'   // 收款 / USDT 地址未配置
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

/* ============ SDK 单例 ============ */

let _sdk: EndlessLuffaSdk | null = null

function getSdk(): EndlessLuffaSdk {
  if (!_sdk) _sdk = new EndlessLuffaSdk({ network: CONFIG.network })
  return _sdk
}

/** Luffa 钱包是否可用 — SuperBox / IDE 环境才有 wx.invokeNativePlugin */
export function isWalletAvailable(): boolean {
  try {
    // @ts-ignore
    const w = typeof wx !== 'undefined' ? wx : (typeof globalThis !== 'undefined' ? (globalThis as any).wx : undefined)
    return !!(w && typeof w.invokeNativePlugin === 'function')
  } catch {
    return false
  }
}

/* ============ 连接钱包 ============ */

async function connect(): Promise<{ address: string }> {
  if (!isWalletAvailable()) {
    throw new PaymentError('NO_WALLET',
      '未检测到 Luffa 钱包。请在 Luffa 客户端 / SuperBox 开发者工具中打开。')
  }
  const sdk = getSdk()
  let res: any
  try {
    res = await sdk.connect()
  } catch (e) {
    throw new PaymentError('UNKNOWN', '钱包连接异常', e)
  }
  if (res?.status !== UserResponseStatus.APPROVED) {
    throw new PaymentError('USER_REJECTED', '用户取消了钱包连接')
  }
  const account = await sdk.getAccount()
  const address = (account as any)?.account?.address || (account as any)?.address
  if (!address) {
    throw new PaymentError('UNKNOWN', '未获取到钱包地址', account)
  }
  return { address }
}

/* ============ 核心:执行解锁支付 ============ */

export interface PayResult {
  txHash: string
  fromAddress: string
  amount: string          // 实际支付的 base-unit 字符串
  token: 'USDT' | 'EDS'
}

export async function payUnlock(): Promise<PayResult> {
  // 1) 校验配置
  if (CONFIG.recipient.startsWith('0xREPLACE') || !CONFIG.recipient) {
    throw new PaymentError('CONFIG_INVALID', '收款地址未配置')
  }
  if (!CONFIG.PAY_WITH_EDS_FALLBACK && CONFIG.usdtTokenAddress.startsWith('0xREPLACE')) {
    throw new PaymentError('CONFIG_INVALID', 'USDT 合约地址未配置')
  }

  // 2) 连接钱包
  const { address: fromAddress } = await connect()

  // 3) 构造转账 payload
  const sdk = getSdk()
  let tx: any
  let token: 'USDT' | 'EDS'
  let amountBase: string

  try {
    if (CONFIG.PAY_WITH_EDS_FALLBACK) {
      // EDS 兜底 — 原生 token 转账
      token = 'EDS'
      const edsAmount = CONFIG.priceUsd / CONFIG.edsUsdRate  // $19.9 / 2.0 = 9.95 EDS
      amountBase = BigNumber(edsAmount).shiftedBy(8).integerValue().toFixed()
      tx = await sdk.signAndSubmitTransaction({
        payload: {
          function: '0x1::endless_account::transfer',
          functionArguments: [CONFIG.recipient, amountBase]
        }
      })
    } else {
      // USDT 转账 — Fungible Asset
      token = 'USDT'
      amountBase = BigNumber(CONFIG.priceUsd)
        .shiftedBy(CONFIG.usdtDecimals)
        .integerValue()
        .toFixed()
      tx = await sdk.signAndSubmitTransaction({
        payload: {
          function: '0x1::endless_account::transfer_coins',
          functionArguments: [
            CONFIG.recipient,
            amountBase,
            CONFIG.usdtTokenAddress
          ],
          typeArguments: ['0x1::fungible_asset::Metadata']
        }
      })
    }
  } catch (e: any) {
    const msg = String(e?.message || e || '')
    if (/reject|cancel|denied|user/i.test(msg)) {
      throw new PaymentError('USER_REJECTED', '用户取消了支付')
    }
    throw new PaymentError('CHAIN_FAILED', `链上交易失败:${msg}`, e)
  }

  const txHash = tx?.hash || tx?.args?.hash || tx?.txHash
  if (!txHash) {
    throw new PaymentError('CHAIN_FAILED', '未拿到 tx hash,交易状态未知', tx)
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

/** 暴露当前配置(给 UI 显示用,例如 fallback 状态) */
export function paymentConfig() {
  return {
    network: CONFIG.network,
    recipient: CONFIG.recipient,
    priceUsd: CONFIG.priceUsd,
    isEdsFallback: CONFIG.PAY_WITH_EDS_FALLBACK,
    edsAmount: CONFIG.priceUsd / CONFIG.edsUsdRate
  }
}
