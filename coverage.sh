#!/bin/bash

set -e  # 遇到错误立即退出

echo "🧪 开始运行测试覆盖率..."

# 1. 运行测试并生成 HTML 报告和文本摘要 (只运行集成测试)
echo ""
echo "📊 生成覆盖率报告..."
COVERAGE_OUTPUT=$(cargo llvm-cov --html --test mod -- --test-threads=1 2>&1)
echo "$COVERAGE_OUTPUT"

# 2. 提取覆盖率百分比
COVERAGE_PERCENT=$(echo "$COVERAGE_OUTPUT" | grep -oE '[0-9]+\.[0-9]+%' | head -1)

# 3. 移动 HTML 报告到根目录
echo ""
echo "📁 整理报告文件..."
rm -rf coverage
mv target/llvm-cov/html coverage

# 4. 清理中间产物
echo "🧹 清理中间产物..."
cargo llvm-cov clean

echo ""
echo "✅ 完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   当前代码覆盖率: ${COVERAGE_PERCENT:-未知}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 HTML 报告位置: ./coverage/index.html"
echo ""
echo "💡 查看报告: open coverage/index.html"
echo ""
