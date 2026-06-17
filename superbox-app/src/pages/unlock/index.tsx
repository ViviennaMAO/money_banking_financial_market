import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useT, pickL } from '../../i18n'
import {
  loadUnlockState,
  markUnlocked,
  isAllUnlocked,
  type UnlockState
} from '../../utils/unlock'
import {
  payUnlock,
  explainError,
  explainErrorEn,
  paymentConfig,
  PaymentError
} from '../../utils/payment'
import { findChapter } from '../../data/chapters'
import './index.scss'

function fmt(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

export default function UnlockPage() {
  const { t, locale, toggle } = useT()
  const router = useRouter()
  const chParam = router.params.ch ? Number(router.params.ch) : undefined

  const [state, setState] = useState<UnlockState>(loadUnlockState())
  const [busy, setBusy] = useState(false)
  const cfg = paymentConfig()

  // 如果已经解锁,1.5 秒后自动跳回原章节(免摩擦)
  useEffect(() => {
    if (state.unlocked && chParam) {
      const id = setTimeout(() => {
        const ch = findChapter(chParam)?.chapter
        const url = ch?.pagePath || `/pages/chapter/index?ch=${chParam}`
        Taro.redirectTo({ url })
      }, 1500)
      return () => clearTimeout(id)
    }
  }, [state.unlocked, chParam])

  function showErr(e: unknown) {
    const msg = locale === 'en' ? explainErrorEn(e) : explainError(e)
    if (e instanceof PaymentError &&
        (e.code === 'NO_WALLET' || e.code === 'CONFIG_INVALID')) {
      Taro.showModal({
        title: locale === 'en' ? 'Notice' : '提示',
        content: msg,
        showCancel: false
      })
    } else {
      Taro.showToast({ title: msg, icon: 'none', duration: 2500 })
    }
  }

  async function handlePay() {
    if (busy) return
    setBusy(true)
    Taro.showLoading({ title: t.unlockPage.payBusy })
    try {
      const result = await payUnlock()
      const next = markUnlocked('paid', {
        txId: result.txHash,
        address: result.fromAddress
      })
      Taro.hideLoading()
      setState(next)
      Taro.showToast({ title: t.unlockPage.successTitle, icon: 'success' })
    } catch (e) {
      Taro.hideLoading()
      showErr(e)
    } finally {
      setBusy(false)
    }
  }

  function handleDemo() {
    Taro.showModal({
      title: t.unlockPage.demoConfirmTitle,
      content: t.unlockPage.demoConfirmContent,
      confirmText: t.unlockPage.demoConfirmOk,
      cancelText: t.unlockPage.demoConfirmCancel,
      success(res) {
        if (res.confirm) {
          const next = markUnlocked('demo')
          setState(next)
          Taro.showToast({ title: t.unlockPage.successTitle, icon: 'success' })
        }
      }
    })
  }

  function goBack() {
    if (Taro.getCurrentPages().length > 1) Taro.navigateBack()
    else Taro.switchTab({ url: '/pages/home/index' }).catch(() =>
      Taro.redirectTo({ url: '/pages/home/index' })
    )
  }

  // 如果已经解锁 — 显示成功状态
  if (state.unlocked) {
    return (
      <ScrollView scrollY className='unlock-page unlock-success'>
        <View className='lang-switch' onClick={toggle}>
          <Text className='lang-icon'>🌐</Text>
          <Text className='lang-label'>{t.common.langSwitch}</Text>
        </View>

        <View className='success-hero'>
          <Text className='success-emoji'>✅</Text>
          <Text className='success-title'>{t.unlockPage.successTitle}</Text>
          {state.unlockedBy === 'demo' ? (
            <Text className='success-tag'>
              {locale === 'en' ? '(Demo unlock)' : '(演示解锁)'}
            </Text>
          ) : null}
        </View>

        {state.txId || state.address ? (
          <View className='tx-card'>
            <Text className='tx-title'>{t.unlockPage.txInfoTitle}</Text>
            {state.txId ? (
              <View className='tx-row'>
                <Text className='tx-key'>{t.unlockPage.txInfoHash}</Text>
                <Text className='tx-val'>{state.txId.slice(0, 12)}…{state.txId.slice(-6)}</Text>
              </View>
            ) : null}
            {state.address ? (
              <View className='tx-row'>
                <Text className='tx-key'>{t.unlockPage.txInfoAddress}</Text>
                <Text className='tx-val'>{state.address.slice(0, 8)}…{state.address.slice(-6)}</Text>
              </View>
            ) : null}
            {state.unlockedAt ? (
              <View className='tx-row'>
                <Text className='tx-key'>{t.unlockPage.txInfoAt}</Text>
                <Text className='tx-val'>{new Date(state.unlockedAt).toLocaleString()}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Button className='back-btn' onClick={goBack}>{t.unlockPage.backBtn}</Button>
        <Text className='footnote'>{t.unlockPage.footnote}</Text>
      </ScrollView>
    )
  }

  // 锁定状态 — 主解锁页
  const targetCh = chParam ? findChapter(chParam) : null
  const targetTitle = targetCh
    ? pickL(targetCh.chapter, 'title', locale)
    : null
  const targetHook = targetCh
    ? pickL(targetCh.chapter, 'hook', locale)
    : null

  return (
    <ScrollView scrollY className='unlock-page'>
      <View className='lang-switch' onClick={toggle}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='hero'>
        <Text className='hero-emoji'>{t.unlockPage.heroEmoji}</Text>
        <Text className='hero-title'>{t.unlockPage.heroTitle}</Text>
        <Text className='hero-subtitle'>{t.unlockPage.heroSubtitle}</Text>
      </View>

      {targetCh ? (
        <View className='target-card'>
          <Text className='target-prefix'>{fmt(t.unlockPage.forChapterTpl, { n: targetCh.chapter.num })}</Text>
          <View className='target-row'>
            <Text className='target-emoji'>{targetCh.chapter.emoji}</Text>
            <View className='target-body'>
              <Text className='target-title'>{targetTitle}</Text>
              {targetHook ? (
                <View className='target-hook'>
                  <Text className='hook-flag'>⚡</Text>
                  <Text className='hook-text'>{targetHook}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      <View className='value-card'>
        <Text className='value-tag'>{t.unlockPage.valueTag}</Text>
        <View className='value-list'>
          <View className='value-row'><Text className='val-dot'>•</Text><Text className='val-text'>{t.unlockPage.value1}</Text></View>
          <View className='value-row'><Text className='val-dot'>•</Text><Text className='val-text'>{t.unlockPage.value2}</Text></View>
          <View className='value-row'><Text className='val-dot'>•</Text><Text className='val-text'>{t.unlockPage.value3}</Text></View>
          <View className='value-row'><Text className='val-dot'>•</Text><Text className='val-text'>{t.unlockPage.value4}</Text></View>
        </View>
      </View>

      <View className='price-card'>
        <Text className='price-tag'>{t.unlockPage.priceTag}</Text>
        <Text className='price-big'>{t.unlockPage.priceFull}</Text>
        <Text className='price-meta'>{t.unlockPage.priceMeta}</Text>
        <Text className='price-token'>{t.unlockPage.payTokenInfo}</Text>
        {cfg.isEdsFallback ? (
          <Text className='price-eds-note'>
            {fmt(t.unlockPage.edsFallbackNote, { eds: cfg.edsAmount.toFixed(2) })}
          </Text>
        ) : null}
      </View>

      <View className='action-row'>
        <Button className={`pay-btn ${busy ? 'busy' : ''}`} onClick={handlePay} disabled={busy}>
          {busy ? t.unlockPage.payBusy : t.unlockPage.payBtn}
        </Button>
        <Button className='demo-btn' onClick={handleDemo}>
          {t.unlockPage.demoBtn}
        </Button>
        <Text className='back-link' onClick={goBack}>{t.unlockPage.backBtn}</Text>
      </View>

      <Text className='footnote'>{t.unlockPage.footnote}</Text>
    </ScrollView>
  )
}
