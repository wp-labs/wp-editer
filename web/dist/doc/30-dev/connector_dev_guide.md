# Connector 实现指南

## 架构总览
- 运行时通过 `connectors/registry` 维护 Source/Sink Factory 的注册表，利用 `OnceCell + RwLock` 管理工厂实例，并在 `register_*` 时记录调用位置，方便诊断（`src/connectors/registry.rs:1-99`）。
- 应用启动时统一调用 `connectors/startup::init_runtime_registries`：它一次性注册内置 Sink（file/syslog/tcp/test_rescue/blackhole）与 Source（syslog/tcp/file），随后打印最终的 kind 列表，确保外部动态工厂也可追踪（`src/connectors/startup.rs:1-42`）。
- 若还需桥接 `ConnectorKindAdapter`，使用 `connectors/adapter.rs` 中的注册表；在 engine 内注册后，后续组件都能通过 kind 查到各自的 adapter（`src/connectors/adapter.rs:1-43`）。

```
         ┌────────────────────────────────────┐
         │     wp_connector_api (Traits)     │
         │ ┌───────────────────────────────┐ │
         │ │ SourceFactory / SinkFactory   │ │
         │ │ DataSource / Async* traits    │ │
         │ └───────────────────────────────┘ │
         └────────────────────────────────────┘
                         │ 实现
                         ▼
 ┌─────────────────────────────────────────────────────────────┐
 │              具体 Source / Sink 实现 (wp-engine)            │
 │ ┌─────────────────────────────────────────────────────────┐ │
 │ │ FileSourceSpec ──► FileSourceFactory ──► FileSource     │ │
 │ │ TcpSourceSpec  ──► TcpSourceFactory  ──► TcpSource      │ │
 │ │ SyslogSourceSpec ─► SyslogFactory     ─► Tcp/Udp Source │ │
 │ │ TcpSinkSpec    ──► TcpFactory         ─► TcpSink        │ │
 │ └─────────────────────────────────────────────────────────┘ │
 └─────────────────────────────────────────────────────────────┘
                         │ 注册
                         ▼
           ┌───────────────────────────────────┐
           │ connectors::registry / startup    │
           │  • register_*_factory(...)        │
           │  • log_registered_kinds()         │
           └───────────────────────────────────┘
                         │ 提供统一入口
                         ▼
           ┌───────────────────────────────────┐
           │ runtime / orchestrator            │
           │  读取 kind → 获取 Factory → Build │
           └───────────────────────────────────┘
```

## 必须实现的 Trait
- **SourceFactory/SinkFactory**：来自 `wp_connector_api`。工厂需实现 `kind(&self)`, `validate_spec(&self, &Resolved*Spec)` 与 `build(&self, &Resolved*Spec, &*Ctx)`。示例参见 `src/sources/file/factory.rs:65-123` 与 `src/sinks/backends/tcp.rs:240-259`。
- **DataSource**：Source 运行时实现 `DataSource` trait，提供 `receive/try_receive/can_try_receive/identifier` 等接口；`FileSource` 在 `src/sources/file/source.rs` 展示了如何在 `receive` 中返回批次并在 `stop` 时清理。
- **AsyncCtrl/AsyncRecordSink/AsyncRawDataSink**：Sink 运行时需实现这些异步 trait 以接收结构化记录和原始字符串；`TcpSink` 在 `src/sinks/backends/tcp.rs:62-215` 给出了完整实现（含批量方法）。
- **可选：ConnectorKindAdapter**：若需要在运行时动态选择不同工厂组合，实现 `wp_connector_api::ConnectorKindAdapter` 并通过 `connectors/adapter.rs` 注册；适用于同一 kind 在不同部署模式下映射到不同底层实现。
- **工程工具（wp-proj）一致性**：`crates/wp-proj` 中的 `Sources`、`Sinks`、`Wpl`、`Oml` 管理器会读取 `EngineConfig`（即 `conf/wparse.toml`）中的 `src_root`/`sink_root`/`rule_root`/`oml_root`，因此 connector 初始化必须保证这些路径正确。wp-proj 的 CLI 在调用 `init/check` 时直接依赖这些路径，无需再手工推断目录。

## Source/Sink 实现步骤
1. **先建立静态 Spec**：
   - 在 Source 端，以 `FileSourceSpec` 为例，它负责从 `ResolvedSourceSpec` 中提取路径/编码/实例数并完成参数校验；`validate_spec` 与 `build` 都仅调用 `from_resolved`，防止重复解析（`src/sources/file/factory.rs:15-123`）。
   - 在 Sink 端同理，`TcpSinkSpec` 负责提取地址/端口/分帧信息并校验布尔开关；后续连接逻辑只接收 `TcpSinkSpec`，避免直接访问动态 Map（`src/sinks/backends/tcp.rs:18-105`）。
2. **在 `validate_spec` 中仅做转换**：始终让 `validate_spec` 里只调用一次 `Spec::from_*`，把所有错误统一转成 `SourceReason::from_conf` 或 `SinkError`，确保 CLI/控制面可以直接提示参数问题（`src/sources/file/factory.rs:73-82`、`src/sinks/backends/tcp.rs:240-259`）。
3. **在 `build` 中复用静态 Spec**：`build` 里禁止再次从 `params` 中取值，直接使用 Spec 产物，并在需要时注入上下文（如 `SourceBuildCtx` 的路径/副本信息或 `SinkBuildCtx` 的限速值）。
4. **注册工厂**：实现完成后，在相应模块提供 `register_*` 函数并在 `connectors/startup` 中调用。FileSource 通过 `register_factory_only` 注册到全局表，是最简示例（`src/sources/file/factory.rs:126-129`）。
5. **保持日志可读**：网络类实现应在首次连接、首个包、错误等关键点打印 `info!`/`warn!`（可参考 `TcpSink::connect` 与 `SyslogSourceFactory` 中的日志调用）。
6. **确保 EngineConfig 可解析**：因为 wp-proj 的管理命令和 CLI 检查都直接加载 `conf/wparse.toml` 来定位 `topology`/`models` 路径，connector 的默认模板、示例配置必须与 EngineConfig 中的路径保持一致。一旦添加新的默认目录或模板，需要同步更新 `wparse.toml` 示例和 `EngineConfig::init` 的默认字段。

## 参数校验与 Spec 转换建议
- **一次性检查**：尽量用 `anyhow::ensure!` 或模式匹配在 Spec 构造时完成所有合法性检查，再把 `anyhow::Error` 映射回连接器的 `Reason`（示例：`TcpSourceSpec::from_params` 对端口/缓冲区/帧模式/实例数的校验，见 `src/sources/tcp/config.rs:4-63`）。
- **集中处理布尔或枚举参数**：布尔开关使用 `as_bool()` 并在 Spec 层给出默认值；枚举按 `to_ascii_lowercase()` 匹配，防止大小写问题（示例：`SyslogSourceSpec` 中的 `protocol` 和 `header_mode`，见 `src/sources/syslog/config.rs:7-74`）。
- **先校验标签**：Source 实现通常需要在 `validate_spec` 开头调用 `wp_data_model::tags::validate_tags`，并在 `build` 时通过 `parse_tags` 生成 `TagSet`（`src/sources/file/factory.rs:73-123`）。

## 启动与诊断
- **集中注册**：确保新工厂的 `register_*` 在 `connectors/startup::init_runtime_registries` 中被调用，否则 CLI 虽能解析配置，但运行期无法找到对应 kind。
- **列出注册结果**：通过 `connectors/startup::log_registered_kinds` 可以快速查看当前进程加载的 Source/Sink，若出现找不到的 kind，优先检查是否忘记注册或重复注册（`src/connectors/startup.rs:25-42`）。
- **适配器使用场景**：如果需要把同一种 connector kind 映射到多个 factory（比如企业版扩展），在 `adapter.rs` 注册 `ConnectorKindAdapter`，再由业务层读取 `list_kinds()` 决定要启用的适配路径（`src/connectors/adapter.rs:1-43`）。

## 测试策略
- **工厂级单元测试**：所有新工厂都应像 File/Tcp/Syslog 一样包含 `#[cfg(test)]` 模块，验证参数校验、实例数量、Tag 注入等关键路径。例如 `file::factory` 中的 `build_spec_with_instances`、`compute_file_ranges_aligns_to_line_boundaries` 等用例（`src/sources/file/factory.rs:188-266`）。
- **端到端验证**：网络类 Source/Sink 建议提供受控的 e2e 测试，配合条件变量（如 `WP_NET_TESTS`）运行真实 TCP/UDP 循环，参考 `src/sinks/backends/tcp.rs:287-356` 与 `src/sources/tcp/conn/connection.rs:500-552` 的用例。
- **保持幂等**：测试/工具函数不应依赖全局状态，使用 `register_*` 时若会污染全局 registry，要在测试结束后清理或使用隔离的 runner。

## 提交流程提示
1. **文档更新**：当新 connector 引入新的 CLI/配置参数，需同步更新 `docs`、`wpgen` 模板以及任何 CLI 帮助文本。
2. **代码规范**：遵守 Rustfmt、Clippy 以及仓库指引（宏/特性集中定义、错误提示使用 `SourceReason/SinkReason`）。
3. **日志与可观测性**：一旦连接建立、首包发送或异常发生应输出 `info!/warn!`，便于排查跨机问题。
4. **注册核查**：PR 提交前检查 `connectors/startup.rs` 是否包含新工厂的注册逻辑，并在日志里确认可见。

遵循以上步骤，新 connector 可以快速接入 engine，并保持配置、诊断与回归测试的统一体验。
