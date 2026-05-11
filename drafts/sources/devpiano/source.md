# devpiano 项目写作资料包

> 生成时间：2026-05-11
> 来源仓库：G:/source/repos/devpiano
> 状态：初稿，需要人工确认部分标注为 [待确认]

---

## 1. 项目基本信息

| 字段        | 内容                                 |
| ----------- | ------------------------------------ |
| 项目名称    | devpiano                             |
| GitHub 仓库 | https://github.com/0xnayuta/devpiano |
| 当前版本    | v0.1.1                               |
| Star 数     | [待查证]                             |
| 发布时间    | v0.1.0 / v0.1.1 均于 2025-05-06 发布 |
| 许可证      | AGPLv3（v0.1.1 起从 GPLv3 升级）     |

**项目类型**：基于 JUCE 的现代 C++ 音频/MIDI 桌面应用

**主要技术栈**：

| 技术                         | 用途              | 备注                                    |
| ---------------------------- | ----------------- | --------------------------------------- |
| C++20                        | 核心开发语言      | -                                       |
| JUCE                         | 音频框架          | 作为子模块引入，禁止修改                |
| CMake + Ninja                | 构建系统          | -                                       |
| MSVC (Windows) / Clang (WSL) | 编译器            | WSL 主工作树 + Windows 镜像树混合工作流 |
| JSON                         | 配置文件/演奏文件 | JUCE 内置支持                           |
| VST3                         | 插件格式          | 当前唯一支持的插件格式                  |

---

## 2. 项目背景

> [待确认] 以下背景内容部分基于 README 和文档整理，部分基于用户提示。请人工确认准确性。

devpiano 是一个**独立发起**的开源项目，目标是让电脑键盘重新变成一架可以演奏的钢琴。

**重新设计而非简单复刻**：

- 项目**从零设计架构**，使用 JUCE 框架重新实现键盘钢琴的核心能力
- 不是直接 fork 或维护旧 FreePiano 项目
- 也不依赖任何现成的键盘钢琴工具

**灵感来源**：

- 受到 FreePiano 等旧项目的启发，但**不是简单复刻**
- FreePiano 是 Windows 平台的老旧应用，基于原生 Windows API 开发
- 希望用现代化的工程方式重新组织类似能力

**重新设计的原因**：

- 旧版 FreePiano 的代码结构不适合直接维护
- 原生 WASAPI / ASIO / DirectSound 后端缺乏跨平台抽象
- 旧式 VST 宿主逻辑和 Windows GDI GUI 难以与现代开发流程衔接
- 希望建立更简洁、现代、可持续演进的项目架构

**项目定位**：

- 当前版本 (v0.1.1) 是第一个计划中的 Windows x64 发布候选版本
- Linux 版本尚未提供，仍是未来验证目标

---

## 3. 项目目标

### 已完成目标

| 目标              | 状态      | 说明                                          |
| ----------------- | --------- | --------------------------------------------- |
| 电脑键盘演奏      | ✅ 已完成 | 键盘映射到 MIDI note                          |
| 外部 MIDI 输入    | ✅ 已完成 | 支持外部 MIDI 设备输入                        |
| VST3 插件宿主     | ✅ 已完成 | 扫描、加载、编辑、卸载 VST3 插件              |
| 录制与回放        | ✅ 已完成 | 录制演奏事件并回放                            |
| MIDI 文件导入     | ✅ 已完成 | 导入外部 MIDI 文件并回放                      |
| MIDI 文件导出     | ✅ 已完成 | 将录制导出为 .mid 文件                        |
| WAV 导出          | ✅ 已完成 | fallback synth 离线渲染（不含插件）           |
| 演奏文件保存/打开 | ✅ 已完成 | .devpiano 格式，JSON 格式                     |
| 播放速度控制      | ✅ 已完成 | 0.5x - 2.0x 速度调节                          |
| 布局 Preset       | ✅ 已完成 | 保存、导入、重命名、删除布局预设              |
| MIDI 导入增强     | ✅ 已完成 | 支持 CC64 sustain、pitch bend、program change |
| Diagnostics 层    | ✅ 已完成 | 统一日志和 MIDI trace 接口                    |

### 计划中/搁置目标

| 目标                           | 状态       | 说明            |
| ------------------------------ | ---------- | --------------- |
| 最近文件列表 + 拖拽打开        | 暂缓       | Phase 6-3       |
| 基础 MIDI 编辑（delete notes） | 暂缓       | Phase 6-4       |
| VST3 插件离线渲染              | 搁置       | Phase 3-2，后置 |
| 外部 MIDI 硬件验证             | 待条件恢复 | 缺少硬件设备    |
| 多轨支持                       | 粗略规划   | Phase 7         |
| Piano roll / 事件编辑器 UI     | 粗略规划   | Phase 8         |
| 多语言 UI                      | 粗略规划   | Phase 8         |
| MP4 视频导出                   | 粗略规划   | Phase 8         |

---

## 4. 技术路线

### 核心架构替代方向

| 旧 FreePiano                | devpiano 新方案                                         |
| --------------------------- | ------------------------------------------------------- |
| WASAPI / ASIO / DirectSound | JUCE `AudioDeviceManager`                               |
| 旧 VST SDK 宿主             | JUCE `AudioPluginFormatManager` / `AudioPluginInstance` |
| Windows 键盘输入逻辑        | JUCE `KeyListener` / `KeyPress` + 项目内键盘映射        |
| Windows GDI / 原生控件 UI   | JUCE `Component` 树                                     |
| 旧配置系统                  | JUCE `ApplicationProperties` / `ValueTree`              |

### 开发环境

| 组件     | 说明                                                      |
| -------- | --------------------------------------------------------- |
| 主工作树 | WSL（代码编辑 + clangd/LSP + compile_commands.json 刷新） |
| 镜像树   | Windows（MSVC 验证构建 + 软件测试）                       |
| 构建系统 | CMake + Ninja                                             |
| 编译器   | WSL: Clang / Windows: MSVC (VS 2026)                      |
| 脚本     | `./scripts/dev.sh`（环境自检、同步、构建）                |

### 目录结构

```
devpiano/
├── source/              # 当前 JUCE 主实现目录
│   ├── Audio/           # AudioEngine
│   ├── Core/            # 核心类型（KeyMapTypes, MidiTypes, AppState）
│   ├── Diagnostics/     # DebugLog, MidiTrace
│   ├── Export/          # ExportFlowSupport
│   ├── Input/           # KeyboardMidiMapper
│   ├── Layout/          # LayoutFlowSupport
│   ├── Midi/           # MidiRouter
│   ├── Plugin/          # PluginHost, PluginOperationController
│   ├── Recording/      # RecordingEngine, MidiFileExporter/Importer
│   ├── Settings/       # SettingsModel, SettingsStore
│   ├── UI/             # HeaderPanel, PluginPanel, ControlsPanel, KeyboardPanel
│   ├── Main.cpp
│   └── MainComponent.*
├── JUCE/               # JUCE 框架子模块（禁止修改）
├── freepiano-src/      # 旧版 FreePiano 源码（仅作迁移参考）
├── docs/               # 项目文档
├── scripts/            # 开发脚本
└── build-wsl-clang/   # WSL 本地构建目录
```

---

## 5. 已实现功能

### 5.1 核心演奏功能

- [x] **电脑键盘触发 MIDI note** — 键盘映射到 MIDI note on/off，驱动 VST3 插件或 fallback synth 发声
  - 证据来源：`source/Input/KeyboardMidiMapper.*`，`docs/features/phase2-keyboard-mapping.md`
- [x] **外部 MIDI 输入支持** — 打开外部 MIDI 设备并转发到引擎
  - 证据来源：`source/Midi/MidiRouter.*`
- [x] **虚拟钢琴键盘显示** — 实时显示按键状态
  - 证据来源：`source/UI/KeyboardPanel.*`
- [x] **内置 fallback synth** — 无插件时保持最小发声能力
  - 证据来源：`source/Audio/AudioEngine.*`

### 5.2 插件系统

- [x] **VST3 插件扫描** — 扫描指定目录的 VST3 插件并列出名称
  - 证据来源：`source/Plugin/PluginHost.*`，`docs/features/phase2-plugin-hosting.md`
- [x] **插件加载/卸载/editor** — 加载、卸载插件，打开插件编辑器窗口
  - 证据来源：`source/Plugin/PluginHost.*`
- [x] **插件路径持久化与恢复** — 启动时恢复上次插件和扫描路径
  - 证据来源：`source/Settings/SettingsStore.*`
- [x] **扫描进度反馈** — 分片扫描实时显示进度
  - 证据来源：`docs/features/phase2-plugin-hosting.md` § Phase 2-5

### 5.3 录制与回放

- [x] **演奏录制** — 录制电脑键盘和外部 MIDI 输入产生的演奏事件
  - 证据来源：`source/Recording/RecordingEngine.*`，`docs/features/phase3-recording-playback.md`
- [x] **演奏回放** — 按录制时间线回放事件
  - 证据来源：`source/Recording/RecordingEngine.*`，`docs/features/phase3-recording-playback.md`
- [x] **MIDI 文件导出** — 导出录制为 .mid 文件
  - 证据来源：`source/Recording/MidiFileExporter.*`
- [x] **WAV 离线渲染** — fallback synth 离线渲染（不含插件）
  - 证据来源：`source/Recording/WavFileExporter.*`，`docs/features/phase3-recording-playback.md` § Phase 3-1

### 5.4 演奏文件持久化

- [x] **.devpiano 文件保存/打开** — JSON 格式演奏文件
  - 证据来源：`docs/features/phase6-performance-persistence.md` § Phase 6-1
- [x] **播放速度控制** — 0.5x 到 2.0x 速度调节，实时生效
  - 证据来源：`docs/features/phase6-performance-persistence.md` § Phase 6-2
- [x] **MIDI 导入增强** — 支持 CC64 sustain、pitch bend、program change
  - 证据来源：`docs/features/phase6-performance-persistence.md` § Phase 6-5

### 5.5 布局与设置

- [x] **布局 Preset** — 保存、导入、重命名、删除、启动恢复
  - 证据来源：`source/Layout/LayoutFlowSupport.*`，`docs/features/phase3-layout-presets.md`
- [x] **音频设备设置持久化** — 采样率、缓冲区、设备选择
  - 证据来源：`source/Settings/SettingsStore.*`
- [x] **主窗口尺寸恢复** — 关闭前保存、启动时恢复窗口尺寸
  - 证据来源：`docs/roadmap/roadmap.md` § Phase 4

### 5.6 工程基础设施

- [x] **Diagnostics 最小层** — 统一日志（DP_LOG_INFO/WARN/ERROR）和 MIDI trace（DP_TRACE_MIDI）
  - 证据来源：`source/Diagnostics/DebugLog.*`，`source/Diagnostics/MidiTrace.*`，`docs/features/phase6-performance-persistence.md` § Phase 6-6
- [x] **MIDI/Performance 测试夹具** — 7 个 MIDI fixture + 1 个 .devpiano fixture
  - 证据来源：`docs/testing/fixtures/midi/`，`docs/testing/fixtures/performance/`，`docs/features/phase6-performance-persistence.md` § Phase 6-7

### 5.7 不确定 / 需要确认的功能

- [ ] **外部 MIDI 录制验证** — 外部 MIDI 硬件依赖验证因缺少设备暂缓，状态记录于 `docs/testing/known-issues.md`
- [ ] **特定 VST3 插件兼容性** — 不同插件在 buffer size / sample rate 调整下的行为存在后端语义差异

---

## 6. 关键开发阶段

### Phase 1：工程骨架与最小演奏（Phase 1-1-Phase 1-2）

**状态**：已完成

**关键里程碑**：

- JUCE GUI 程序可启动，音频设备可初始化
- 电脑键盘可触发 note on / note off，虚拟钢琴键盘可联动显示
- 程序可发声，来源为内置 fallback synth 或已加载插件

**相关文档**：`docs/roadmap/roadmap.md` § Phase 1

---

### Phase 2：插件系统与键盘映射（Phase 2）

**状态**：已完成

**关键里程碑**：

- VST3 插件扫描、加载、卸载、editor 窗口完整
- 键盘映射系统可配置，支持默认布局和自定义 Preset
- Phase 2-5（已完成）：扫描 UX 增强 — 分片扫描进度反馈、扫描中状态区分、Enter 键加载、失败列表可发现性

**相关文档**：

- `docs/features/phase2-keyboard-mapping.md`
- `docs/features/phase2-plugin-hosting.md`
- `docs/testing/phase2-keyboard-mapping.md`
- `docs/testing/phase2-plugin-host-lifecycle.md`

---

### Phase 3：UI 与高级功能（Phase 3）

**状态**：已完成

**关键里程碑**：

- UI 拆分为头部、插件、参数、键盘等区域
- 布局 Preset 系统（JSON 格式、自动发现、导入/保存/重命名/删除）
- 录制/回放/MIDI 导出/WAV 离线渲染 MVP

**相关文档**：

- `docs/features/phase3-layout-presets.md`
- `docs/features/phase3-recording-playback.md`
- `docs/testing/phase3-layout-presets.md`
- `docs/testing/phase3-recording-playback.md`

---

### Phase 4：MIDI 文件导入（Phase 4）

**状态**：已完成

**关键里程碑**：

- MIDI 文件导入、自动选轨、回放、虚拟键盘可视化
- 最近路径记忆、主窗口尺寸自适应与恢复

**相关文档**：

- `docs/features/phase4-midi-file-import.md`
- `docs/testing/phase4-midi-file-import.md`

---

### Phase 5：架构收敛与 MainComponent 瘦身

**状态**：已完成

**关键里程碑**：

- Phase 5.1-5.7：录制会话状态结构化、导出流程统一、布局 CRUD 收敛、设置窗口生命周期收敛、MIDI 导入流程下沉
- Phase 5.8a-5.8e：
  - 5.8a：布局管理 handlers 提取（MainComponent 1587→1349 行）
  - 5.8b：录制/回放/MIDI 导入编排提取（1349→930 行）
  - 5.8c：插件操作提取（930→711 行）
  - 5.8d：设置窗口管理提取（711→631 行）
  - 5.8e：状态快照构建提取（631→606 行）
- **累计减少 981 行，远低于 1200 行目标**

**相关文档**：`docs/archive/phase5-architecture-convergence.md`

---

### Phase 6：演奏数据持久化与播放体验增强

**状态**：进行中（6-1、6-2、6-5、6-6、6-7 已完成）

**已完成子阶段**：
| 子阶段 | 状态 | 说明 |
|--------|------|------|
| Phase 6-1 | ✅ 已完成 | 演奏文件保存/打开（.devpiano） |
| Phase 6-2 | ✅ 已完成 | 播放速度控制（0.5x-2.0x） |
| Phase 6-5 | ✅ 已完成 | MIDI 导入增强（sustain/pitch bend/program change） |
| Phase 6-6 | ✅ 已完成 | Diagnostics 最小层 |
| Phase 6-7 | ✅ 已完成 | MIDI/Performance 测试夹具与最小回归样本库 |

**暂缓子阶段**：
| 子阶段 | 状态 | 说明 |
|--------|------|------|
| Phase 6-3 | 暂缓 | 最近文件列表 + 拖拽打开 |
| Phase 6-4 | 暂缓 | 基础 MIDI 编辑（delete notes） |

**相关文档**：

- `docs/features/phase6-performance-persistence.md`
- `docs/testing/phase6-performance-persistence.md`

---

## 7. 遇到的问题与踩坑

> 以下内容整理自文档和 AGENTS.md，需要人工确认是否准确

### 7.1 开发环境挑战

- **WSL + Windows 混合工作流**：代码编辑在 WSL，验证构建在 Windows MSVC，需要目录同步机制
  - 解决：建立镜像树和同步脚本
  - 证据：`docs/development/wsl-windows-msvc-workflow.md`

- **JUCE 子模块管理**：JUCE 作为 git 子模块引入，禁止修改
  - 影响：需要理解 JUCE API 边界，不能直接修改框架代码
  - 证据：`AGENTS.md` § 禁止修改 `/JUCE/`

### 7.2 架构设计问题

- **MainComponent 膨胀**：初始 MainComponent 约 1587 行，职责过于集中
  - 解决：通过 Phase 5.8a-5.8e 逐步拆分职责到专门模块
  - 结果：从 1587 行降至 606 行，减少 981 行
  - 证据：`docs/roadmap/roadmap.md` § Phase 5

- **音频设备初始化顺序问题**：
  - 启动/音频重建早期首音音高异常
  - 解决：修正音频设备初始化顺序，保留 25ms audio warmup
  - 证据：`docs/testing/known-issues.md` §2

### 7.3 回放与录制边界

- **MIDI 导入播放首音无声**：
  - 问题：导入 MIDI 后回放时第一个音没有声音
  - 解决：增加 playback-start pre-roll / arming
  - 证据：`docs/testing/known-issues.md` §8

- **采样率差异处理**：
  - 录制和回放时设备采样率可能不同
  - 解决：使用 `playbackSampleRateRatio = currentSampleRate / take.sampleRate` 换算
  - 证据：`docs/features/phase3-recording-playback.md` § 回放设计

### 7.4 日志与调试

- **散落 Logger 问题**：项目中曾有分散的 `juce::Logger::writeToLog` 调用
  - 解决：统一替换为 `DP_LOG_*` 系列宏（Phase 6-6）
  - 证据：`docs/features/phase6-performance-persistence.md` § Phase 6-6

- **Debug/Release 边界**：`DP_DEBUG_LOG` 和 `DP_TRACE_MIDI` 在 Release 下无输出
  - 证据：`docs/features/phase6-performance-persistence.md` § Phase 6-6

### 7.5 旧代码迁移

- **不能直接复刻旧实现**：`freepiano-src/` 只作为迁移参考，不能直接复制平台绑定实现
  - 原则：提炼行为、重建设计
  - 证据：`AGENTS.md` § 旧代码迁移规则

### 7.6 尚未解决/待观察

- **外部 MIDI 硬件验证**：因缺少设备暂缓
  - 证据：`docs/testing/known-issues.md`
- **特定 VST3 插件退出阶段 Debug 告警**：持续观察中
  - 证据：`docs/features/phase2-plugin-hosting.md`
- **Phase 4-6 merge-all**：已搁置
  - 证据：`docs/roadmap/roadmap.md`

---

## 8. 代表性文件

### 文档类

| 文件路径                                          | 用途                                                |
| ------------------------------------------------- | --------------------------------------------------- |
| `README.md`                                       | 项目概览、快速开始、构建说明                        |
| `AGENTS.md`                                       | AI Agent 开发指南，包含目录职责、架构要求、开发规则 |
| `docs/README.md`                                  | 文档入口，按职责分层                                |
| `docs/roadmap/roadmap.md`                         | 项目状态、阶段路线、唯一权威来源                    |
| `docs/roadmap/current-iteration.md`               | 当前迭代任务入口                                    |
| `docs/architecture/overview.md`                   | 系统架构、模块职责、主运行链路                      |
| `docs/features/phase2-keyboard-mapping.md`        | 键盘映射功能说明                                    |
| `docs/features/phase2-plugin-hosting.md`          | 插件宿主功能说明                                    |
| `docs/features/phase3-recording-playback.md`      | 录制/回放/导出设计                                  |
| `docs/features/phase3-layout-presets.md`          | 布局 Preset 设计                                    |
| `docs/features/phase4-midi-file-import.md`        | MIDI 文件导入设计                                   |
| `docs/features/phase6-performance-persistence.md` | 演奏文件持久化设计（Phase 6 全部子阶段）            |
| `docs/decisions/*.md`                             | 已确定的架构决策记录（ADR）                         |
| `docs/testing/acceptance.md`                      | 阶段验收标准                                        |
| `docs/testing/known-issues.md`                    | 已知问题、已修复风险的回归项                        |
| `docs/testing/fixtures/`                          | 测试夹具目录（MIDI fixtures + performance fixture） |

### 源码类

| 文件路径                                        | 用途                             |
| ----------------------------------------------- | -------------------------------- |
| `source/MainComponent.*`                        | 主装配层，协调各模块             |
| `source/Audio/AudioEngine.*`                    | 音频引擎，汇总 MIDI 到插件/synth |
| `source/Input/KeyboardMidiMapper.*`             | 键盘到 MIDI 的映射               |
| `source/Midi/MidiRouter.*`                      | 外部 MIDI 输入路由               |
| `source/Plugin/PluginHost.*`                    | VST3 插件宿主                    |
| `source/Recording/RecordingEngine.*`            | 录制与回放引擎                   |
| `source/Recording/MidiFileExporter.*`           | MIDI 文件导出                    |
| `source/Recording/MidiFileImporter.*`           | MIDI 文件导入                    |
| `source/Diagnostics/DebugLog.*`                 | 统一日志接口                     |
| `source/Diagnostics/MidiTrace.*`                | MIDI 消息 trace 工具             |
| `source/Core/AppState.*`                        | 应用状态模型                     |
| `source/Layout/LayoutFlowSupport.*`             | 布局管理流程                     |
| `source/Recording/RecordingSessionController.*` | 录制会话控制器                   |
| `source/Plugin/PluginOperationController.*`     | 插件操作控制器                   |
| `source/Settings/SettingsWindowManager.*`       | 设置窗口管理                     |
| `source/Core/AppStateBuilder.*`                 | 状态快照构建器                   |

### 工具类

| 文件路径            | 用途                               |
| ------------------- | ---------------------------------- |
| `scripts/dev.sh`    | 开发环境自检、WSL/Windows 构建脚本 |
| `CMakeLists.txt`    | CMake 主配置                       |
| `CMakePresets.json` | CMake 预设配置                     |
| `.clangd`           | clangd LSP 配置                    |

---

## 9. 可展开的文章选题

### 选题 1：我为什么开始做 devpiano

**说明**：讲述从 FreePiano 用户到开源项目发起人的心路历程，为什么要让电脑键盘重新变成钢琴。

**潜在内容**：

- 个人练琴需求
- FreePiano 带来的灵感
- 为什么不直接 fork 或继续维护旧项目
- 为什么选择 JUCE + CMake + C++20

---

### 选题 2：如何用 C++ / JUCE 做一个电脑键盘钢琴

**说明**：技术向，介绍核心实现原理，包括键盘捕获、MIDI 映射、音频输出。

**潜在内容**：

- JUCE KeyListener 捕获键盘事件
- KeyboardMidiMapper 将 key code 映射到 MIDI note
- AudioEngine 的 MIDI → 音频链路
- fallback synth 作为默认声音源

---

### 选题 3：我的第一个开源项目是如何被 AI Agent 辅助开发的

**说明**：分享 AI Agent 辅助开发 devpiano 的经验，包括工作流、工具、注意事项。

**潜在内容**：

- WSL 主工作树 + Windows 镜像树 + AI Agent 协作模式
- 如何让 AI 理解 JUCE/C++ 项目结构
- Prompt 模板和 AGENTS.md 的作用
- AI 辅助 vs 人工把关的边界

---

### 选题 4：从 FreePiano 到 devpiano：旧项目启发与现代化重构

**说明**：对比分析旧 FreePiano 和新 devpiano 的架构差异，说明为什么需要从零重构。

**潜在内容**：

- 旧架构问题：Windows 原生 API、分散的宏式设计、平台绑定
- 新架构选择：JUCE 抽象、模块化拆分、CMake 构建
- 迁移原则：提炼行为而非复刻实现
- 旧代码只作参考，不直接搬运

---

### 选题 5：devpiano 的录制与回放设计

**说明**：深入介绍录制回放系统的设计，包括数据模型、时间线处理、采样率差异处理。

**潜在内容**：

- PerformanceEvent / RecordingTake 数据模型
- sample-based timeline 的优势
- 回放事件重新注入 AudioEngine 链路
- 采样率变化时的 playbackSampleRateRatio 换算

---

### 选题 6：为什么我要为个人项目建立 Diagnostics 层

**说明**：介绍 Phase 6-6 Diagnostics 最小层的实现动机和设计决策。

**潜在内容**：

- 散落 Logger 的问题
- DP*LOG*\* / DP_TRACE_MIDI 接口设计
- Debug/Release 条件编译策略
- 如何避免字符串编码问题（UTF-8 vs ASCII）

---

### 选题 7：devpiano Phase 5 架构收敛：MainComponent 从 1587 行到 606 行

**说明**：记录 MainComponent 瘦身的全过程，展示模块化拆分的思路。

**潜在内容**：

- 为什么要拆分 MainComponent
- 5.8a-5.8e 各个切片的边界设计
- LayoutFlowSupport、RecordingSessionController、PluginOperationController 等模块的职责
- 拆分后的边界纪律

---

### 选题 8：.devpiano 文件格式设计：JSON 用于演奏数据持久化

**说明**：介绍演奏文件格式的设计决策，包括 JSON 格式选择、版本策略、与 .mid 的定位差异。

**潜在内容**：

- 为什么不直接用 .mid
- JSON vs 二进制格式的权衡
- version 字段和向后兼容策略
- sample-accurate 时间戳 vs MIDI tick 的精度差异

---

## 10. 事实边界

以下信息**不能编造**，必须查证或标注为 [待确认]：

### 必须查证的数据

- [ ] **Star 数**：必须查 GitHub 页面
- [ ] **Fork 数**：必须查 GitHub 页面
- [ ] **下载量/安装量**：如有统计必须查证
- [ ] **用户数量**：需要人工提供，无法从公开数据得知

### 必须标注为 [待确认] 的信息

- [ ] 项目背景中"独立发起"的描述是否准确？
- [ ] "受到 FreePiano 等旧项目启发"：需要确认是否还有其他灵感来源
- [ ] "想让电脑键盘重新变成一架可以演奏的钢琴"：需要确认是否准确表达了初衷
- [ ] 开发过程中的具体踩坑细节：需要确认是否有更完整的记录

### 不能编造的技术结论

- [ ] 所有版本号必须与 CHANGELOG.md 一致（当前：v0.1.0 / v0.1.1）
- [ ] 所有已完成功能必须有文档或源码依据
- [ ] 所有"计划中"功能必须标注状态
- [ ] 所有"搁置"功能必须标注搁置原因

### 不能混淆的状态

- [ ] **已完成 vs 进行中 vs 计划中**：必须严格区分
- [ ] **Phase 6-3/6-4**：明确标注为暂缓
- [ ] **外部 MIDI 硬件验证**：明确标注为待条件恢复
- [ ] **VST3 插件离线渲染**：明确标注为搁置（Phase 3-2）

---

## 11. 需要人工确认的问题

### Checklist

请确认以下信息是否准确：

- [ ] **项目名称**：devpiano
- [ ] **GitHub 仓库地址**：https://github.com/0xnayuta/devpiano（请确认）
- [ ] **当前版本**：v0.1.1（2025-05-06）
- [ ] **Star 数**：[请查证]
- [ ] **Fork 数**：[请查证]

### 背景确认

- [ ] devpiano 是你的**独立发起**的开源项目吗？（不是 fork 或参与已有项目）
- [ ] 项目的核心动机是"让电脑键盘重新变成一架可以演奏的钢琴"吗？
- [ ] FreePiano 是唯一的灵感来源，还是还有其他项目？
- [ ] 为什么选择 JUCE 而不是其他框架（如 SDL_mixer、Web Audio API 等）？
- [ ] 为什么选择 C++ 而不是其他语言（如 Rust、Python 等）？

### 踩坑确认

- [ ] 开发过程中最大的技术挑战是什么？
- [ ] 有没有文档中没有记录但值得分享的踩坑经历？
- [ ] AI Agent 辅助开发过程中有什么特别的经验或教训？

### 未来计划确认

- [ ] 是否有明确的 v0.2.0 计划？
- [ ] Linux 版本是否有具体的时间表？
- [ ] 是否有考虑过移动端支持？

### 文章选题确认

- [ ] 上述 8 个选题中，哪些是你真正想写的？
- [ ] 有没有遗漏的选题？
- [ ] 哪个选题最适合作为第一篇？

---

## 12. 参考资料

- devpiano GitHub 仓库：https://github.com/0xnayuta/devpiano
- JUCE 官方文档：https://juce.com/discover/
- FreePiano（参考项目）：https://freepiano.github.io/
- 本博客写作流程：`docs/writing/blog-agent-workflow.md`
- 资料包模板：`docs/writing/source-package-template.md`
- 事实检查规则：`docs/writing/fact-check-rules.md`

---

## 修改记录

| 日期       | 修改内容 |
| ---------- | -------- |
| 2026-05-11 | 初稿创建 |
