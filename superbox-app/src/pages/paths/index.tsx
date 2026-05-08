import { View, Text, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { learningPaths, pathGroups, type LearningPath } from '../../data/learning-paths'
import { findChapter } from '../../data/chapters'
import { useT, pickL } from '../../i18n'
import './index.scss'

export default function PathsPage() {
  const { t, locale, toggle: toggleLang } = useT()
  // 默认全部展开
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(learningPaths.map(p => p.id))
  )

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function go(ch: number) {
    const found = findChapter(ch)
    const url = found?.chapter.pagePath || `/pages/chapter/index?ch=${ch}`
    Taro.navigateTo({ url })
  }

  const pathById = (id: string): LearningPath | undefined =>
    learningPaths.find(p => p.id === id)

  return (
    <ScrollView scrollY className='paths-page'>
      <View className='lang-switch' onClick={toggleLang}>
        <Text className='lang-icon'>🌐</Text>
        <Text className='lang-label'>{t.common.langSwitch}</Text>
      </View>

      <View className='paths-hero'>
        <Text className='hero-emoji'>🗺️</Text>
        <Text className='hero-title'>{t.pathsPage.title}</Text>
        <Text className='hero-subtitle'>{t.pathsPage.subtitle}</Text>
      </View>

      {pathGroups.map(group => (
        <View key={group.id} className='path-group'>
          <View className='group-header'>
            <Text className='group-title'>{group.title}</Text>
            <Text className='group-desc'>{group.desc}</Text>
          </View>

          <View className='path-list'>
            {group.pathIds.map(pid => {
              const path = pathById(pid)
              if (!path) return null
              const isOpen = expanded.has(path.id)
              const pathTitle = pickL(path, 'title', locale)
              const pathTag = pickL(path, 'tag', locale)
              const pathHook = pickL(path, 'hook', locale)
              const pathOutcome = pickL(path, 'outcome', locale)
              return (
                <View key={path.id} className={`path-card ${path.color}`}>
                  <View
                    className='path-head'
                    onClick={() => toggle(path.id)}
                  >
                    <View className='path-emoji'>
                      <Text>{path.emoji}</Text>
                    </View>
                    <View className='path-info'>
                      <View className='path-title-row'>
                        <Text className='path-title'>{pathTitle}</Text>
                        <Text className='path-arrow'>{isOpen ? '▾' : '▸'}</Text>
                      </View>
                      <Text className='path-tag'>{pathTag}</Text>
                      <Text className='path-hook'>{pathHook}</Text>
                    </View>
                  </View>

                  {isOpen ? (
                    <View className='path-body'>
                      <View className='path-outcome'>
                        <Text className='outcome-flag'>{t.pathsPage.outcomeFlag}</Text>
                        <Text className='outcome-text'>{pathOutcome}</Text>
                      </View>

                      <View className='path-nodes'>
                        {path.nodes.map((node, idx) => {
                          const ch = findChapter(node.ch)?.chapter
                          if (!ch) return null
                          const chTitle = pickL(ch, 'title', locale)
                          return (
                            <View
                              key={`${path.id}-${node.ch}`}
                              className='node'
                              onClick={() => go(node.ch)}
                            >
                              <View className='node-line'>
                                <Text className='node-step'>{idx + 1}</Text>
                                <Text className='node-emoji'>{ch.emoji}</Text>
                              </View>
                              <View className='node-body'>
                                <View className='node-row'>
                                  <Text className='node-num'>{`${locale === 'zh' ? '第 ' : 'Ch. '}${ch.num}${locale === 'zh' ? ' 章' : ''}`}</Text>
                                  <Text className='node-role'>{node.role}</Text>
                                </View>
                                <Text className='node-title'>{chTitle}</Text>
                                <Text className='node-why'>{node.why}</Text>
                              </View>
                              <Text className='node-go'>→</Text>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  ) : null}
                </View>
              )
            })}
          </View>
        </View>
      ))}

      <View className='footer-note'>
        <Text>{t.pathsPage.nodesNote}</Text>
      </View>
    </ScrollView>
  )
}
