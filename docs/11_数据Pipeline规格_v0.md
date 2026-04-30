# 数据 Pipeline 规格 v0

> **目的**:[05 §3.3] 给了高层架构,这份文档落到具体——每个因子的 FRED Series ID、刷新频率、清洗规则、Postgres schema、调度时间、Redis 缓存策略、降级方案。**数据工程师拿到能立刻 scaffold ETL**。
>
> **覆盖**:三章 MVP 用到的全部因子(美国 / 中国 / 全球),按章节组织。
>
> **数据源策略**:
> 1. 优先用 FRED(免费、稳定、无配额限制)
> 2. FRED 没有的(中国数据、高频汇率)走第二选择(OANDA / 央行直采 / Wind)
> 3. **MVP 不用付费源**(Bloomberg / Refinitiv 等到 5000 DAU 再升)

---

## 1. 总则

### 1.1 因子分类

| 类别 | 频率 | 数据源 | 用途 |
|---|---|---|---|
| 政策利率 / 利率走廊 | 日 | FRED + 央行直采 | 模拟器 / 看板主图 |
| 资产负债表 / 准备金 | 周 | FRED H.4.1 | 第 14 章模拟器 |
| 货币总量(M0/M1/M2)| 月 | FRED + PBOC | 第 14 章 / 第 24 章 |
| 价格(CPI / PCE / 房价)| 月 | FRED + BLS | 第 24 章 / 第 20 章 |
| 就业 | 月 | FRED + BLS | 第 20 章 AS 曲线 |
| GDP / 财政 | 季 | FRED + Treasury | 第 20 章 IS 曲线 |
| 汇率 | 日(实时可选)| FRED + OANDA | 第 17 章 |
| 国债收益率(各期限)| 日 | FRED | 第 17 章 carry / 第 20 章 |
| 信用利差 / VIX | 日 | FRED | 第 12 章 / 第 20 章 |

### 1.2 调度总览

```
01:00 UTC  → FRED 全量增量更新(每日 1 次)
每整点    → 实时汇率 + 政策利率(每 60min)
每周一 02:00  → 中国数据爬虫(PBOC 公布周期不规律,多爬保险)
事件触发  → FOMC / BOJ / PBOC 决议 30min 后扫描更新
```

### 1.3 数据生命周期

```
[FRED API / OANDA / 爬虫] 
    ↓ ETL(Celery worker)
[原始数据 raw_observations]
    ↓ 清洗(去 NaN、单位统一、命名规范)
[标准化 factor_observations]
    ↓ 衍生计算(乘数、breakeven、carry 等)
[derived_indicators]
    ↓ 缓存(Redis,TTL 1min-1day)
[FastAPI /factors/* 端点]
    ↓ 前端 React Query 拉取
```

---

## 2. 第 14 章 因子清单(货币乘数)

### 2.1 核心 FRED Series

| 因子 | FRED Series ID | 频率 | 单位 | 用途 |
|---|---|---|---|---|
| Fed 总资产 | `WALCL` | 周(每周三公布)| $十亿 | 模拟器 MB 默认值 + 看板主图 |
| 银行准备金余额 | `WRESBAL` | 周 | $十亿 | 美元流动性公式 |
| TGA(财政部一般账户)| `WTREGEN` | 周 | $十亿 | 美元流动性公式 |
| ON RRP(隔夜逆回购)| `RRPONTSYD` | 日 | $十亿 | 美元流动性公式 |
| IORB(超储利率)| `IORB` | 日 | % | §6 答疑高频引用 |
| 联邦基金有效利率 | `DFF` 或 `EFFR` | 日 | % | 利率走廊 |
| SOFR(隔夜担保利率)| `SOFR` | 日 | % | REPO 市场温度计 |
| M0 流通中现金 | `MBCURRCIR` | 周 | $十亿 | 计算 c |
| M1 美国 | `M1SL` | 月 | $十亿 | 货币层次 |
| M2 美国 | `M2SL` | 月 | $十亿 | 计算实测 m = M2/MB |
| 商业银行总存款 | `DPSACBW027SBOG` | 周 | $十亿 | 计算 c |
| 商业银行贷款 | `TOTLL` | 周 | $十亿 | 信贷扩张温度计 |

### 2.2 衍生指标(自计算)

```python
# apps/api/src/etl/derive_ch14.py

def compute_money_multiplier(date: date) -> float:
    """实测乘数 = M2 / MB"""
    m2 = get_factor('M2SL', date)
    mb = get_factor('WALCL', date)  # 简化:用 Fed 总资产作 MB 代理
    return m2 / mb if mb else None

def compute_usd_liquidity(date: date) -> float:
    """美元流动性 = Fed 资产 - TGA - ON RRP(教材公式)"""
    walcl = get_factor('WALCL', date)
    tga = get_factor('WTREGEN', date)
    rrp = get_factor('RRPONTSYD', date)
    return walcl - tga - rrp

def compute_excess_reserve_ratio(date: date) -> float:
    """超额准备金率 e ≈ (银行准备金 - 法定准备金) / 总存款"""
    reserves = get_factor('WRESBAL', date)
    deposits = get_factor('DPSACBW027SBOG', date)
    # 美国 r=0 自 2020.3 起,所以 e = reserves / deposits
    return reserves / deposits if deposits else None

def compute_currency_deposit_ratio(date: date) -> float:
    """c = 流通中现金 / 总存款"""
    cash = get_factor('MBCURRCIR', date)
    deposits = get_factor('DPSACBW027SBOG', date)
    return cash / deposits if deposits else None
```

### 2.3 中国数据(无 FRED 对应,需自爬)

| 因子 | 数据源 | 频率 | 爬取方式 |
|---|---|---|---|
| M2 中国 | PBOC 月度统计 | 月 | 爬虫(http://www.pbc.gov.cn/) |
| 法准率 RRR | PBOC 公告 | 不定期 | 公告页爬虫 + 人工记录 |
| MLF 利率 | PBOC | 月 | 同上 |
| LPR 1Y/5Y | 全国银行间同业拆借中心 | 月 | https://www.chinamoney.com.cn/ |
| 社融存量 | PBOC 月报 | 月 | 同上 |
| DR007 | Chinabond / Chinamoney | 日 | API |

**MVP 妥协**:中国数据先**手动维护**(教研每月公布日更新一次 Excel,导入数据库),爬虫等到第 2 个月再做。

---

## 3. 第 17 章 因子清单(利率平价 / 套息)

### 3.1 汇率(FRED 日频 + OANDA 实时可选)

| 因子 | FRED Series | OANDA 备用 | 频率 |
|---|---|---|---|
| USD/JPY | `DEXJPUS` | `USD_JPY` | 日 / 实时 |
| USD/CNY | `DEXCHUS` | `USD_CNH` | 日 |
| EUR/USD | `DEXUSEU` | `EUR_USD` | 日 / 实时 |
| GBP/USD | `DEXUSUK` | `GBP_USD` | 日 |
| USD/CHF | `DEXSZUS` | `USD_CHF` | 日 |
| 广义美元指数 DXY | `DTWEXBGS` | 自计算 | 日 |

**实时频率(分钟级)**:OANDA Free Tier 限 200 calls/月,**MVP 不用实时**,日频足够;高频用户付费版再开。

### 3.2 各国国债收益率

| 因子 | FRED Series | 备用源 |
|---|---|---|
| 美国 2Y / 5Y / 10Y / 30Y | `DGS2` / `DGS5` / `DGS10` / `DGS30` | — |
| TIPS 实际利率(各期限)| `DFII5` / `DFII10` / `DFII30` | — |
| 5Y breakeven | `T5YIE` | 自计算 |
| 5Y5Y forward | `T5YIFR` | 自计算 |
| 日本 10Y | 无 | BoJ 直接 / investing.com |
| 中国 10Y | 无 | Chinabond / Wind |
| 欧元区 10Y(德国) | `IRLTLT01DEM156N`(月)| ECB 直接 |

### 3.3 衍生指标

```python
def compute_carry_spread(currency_pair: str, tenor: str = '3M', date: date) -> float:
    """套息利差 = i_d - i_f"""
    base, quote = parse_pair(currency_pair)
    # 简化:用各国 3M 国债收益率
    rate_base = get_short_rate(base, tenor, date)
    rate_quote = get_short_rate(quote, tenor, date)
    return rate_base - rate_quote

def compute_cip_deviation(currency_pair: str, tenor: str, date: date) -> float:
    """CIP 偏离 = (F/S - 1) - (i_d - i_f) × τ
    正常 ≈ 0;危机时显著负偏离(美元短缺溢价)"""
    spot = get_factor(f'DEX{currency_pair}', date)
    forward = get_forward_rate(currency_pair, tenor, date)
    spread = compute_carry_spread(currency_pair, tenor, date)
    tau = parse_tenor(tenor)
    return (forward / spot - 1) - spread * tau

def compute_carry_g10_ranking(date: date) -> list:
    """G10 套息排名:按 i_d - 美国基准 排序"""
    ...
```

---

## 4. 第 20 章 因子清单(IS-LM-AD-AS)

### 4.1 总产出 / 价格 / 就业

| 因子 | FRED Series | 频率 |
|---|---|---|
| 实际 GDP | `GDPC1` | 季 |
| 名义 GDP | `GDP` | 季 |
| 潜在 GDP | `GDPPOT` | 季 |
| CPI 总指数 | `CPIAUCSL` | 月 |
| 核心 CPI | `CPILFESL` | 月 |
| PCE | `PCEPI` | 月 |
| **核心 PCE**(Fed 主指标)| `PCEPILFE` | 月 |
| 失业率 | `UNRATE` | 月 |
| 自然失业率估计 | `NROU` | 季 |
| 工资增速 | `CES0500000003` | 月 |
| 劳动参与率 | `CIVPART` | 月 |

### 4.2 信用 / 风险溢价

| 因子 | FRED Series | 用途 |
|---|---|---|
| IG 信用利差(BoA OAS)| `BAMLC0A0CM` | 第 12 章 / 信贷渠道 |
| HY 信用利差 | `BAMLH0A0HYM2` | 同上 |
| AAA - 10Y 利差 | `AAA10Y` | — |
| Moody's BAA 利差 | `BAA10Y` | 危机指标 |
| TED 利差 | 已停发,改用 `SOFRINDEX - DGS3MO` 替代 | — |
| VIX | `VIXCLS` | 风险偏好 |

### 4.3 财政

| 因子 | FRED Series |
|---|---|
| 联邦预算赤字 | `FYFSD` |
| 联邦债务 / GDP | `GFDEGDQ188S` |
| 财政部 TGA(已在 §2.1) | `WTREGEN` |
| 政府支出占 GDP | `FYONGDA188S` |

### 4.4 IS-LM 衍生指标

```python
def compute_real_rate(tenor: str = '10Y', date: date) -> float:
    """实际利率 = 名义 - 预期通胀
    简化版:用 TIPS 收益率作实际利率"""
    return get_factor(f'DFII{tenor[:-1]}', date)

def compute_taylor_implied_rate(date: date) -> float:
    """泰勒规则隐含利率 = r* + π + 0.5(π - π*) + 0.5(y - y*)"""
    pi = get_factor('PCEPILFE', date, transform='yoy')  # 核心 PCE 同比
    pi_star = 2.0  # Fed 目标
    output_gap = compute_output_gap(date)
    r_star = 0.5  # 自然实际利率估计
    return r_star + pi + 0.5 * (pi - pi_star) + 0.5 * output_gap
```

---

## 5. Postgres Schema

### 5.1 核心表

```sql
-- 因子元数据
CREATE TABLE factor_series (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(50) UNIQUE NOT NULL,  -- 'M2SL', 'DEXJPUS', etc.
  source          VARCHAR(20) NOT NULL,          -- 'FRED', 'OANDA', 'PBOC', 'manual'
  source_id       VARCHAR(100),                  -- FRED series ID
  display_name_zh VARCHAR(100),
  unit            VARCHAR(20),                   -- 'pct', 'usd_billion', 'index', 'level'
  frequency       VARCHAR(10) NOT NULL,          -- 'D', 'W', 'M', 'Q'
  chapter_tags    INTEGER[],                     -- [14, 17, 20]
  expected_range  JSONB,                         -- {"min": 0, "max": 100} 用于异常检测
  last_fetched_at TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 因子观测值(时序)
CREATE TABLE factor_observations (
  id              BIGSERIAL PRIMARY KEY,
  series_id       INTEGER REFERENCES factor_series(id),
  observation_date DATE NOT NULL,
  value           NUMERIC(20, 6),
  source_revision INTEGER DEFAULT 1,             -- FRED 经常回溯修订,记录版本
  fetched_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(series_id, observation_date, source_revision)
);

CREATE INDEX idx_obs_series_date ON factor_observations(series_id, observation_date DESC);

-- 衍生指标(自计算,缓存)
CREATE TABLE derived_indicators (
  id              BIGSERIAL PRIMARY KEY,
  code            VARCHAR(50) NOT NULL,          -- 'money_multiplier', 'usd_liquidity', 'cip_deviation_usdjpy'
  observation_date DATE NOT NULL,
  value           NUMERIC(20, 6),
  computed_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(code, observation_date)
);

CREATE INDEX idx_deriv_code_date ON derived_indicators(code, observation_date DESC);

-- 历史快照(给模拟器预设用)
CREATE TABLE simulator_snapshots (
  id              SERIAL PRIMARY KEY,
  chapter         INTEGER NOT NULL,
  snapshot_key    VARCHAR(50) NOT NULL,          -- '2010', '2024-8', 'today'
  display_name    VARCHAR(100),
  parameters      JSONB NOT NULL,                -- {mb: 2.0, r: 10, e: 80, c: 8}
  note            TEXT,
  flash           BOOLEAN DEFAULT false,
  predict_def     JSONB,                         -- 预测先行配置
  observation_date DATE,                         -- 数据对齐到哪一天
  UNIQUE(chapter, snapshot_key)
);

-- 数据质量记录
CREATE TABLE data_quality_alerts (
  id              SERIAL PRIMARY KEY,
  series_id       INTEGER REFERENCES factor_series(id),
  alert_type      VARCHAR(50),                   -- 'missing', 'out_of_range', 'source_failed'
  severity        VARCHAR(20),                   -- 'critical', 'warning'
  message         TEXT,
  triggered_at    TIMESTAMP DEFAULT NOW(),
  resolved_at     TIMESTAMP
);
```

### 5.2 高频访问优化

```sql
-- 物化视图:最新 30 天数据(给 RAG 上下文用,需要快)
CREATE MATERIALIZED VIEW recent_factor_snapshot AS
SELECT 
  fs.code,
  fs.display_name_zh,
  fs.unit,
  fo.observation_date,
  fo.value
FROM factor_series fs
JOIN factor_observations fo ON fs.id = fo.series_id
WHERE fo.observation_date >= NOW() - INTERVAL '30 days'
  AND fo.source_revision = (
    SELECT MAX(source_revision) FROM factor_observations 
    WHERE series_id = fs.id AND observation_date = fo.observation_date
  );

-- 每日更新
CREATE INDEX idx_recent_code ON recent_factor_snapshot(code);
```

---

## 6. Redis 缓存策略

### 6.1 Key 设计

```
factor:{code}:latest                  # 最新值 + 时间戳
factor:{code}:series:{period}         # 时间序列(过去 30/90/365 天)
derived:{code}:latest                 # 衍生指标最新值
snapshot:ch{chapter}:{key}            # 模拟器快照(永久)
rag:context:{user_id}:{chapter}       # AI 答疑用的因子上下文
```

### 6.2 TTL 策略

| Key 类型 | TTL | 理由 |
|---|---|---|
| 实时利率 / 汇率 | 60s | 与上游刷新对齐 |
| 日频数据(M2 / 准备金) | 24h | 上游每日更新 |
| 衍生指标(乘数 / liquidity) | 5min | 计算成本,不需太新 |
| 历史快照 | 永久 | 不变 |
| RAG 用户上下文 | 1h | 用户每小时刷新一次 |

---

## 7. ETL 调度(Celery beat)

### 7.1 配置

```python
# apps/api/src/celery_app.py

from celery import Celery
from celery.schedules import crontab

app = Celery('mishkin_etl')

app.conf.beat_schedule = {
    # FRED 全量增量(每日 01:00 UTC = 美东 21:00)
    'fred-daily-fetch': {
        'task': 'etl.tasks.fetch_fred_all',
        'schedule': crontab(hour=1, minute=0),
    },
    # 实时利率(每整点)
    'rates-hourly': {
        'task': 'etl.tasks.fetch_rates_realtime',
        'schedule': crontab(minute=0),
    },
    # 中国数据(每周一 02:00,因为 PBOC 公布日不规律)
    'china-weekly-scan': {
        'task': 'etl.tasks.scan_china_data',
        'schedule': crontab(hour=2, minute=0, day_of_week=1),
    },
    # 衍生指标重算(每日 02:00,基础数据落地后)
    'compute-derived': {
        'task': 'etl.tasks.compute_all_derived',
        'schedule': crontab(hour=2, minute=0),
    },
    # 物化视图刷新(每日 03:00)
    'refresh-mv': {
        'task': 'etl.tasks.refresh_recent_snapshot',
        'schedule': crontab(hour=3, minute=0),
    },
    # 数据质量检查(每日 04:00)
    'quality-check': {
        'task': 'etl.tasks.run_quality_checks',
        'schedule': crontab(hour=4, minute=0),
    },
}
```

### 7.2 增量 vs 全量

```python
def fetch_fred_series(series_id: str, force_full: bool = False):
    """优先增量,按上次成功 fetched_at 之后的数据拉。
    每周日做一次全量回溯(因为 FRED 经常修订历史数据)。"""
    if force_full or is_sunday():
        start_date = '2000-01-01'
    else:
        last_obs = get_latest_observation_date(series_id)
        start_date = last_obs - timedelta(days=7)  # 重叠 7 天捕获修订
    
    data = fred_api.get_series(series_id, observation_start=start_date)
    upsert_observations(series_id, data)
```

---

## 8. 数据质量监控

### 8.1 检查规则

```python
QUALITY_RULES = {
    # 缺失检测
    'missing_data': {
        'rule': lambda obs: obs is None,
        'severity': 'critical',
        'window': '24h',
    },
    # 超出预期范围
    'out_of_range': {
        'rule': lambda obs, expected: obs < expected['min'] or obs > expected['max'],
        'severity': 'warning',
    },
    # 日内变化超 3 标准差
    'extreme_jump': {
        'rule': lambda obs, history: abs(obs - history.mean()) > 3 * history.std(),
        'severity': 'warning',
    },
    # 数据源连续失败
    'source_failure': {
        'rule': lambda fetch_log: fetch_log.consecutive_failures >= 3,
        'severity': 'critical',
    },
}
```

### 8.2 告警渠道

| 严重度 | 渠道 | 响应时间 |
|---|---|---|
| critical | PagerDuty + 邮件 + Slack | 立即 |
| warning | Slack 频道(#data-quality)| 工作时间 |
| info | 每日 digest 邮件 | 隔日审 |

### 8.3 自检 dashboard

PostHog 或自建 Grafana:
- 每个因子的"最后更新时间"分布
- 数据源健康度(成功率 / 平均延迟)
- 衍生指标计算是否成功
- 异常告警时间线

---

## 9. 灾备 / 降级

### 9.1 降级矩阵

| 故障场景 | 降级策略 |
|---|---|
| FRED API 全挂 | 切换到 ALFRED(FRED 历史快照镜像) → 仍挂 → 用 Postgres 缓存数据,前端显示"数据更新延迟" |
| OANDA 实时挂 | 切换到 FRED 日频(损失实时性,模拟器仍可玩) |
| Redis 挂 | 直接查 Postgres(慢但可用),前端 React Query 增加重试 |
| Postgres 主库挂 | 切只读副本 |
| Celery worker 挂 | k8s 自动重启;同时 cron 兜底脚本(每日 06:00 检查上一日数据是否齐全,缺则补) |
| 中国数据爬虫挂 | 教研手动 Excel 导入 |

### 9.2 数据库备份

- Postgres 每日自动快照(Supabase / Neon 默认提供)
- 关键表(simulator_snapshots / derived_indicators)每周导出到 Cloudflare R2

---

## 10. API 端点(给前端)

```
GET /api/factors/:code/latest           # 最新值
GET /api/factors/:code/series?period=30d  # 时间序列
GET /api/factors/derived/:code           # 衍生指标(乘数 / liquidity / carry)
GET /api/snapshots/ch/:chapter           # 章节所有快照
GET /api/snapshots/ch/:chapter/:key      # 单个快照详情
GET /api/dashboard/ch/:chapter           # 章节看板聚合数据(一次拉所有)
```

响应格式:

```typescript
interface FactorResponse {
  code: string
  name_zh: string
  latest: { date: string; value: number; unit: string }
  series?: Array<{ date: string; value: number }>
  metadata: {
    source: string
    last_updated: string
    quality_status: 'ok' | 'warning' | 'critical'
  }
}
```

---

## 11. 工作量(给数据工程师)

| 模块 | 人日 |
|---|---|
| FRED API 接入 + 全因子拉取脚本 | 2 |
| OANDA 接入 + 汇率 ETL | 1 |
| 中国数据爬虫(PBOC / Chinabond) | 2 |
| Postgres schema 建立 + 索引 | 1 |
| 衍生指标计算函数(`derive_*.py`)| 2 |
| Celery beat 调度配置 + worker | 1 |
| Redis 缓存层 + TTL 策略 | 1 |
| 数据质量监控 + 告警接入 | 1.5 |
| FastAPI 端点 + 文档 | 1 |
| 灾备测试 + 降级演练 | 1 |
| 模拟器历史快照 seed 数据 | 0.5 |
| **合计** | **14 人日**(原估算 5,因为细化后真实工作量更大)|

> **关键发现**:中国数据爬虫成本被低估。如果 MVP 阶段先用"教研手动 Excel 导入"(0.5 人日 + 教研每月 30 分钟维护),工作量降到 11 人日。

---

## 12. MVP 优先级裁剪

如果 14 人日太多,**MVP 第一刀**(8 人日)只做:

1. ✅ 14 章核心 8 因子(WALCL / WRESBAL / RRPONTSYD / WTREGEN / IORB / DFF / M2SL / DPSACBW027SBOG)
2. ✅ 17 章核心 5 因子(USD/JPY / USD/CNY / DGS10 / 日本 10Y 静态值 / DXY)
3. ✅ 20 章核心 5 因子(GDP / CPI / PCEPILFE / UNRATE / VIX)
4. ✅ 关键衍生指标 3 个(乘数 / 美元流动性 / 5Y breakeven)
5. ✅ 历史快照 14 个(seed 数据,不依赖实时 ETL)
6. ⏸ 中国数据先手动维护
7. ⏸ 实时高频 / 跨货币基差 / 信贷利差 → v1.5

**现在的 MVP 数据 ≈ 18 个因子 + 3 衍生指标 + 14 个静态快照**——已经够支撑三章模拟器跑通。

---

*v0 草稿。等你 review:1)FRED Series ID 是否需要校对(我用了相对有把握的,但工程师 scaffold 时建议复测每个 ID);2)中国数据"先手动后爬虫"的妥协是否符合你的运营节奏;3)§9 降级矩阵是否需要补充(尤其遇到 Luffa 端的"数据接口必须本地化"要求时)。*
