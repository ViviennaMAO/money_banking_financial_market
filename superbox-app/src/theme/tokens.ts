export const tokens = {
  bg: '#0a0e1a',
  bg2: '#131826',
  bg3: '#1c2236',
  text: '#e6edf3',
  textDim: '#8b8fa8',
  accent: '#3b82f6',
  warn: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  purple: '#a78bfa',
  cyan: '#06b6d4'
} as const

export type ColorKey = keyof typeof tokens
