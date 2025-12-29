# DataRecord 机制数据字段

## 概述

Warp Parse 系统在解析数据时，会自动向 DataRecord 追加一些机制数据字段，用于追踪数据的来源和处理路径。这些机制数据字段以 `wp_` 前缀标识，为系统提供了数据溯源和调试能力。

## 机制数据字段列表

### 1. wp_event_id

- **字段类型**: 字符串 (String)
- **描述**: 事件的唯一标识符
- **来源**: 从 SourceEvent.event_id 获取
-**用途**: 追踪单个事件在系统中的完整处理流程

### 2. wp_src_key

- **字段类型**: 字符串 (String)
- **描述**: 数据源的标识符
- **来源**: 从 SourceEvent.src_key 获取
- **用途**: 标识数据来源于哪个数据源（如 "syslog_1", "file_reader" 等）

### 3. wp_src_ip

- **字段类型**: IP 地址 (IP)
- **描述**: 数据源的客户端 IP 地址
- **来源**: 从 SourceEvent.ups_ip 获取
- **用途**: 记录发送数据的客户端 IP 地址，用于审计和定位
