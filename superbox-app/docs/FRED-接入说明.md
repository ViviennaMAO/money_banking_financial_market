# FRED 真实数据接入说明

让所有章节都能"看到今天的数字" — 利率、通胀、M2、汇率每日自动更新。

---

## 架构(零服务器成本)

```
FRED API
   │ (每日 02:00 UTC,GitHub Actions cron)
   ▼
scripts/fetch-fred.mjs  ── 用 GH Secret FRED_API_KEY 拉取
   │
   ▼ commit
public/data/fred-latest.json
   │
   ▼ 客户端拉取(jsDelivr CDN → raw.githubusercontent 兜底)
src/utils/fred.ts (内存 1h + storage 12h 缓存)
   │
   ▼ 网络/CDN 失败时
src/data/fred-baseline.ts (打包基线,永不失败)
   │
   ▼
src/components/LiveData/  ── 各页面调用
```

## 一次性配置

1. 申请免费 FRED API key:https://fred.stlouisfed.org/docs/api/api_key.html
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FRED_API_KEY`
   - Value: 你的 key
3. 触发首次同步:repo → **Actions → "FRED 数据每日同步" → Run workflow**

之后每天 02:00 UTC 自动运行,数据更新会自动 commit 到 main 分支。

## 本地手动测试

```bash
cd superbox-app
FRED_API_KEY=你的key node scripts/fetch-fred.mjs
# → 输出 public/data/fred-latest.json
```

## 当前接入了哪些 FRED 序列(21 个)

| ID | 含义 | 频率 | 哪几章用到 |
|---|---|---|---|
| DFF | 联邦基金利率 | 日 | Ch1 / Ch15 / Ch16 / 首页 |
| DGS2 / DGS10 / DGS30 | 2Y/10Y/30Y 美债 | 日 | Ch4 / Ch6 / 首页 |
| T10Y2Y | 2s10s 利差 | 日 | Ch6 / 首页 |
| T10YIE | 10Y 通胀盈亏平衡 | 日 | Ch4 / Ch24 |
| SOFR / IORB | 隔夜利率 / 走廊上沿 | 日 | Ch15 |
| CPIAUCSL / CPILFESL | CPI / 核心 CPI | 月 | Ch16 / Ch24 |
| PCEPI / PCEPILFE | PCE / 核心 PCE | 月 | Ch24 |
| M1SL / M2SL | M1 / M2 | 月 | Ch3 / Ch14 / Ch19 |
| WALCL | Fed 资产负债表 | 周 | Ch14 / Ch15 |
| UNRATE | 失业率 | 月 | Ch16 / Ch22 |
| GDPC1 | 实际 GDP | 季 | Ch20 / Ch22 |
| DEXJPUS / DEXUSEU / DTWEXBGS | USD/JPY / EUR/USD / 美元指数 | 日 | Ch17 / Ch18 |
| MORTGAGE30US | 30Y 房贷利率 | 周 | Ch1 |

## 派生指标(脚本自动计算)

- `cpiYoY` / `coreCpiYoY` / `pceYoY` / `corePceYoY` - 同比通胀率
- `spread2s10sBps` - 2s10s 利差(bps)
- `m2YoY` - M2 同比
- `walclVsPeak` - Fed 资产 vs 8.96T 峰值
- `taylorImplied` - 泰勒规则建议利率(基于实时 CPI + UNRATE)
- `mortgageMonthlyAt500k` - 50 万贷款 30 年期月供

## 小程序合法域名

如部署到正式微信小程序,需在小程序后台 **开发管理 → 服务器域名** 添加:

- `https://cdn.jsdelivr.net`
- `https://raw.githubusercontent.com`

SuperBox 通常默认放行,如有需要在 SuperBox 控制台同样配置。

## 兜底逻辑

| 状态 | 客户端表现 |
|---|---|
| GH Actions 没运行过 | 显示打包的 `fredBaseline`(2026-04-30 快照),角标 "FRED · 基线" |
| 在线 + CDN 通 | 拉取 `fred-latest.json`,写入 storage,角标 "FRED · 实时" |
| 离线 / CDN 失败 / 域名未放行 | 用 storage 缓存(< 12h),否则用 baseline,角标自动反映 |

无论哪种状态,**应用都不会因为数据请求失败而崩溃**。
