# dsh-activity-heatmap

DSH Web GUI 左侧栏活动热力图插件：常驻显示近 90 天的活动热力图，可在
「提交次数 / Token 用量 / 估算花费」三个维度间切换；热力图下方固定一行显示
今日所有会话消耗的 Token 总数、缓存命中率，并按每次调用实际使用的模型
自动计算花费（USD，可配汇率显示 CNY）。

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com) ![dsh-plugin](https://img.shields.io/badge/dsh-plugin-%230a5cd8)

## 效果图

左侧栏热力图面板（浅色 / 深色模式）：

| 浅色 | 深色 |
| --- | --- |
| ![面板（浅色）](assets/panel-light.png) | ![面板（深色）](assets/panel-dark.png) |

设置页「插件」分区中的配置卡片（浅色 / 深色模式）：

| 浅色 | 深色 |
| --- | --- |
| ![设置卡片（浅色）](assets/settings-light.png) | ![设置卡片（深色）](assets/settings-dark.png) |

## 功能

- **近 90 天热力图**（固定窗口）：GitHub 贡献图式网格（周一至周日 × 按周
  分列），颜色深浅按所选维度分级（对数刻度）；鼠标悬停显示当日明细
  （提交数 / Token / 花费）。
- 维度切换：提交（所有 DSH 工作区 git 仓库，不含 merge）、Token（billed
  总量）、花费（按模型定价）。选择记忆在浏览器 localStorage。
- **统计块**（参考 Codex 个人资料页形态）：今日 Token 总量、今日缓存命中率
  （cacheRead / (cacheRead + cacheWrite + miss input)）、今日花费，以及
  近 90 天窗口的 Token / 提交 / 花费合计与今日按模型的花费细分。
- 常驻侧栏：面板常驻左侧栏**底部**（工作区列表下方），自愈式挂载（React
  重渲染后自动复位），可点击标题折叠，折叠状态持久化。
- 设置卡片：注册在设置页「插件」分区（settings.plugin.item），支持主题
  （蓝色 / 绿色）、enabled、includeMerges、USD→CNY 汇率配置；也支持插件行
  config。
- 数据来源：host 进程经官方 SDK 读取——sessionPersistence 列出全部会话
  并重放其 durable 日志（assistant/message 携带的 provider usage、
  request/header 与 request/context 携带的模型名），subprocess 跑
  git log 统计各工作区每日提交。聚合结果 TTL 缓存 60s，
  经 GET /activity-heatmap/stats 提供。

## 安装

    git clone https://github.com/283Gawin/dsh-heatmap
    cd dsh-heatmap
    pnpm install && pnpm build          # link 安装需要构建产物（lib/）
    dsh plugin --profile web add link:$PWD

或从 npm 发布版安装：

    dsh plugin --profile web add @linxin666/dsh-client-ui-activity-heatmap

重启 dsh web 后，左侧栏即出现热力图面板。

> **设置页暴露**：DSH 宿主对配置客户端可见的 settings namespace 有一个
> 白名单（`dsh-host-apiproxy` 的 `WEB_SETTINGS_NAMESPACES`，官方包内
> hardcode）。新插件必须把它的 namespace 加进该白名单，否则设置页卡片显示
> "Settings not available for this plugin."。本插件需要把
> `"activity-heatmap"` 追加到该数组；**升级 dsh 后该修改会被覆盖，需重新
> 打补丁**。修改后重启 dsh web 生效。

## 配置

设置页「插件 → 活动热力图」卡片可配置以下字段（等价于插件行 config）：

| 键 | 类型 | 默认 | 含义 |
| --- | --- | --- | --- |
| theme | string | blue | 热力图主题色：blue / green |
| enabled | boolean | true | 插件总开关 |
| includeMerges | boolean | false | 提交数是否计入 merge 提交 |
| usdCnyRate | number | 0 | USD→CNY 汇率，0 表示不显示人民币 |
| priceOverrides | 文本行 | {} | 模型定价覆盖（见下） |

插件行 config 示例：

    - insert:
        - id: ui-activity-heatmap
          name: '@linxin666/dsh-client-ui-activity-heatmap'
          config:
            theme: green
            usdCnyRate: 7.2
            priceOverrides:
              my-model:
                inputPerM: 0.5
                outputPerM: 2

修改后重启 dsh web 生效。

## 内置定价

内置表以厂商公开 API 定价为准（USD / 1M tokens），并按
[xiufengsun/TokenTracker](https://github.com/xiufengsun/TokenTracker) 的
curated price overrides 校准（2026-06/07 对照官方页验证）。DeepSeek 系按
官方页标注 cache_write = 输入价；Anthropic 系 cache_write 计费
（0.25 × 输入）；其余厂商通常无 write 附加费。

| 系列 | 模型 | 输入 | 缓存读 | 输出 |
| --- | --- | --- | --- | --- |
| DeepSeek | deepseek-v4-flash / deepseek-chat / deepseek-reasoner | 0.14 | 0.0028 | 0.28 |
| DeepSeek | deepseek-v4-pro | 0.435 | 0.003625 | 0.87 |
| DeepSeek | deepseek-v3 | 0.27 | 0.07 | 1.10 |
| DeepSeek | deepseek-v3.1 | 0.56 | 0.056 | 1.68 |
| DeepSeek | deepseek-v3.2 | 0.28 | 0.028 | 0.42 |
| DeepSeek | deepseek-r1 | 0.55 | 0.14 | 2.19 |
| Anthropic | claude-3-5-haiku | 0.80 | 0.08 | 4.00 |
| Anthropic | claude-3-5-sonnet / claude-3-7-sonnet / claude-sonnet-4 / claude-sonnet-4-5 / claude-sonnet-5 | 3.00 | 0.30 | 15.00 |
| Anthropic | claude-haiku-4-5 | 1.00 | 0.10 | 5.00 |
| Anthropic | claude-3-opus / claude-opus-4 / claude-opus-4-1 | 15.00 | 1.50 | 75.00 |
| Anthropic | claude-opus-4-8 / claude-opus-5 | 5.00 | 0.50 | 25.00 |
| Anthropic | claude-opus-5-fast / claude-fable-5 | 10.00 | 1.00 | 50.00 |
| OpenAI | gpt-4o / gpt-4o-mini | 2.50 / 0.15 | 1.25 / 0.075 | 10.00 / 0.60 |
| OpenAI | gpt-4.1 / mini / nano | 2.00 / 0.40 / 0.10 | 0.50 / 0.10 / 0.025 | 8.00 / 1.60 / 0.40 |
| OpenAI | o3 / o3-mini / o4-mini | 2.00 / 1.10 / 1.10 | 0.50 / 0.275 / 0.275 | 8.00 / 4.40 / 4.40 |
| OpenAI | gpt-5 / gpt-5.1 | 1.25 | 0.125 | 10.00 |
| OpenAI | gpt-5-mini / gpt-5.1-mini | 0.25 | 0.025 | 2.00 |
| OpenAI | gpt-5-nano / gpt-5.1-nano | 0.05 | 0.005 | 0.40 |
| OpenAI | gpt-5.6-sol | 5.00 | 0.50 | 30.00 |
| OpenAI | gpt-5.6-terra | 2.00 | 0.20 | 12.00 |
| OpenAI | gpt-5.6-luna | 0.20 | 0.02 | 1.20 |
| Google | gemini-2.5-pro | 1.25 | 0.3125 | 10.00 |
| Google | gemini-2.5-flash / gemini-3-flash-preview | 0.30 | 0.075 | 2.50 |
| Google | gemini-3-pro-preview | 2.00 | 0.50 | 12.00 |
| xAI | grok-3 / grok-4 / grok-4-latest / grok-code-reasoner | 3.00 | 0.75 | 15.00 |
| xAI | grok-4-fast / grok-code-fast | 0.20 | 0.05 | 0.50 |
| xAI | grok-4.5 / grok-4.5-build | 2.00 | 0.50 | 6.00 |
| xAI | grok-4.5-fast | 4.00 | 1.00 | 18.00 |
| xAI | grok-build | 1.25 | 0.20 | 2.50 |
| Kiro | kiro-agent / kiro-cli-agent | 3.00 | 0.30 | 15.00 |
| 阿里 | qwen3-max | 1.28 | 0.16 | 6.40 |
| 阿里 | qwen3-coder | 0.22 | 0.0275 | 0.88 |
| 智谱 | glm-4.5 / glm-4.6 / glm-4.7 | 0.60 | 0.11 | 2.20 |
| 智谱 | glm-4.5-air | 0.20 | 0.03 | 1.10 |
| 智谱 | glm-4.5-x | 2.20 | 0.45 | 8.90 |
| 智谱 | glm-5 / glm-5-turbo / glm-5.1 / glm-5.2 | 1.00 / 1.20 / 1.40 / 1.40 | 0.20 / 0.24 / 0.26 / 0.26 | 3.20 / 4.00 / 4.40 / 4.40 |
| Moonshot | kimi-k2 / k2-thinking / k2.5 | 0.60 | 0.15 | 2.00 |
| Moonshot | kimi-k2.6 | 0.95 | 0.16 | 4.00 |
| Moonshot | kimi-k2.7-code | 0.95 | 0.19 | 4.00 |
| Moonshot | kimi-k3 | 3.00 | 0.30 | 15.00 |
| MiniMax | minimax-m1 / m2 | 0.20 / 0.30 | 0.025 / 0.0375 | 1.10 / 1.20 |
| MiniMax | minimax-m2.1 | 0.50 | 0.05 | 3.00 |
| MiniMax | minimax-m2.7 / minimax-m3 | 0.30 | 0.06 | 1.20 |
| 腾讯 | hy3 / hy3-preview / hy3-preview-agent | 0.167 | 0.056 | 0.556 |
| 其他 | sakana/fugu-ultra | 5.00 | 0.50 | 30.00 |
| 其他 | longcat-2.0 | 0.278 | 0.00556 | 1.111 |
| 其他 | step-3.5-flash / step-3.7-flash | 0.10 / 0.20 | 0.02 / 0.04 | 0.30 / 1.15 |
| 免费档 | glm-4.5-flash / glm-4.7-flash / glm-4.7-free / kimi-k2.5-free / minimax-m2.1-free / mimo-v2-pro-free / nemotron-3-super-free / grok-build-free | 0 | 0 | 0 |

模型 id 支持**前缀匹配**：带日期快照后缀的 id（如 claude-sonnet-4-5-20250929）
自动落到基础行；覆盖（priceOverrides）同样支持前缀匹配。未收录的模型按
默认档（0.27 / 0.07 / 1.10）计价，可用 priceOverrides 精确覆盖。

## 开发

    pnpm install
    pnpm typecheck
    pnpm test
    pnpm build

## License

MIT
