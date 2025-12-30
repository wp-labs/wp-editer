# wprescue 

wprescue 是数据恢复工具，用于从救援目录中恢复数据并按照项目配置的 Sink 路由输出到目标。

## 命令概览

```
wprescue 
```

**重要：** wprescue 仅支持 batch 模式。

## 命令行参数

```bash
wprescue [OPTIONS]
```

## 工作原理

1. 读取救援目录（`./data/rescue`）中的数据
2. 按照项目配置的 Sink 路由进行处理
3. 输出到目标位置
4. 处理完成后自动退出
