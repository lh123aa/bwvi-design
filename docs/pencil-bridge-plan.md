# Pencil Bridge 迭代计划

> 在 BWVI 中集成 Pencil MCP，将设计决策输出为可编辑的 .pen 设计稿

---

## 目标

```bash
# 最终用户用法
bwvi generate "咖啡品牌 landing" --engine=pencil
# → BWVI 决策分析 → Pencil MCP → 输出 .pen 文件 + PNG

bwvi generate "App 原型" --device=iphone --engine=pencil
# → iPhone 设备边框 + 组件填充 → .pen 文件
```

---

## 架构

```
BWVI 决策层                            Pencil 环境
┌─────────────────┐     ┌──────────────────────────┐
│  analyze task    │     │  Pencil MCP Server        │
│  → direction    │──→  │  ├── pencil_batch_design │
│  → palette      │     │  ├── pencil_batch_get    │
│  → typography   │     │  ├── pencil_export_nodes │
│  → layout       │     │  └── pencil_get_screenshot│
└─────────────────┘     └──────────────────────────┘
         │                        │
    bridge 层               .pen 文件
  ┌──────────────┐          ┌──────────┐
  │ pencil-bridge│────────→│ 可编辑    │
  │ .ts          │          │ 设计稿    │
  └──────────────┘          └──────────┘
```

---

## 迭代计划

### Phase 1：基础桥接（3-4 天）

#### 1.1 创建 `src/engine/bridges/pencil-bridge.ts`

**核心函数**：

```typescript
export async function renderViaPencil(
  task: string,
  options: {
    direction?: string;
    brandName?: string;
    device?: DeviceType;
    dark?: boolean;
  }
): Promise<{ penFile: string; screenshot?: string; warnings: string[] }>
```

**实现步骤**：
1. 分析任务 → 获取方向/色板/字体决策（复用现有 engine）
2. 匹配蓝图 → 确定页面结构（复用现有 content-presets.ts）
3. 映射蓝图 section 到 Pencil 组件（navbar/hero/features 等）
4. 调用 `pencil_open_document` 创建新 .pen 文件
5. 调用 `pencil_batch_design` 逐层创建 UI 结构
6. 应用品牌色板和字体
7. 调用 `pencil_export_nodes` 导出 PNG
8. 返回 .pen 文件路径 + 截图

#### 1.2 Pencil 组件映射表

| BWVI 组件 | Pencil 组件 ref | 说明 |
|-----------|----------------|------|
| Navbar | "navbar" | 导航栏 |
| Hero (centered) | "hero-centered" | 居中 hero |
| Hero (split) | "hero-split" | 分割 hero |
| Hero (fullscreen) | "hero-fullscreen" | 全屏 hero |
| FeatureGrid | "features-grid" | 功能网格 |
| StatsGrid | "stats-grid" | 统计网格 |
| TestimonialGrid | "testimonials" | 评价 |
| CTASection | "cta-section" | 行动号召 |
| Footer | "footer" | 页脚 |
| PriceCard | "pricing-card" | 定价卡片 |

---

### Phase 2：设备边框 + 交互（2 天）

#### 2.1 设备边框映射

| BWVI device | Pencil 实现 |
|-------------|------------|
| iphone | Pencil 设备边框组件 + 375×812 画布 |
| pixel | Pencil 设备边框组件 + 412×846 画布 |
| ipad | Pencil 设备边框组件 + 744×1033 画布 |
| macbook | Pencil 设备边框组件 + 1024×640 画布 |
| browser | 自适应画布 |

#### 2.2 品牌色板应用

```typescript
// 在 Pencil 中设置变量/主题
await pencil_set_variables({
  variables: {
    "color-primary": brand.colors.primary,
    "color-accent": brand.colors.accent,
    "color-surface": brand.colors.surface,
    "color-text": brand.colors.text,
    "font-display": brand.typography.display,
    "font-body": brand.typography.body,
  }
});
```

---

### Phase 3：渲染后端集成（1 天）

#### 3.1 注册到 renderer.ts

```typescript
// src/engine/renderer.ts
case "pencil":
  return renderViaPencilBackend(options);
```

#### 3.2 CLI 参数

```bash
# generate 命令新增
--engine=pencil     # 输出 .pen 文件
--pen-out=<path>    # 指定 .pen 输出路径
```

---

### Phase 4：设计稿 → 代码（可选，3-5 天）

反向流程：从 Pencil 设计稿读取设计决策 → 生成 HTML

```bash
bwvi learn design.pen
# → 从 .pen 文件提取色板/字体/间距
# → 更新指纹

bwvi generate --from-pen=design.pen --direct
# → 从 .pen 设计稿生成 HTML
```

---

## 文件清单

| 文件 | 类型 | 预估行数 |
|------|:----:|:--------:|
| `src/engine/bridges/pencil-bridge.ts` | 新增 | ~200 |
| `src/engine/renderer.ts` | 修改 | +10 |
| `src/cli/generate.ts` | 修改 | +10 |
| `src/engine/__tests__/pencil-bridge.test.ts` | 新增 | ~80 |
| 总计 | | ~300 |

---

## 依赖检查

需要先确认当前环境中的 Pencil MCP 可用组件：

```typescript
// 列出可用的 Pencil 组件
const components = await pencil_batch_get({
  patterns: [{ reusable: true }],
  readDepth: 2,
});
```

---

## 验收标准

```
✅ bwvi generate "咖啡品牌 landing" --engine=pencil
   → 输出 .pen 文件 + PNG 截图
   → 包含 Navbar + Hero + Features + Footer

✅ bwvi generate "App 原型" --device=iphone --engine=pencil
   → .pen 文件使用 iPhone 设备框
   → 包含 Tab Bar + 列表视图

✅ bwvi generate "SaaS landing" --brand=linear --engine=pencil
   → .pen 文件中应用了 Linear 品牌色 (#5E6AD2)

✅ Pencil 设计稿在 Pencil 编辑器中可编辑
```

---

## 时间线

| Phase | 内容 | 工时 |
|:-----:|------|:----:|
| P1 | 基础桥接 + 组件映射 | 3-4 天 |
| P2 | 设备边框 + 品牌色板 | 2 天 |
| P3 | 渲染后端集成 | 1 天 |
| P4 | 设计稿→代码（可选） | 3-5 天 |
| **总计** | | **6-10 天** |
