# 花瓣网 Materials 页面 - 设计系统样式指南

## 概览

**项目名称**: huaban
**源 URL**: https://huaban.com/materials
**提取日期**: 2026-02-08
**页面描述**: 花瓣素材首页，提供商用设计素材下载服务

### 视觉特征

- **品牌色调**: 红色主色调 (#FF284B)，传达活力与创意
- **布局风格**: 固定侧边栏 + 固定顶部搜索 + 滚动内容区
- **卡片设计**: 圆角卡片，hover 时有微妙的上浮效果
- **信息层次**: 清晰的区块划分，每个区块有独立的标题和分类标签

---

## CSS Variables

```css
:root {
  /* Colors - Primary */
  --color-primary: rgb(255, 40, 75);
  --color-primary-hover: rgb(230, 35, 65);
  --color-banner-bg: rgb(197, 22, 1);

  /* Colors - Text */
  --color-text-primary: rgb(30, 32, 35);
  --color-text-secondary: rgba(30, 32, 35, 0.65);
  --color-text-tertiary: rgba(30, 32, 35, 0.45);
  --color-text-white: rgb(255, 255, 255);
  --color-text-dark: rgb(34, 37, 41);
  --color-text-muted: rgb(138, 142, 145);

  /* Colors - Background */
  --color-bg-white: rgb(255, 255, 255);
  --color-bg-gray: rgb(247, 247, 247);
  --color-bg-light: rgb(247, 249, 250);
  --color-bg-card: rgb(237, 242, 245);
  --color-bg-calendar-active: rgb(252, 242, 246);

  /* Colors - Border */
  --color-border-light: rgba(0, 0, 0, 0.08);
  --color-border-calendar-active: rgb(255, 230, 238);

  /* Spacing */
  --space-4: 4px;
  --space-8: 8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;

  /* Layout */
  --sidebar-width: 84px;
  --header-height: 80px;
  --banner-height: 60px;
  --content-max-width: 1296px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 24px;
  --radius-pill: 44px;

  /* Motion */
  --motion-fast: 0.15s;
  --motion-normal: 0.2s;
  --motion-slow: 0.3s;
  --ease-default: ease;
  --ease-smooth: ease-in-out;
  --ease-bounce: cubic-bezier(0.645, 0.045, 0.355, 1);
}
```

---

## 色彩系统

### 主色调

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#FF284B` | 主要按钮、强调链接、品牌色 |
| `--color-primary-hover` | `#E62341` | 按钮 hover 状态 |
| `--color-banner-bg` | `#C51601` | 顶部横幅背景 |

### 文本颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-text-primary` | `rgb(30, 32, 35)` | 标题、正文主要文字 |
| `--color-text-secondary` | `rgba(30, 32, 35, 0.65)` | 副标题、辅助说明 |
| `--color-text-tertiary` | `rgba(30, 32, 35, 0.45)` | 次要信息、页脚文字 |
| `--color-text-muted` | `rgb(138, 142, 145)` | 禁用状态、占位符 |

### 背景颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-bg-white` | `#FFFFFF` | 页面背景、卡片背景 |
| `--color-bg-gray` | `#F7F7F7` | 侧边栏 hover、次要区块 |
| `--color-bg-light` | `#F7F9FA` | 日历卡片默认背景 |
| `--color-bg-card` | `#EDF2F5` | 素材卡片背景 |
| `--color-bg-calendar-active` | `#FCF2F6` | 日历卡片激活背景 |

---

## 字体系统

### 字体族

```css
/* 主要字体栈 */
font-family: "Alibaba Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB",
             "Helvetica Neue", Helvetica, Arial, sans-serif;

/* 中文优化字体栈 */
font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB",
             "WenQuanYi Micro Hei", Arial, sans-serif;
```

### 字体尺寸层级

| 层级 | 尺寸 | 行高 | 用途 |
|------|------|------|------|
| xs | 12px | 1.4 | 标签、计数 |
| sm | 14px | 22px | 正文、按钮 |
| base | 16px | 1.57 | 搜索框输入 |
| lg | 18px | 1.5 | 卡片标题 |
| xl | 20px | 1.4 | 区块标题 |
| 2xl | 24px | 1.3 | 大标题 |

---

## 间距系统

| Token | 值 | 常见用途 |
|-------|-----|----------|
| `--space-4` | 4px | 图标与文字间距 |
| `--space-8` | 8px | 紧凑元素间距 |
| `--space-12` | 12px | 卡片内部间距 |
| `--space-16` | 16px | 标准元素间距 |
| `--space-24` | 24px | 卡片之间间距 |
| `--space-32` | 32px | 区块内间距 |
| `--space-40` | 40px | 页面边距 |
| `--space-48` | 48px | 区块间距 |

---

## 布局模式

### 页面骨架

```
┌─────────────────────────────────────────────────────────┐
│                    Top Banner (60px)                     │
├────┬────────────────────────────────────────────────────┤
│    │                  Header (80px)                      │
│ S  ├────────────────────────────────────────────────────┤
│ i  │                                                     │
│ d  │               Main Content Area                     │
│ e  │                 (1296px max)                        │
│ b  │                                                     │
│ a  ├────────────────────────────────────────────────────┤
│ r  │                    Footer                           │
│    │                                                     │
└────┴────────────────────────────────────────────────────┘
  84px
```

### 固定定位元素

| 元素 | 位置 | z-index |
|------|------|---------|
| Sidebar | `left: 0; top: 60px;` | 100 |
| Header | `top: 60px; left: 84px;` | 99 |
| Floating Panel | `right: 40px; top: 50%;` | 100 |
| Login Prompt | `bottom: 0; left: 84px;` | 100 |

---

## 组件样式

### 搜索栏

```css
.search-bar {
  height: 40px;
  border-radius: 24px;
  border: 1px solid #EDF2F5;
  background: transparent;
}

.search-bar:focus-within {
  border-color: var(--color-primary);
}

.search-bar__btn {
  background-color: #FF284B;
  color: white;
  border-radius: 24px;
  box-shadow: rgba(255, 255, 255, 0.24) 0px 0px 24px 0px inset;
}
```

### 日历卡片

```css
.calendar-card {
  width: 196px;
  height: 64px;
  border-radius: 12px;
  background-color: #F7F9FA;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.calendar-card:hover,
.calendar-card--active {
  background-color: #FCF2F6;
  border-color: #FFE6EE;
}
```

### 素材卡片

```css
.category-card {
  width: 240px;
  height: 320px;
  border-radius: 12px;
  background-color: #EDF2F5;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
```

### 侧边栏导航项

```css
.sidebar__nav-item {
  width: 44px;
  height: 44px;
  border-radius: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.sidebar__nav-item:hover {
  background-color: #F7F7F7;
}

.sidebar__nav-item--active {
  background-color: #F7F7F7;
  background-image: radial-gradient(
    44.17% 100% at 27.6% 0px,
    rgba(231, 164, 255, 0.2) 0px,
    rgba(255, 171, 229, 0.2) 32.21%,
    rgba(255, 220, 200, 0.2) 66.35%,
    rgba(246, 244, 248, 0.2) 100%
  );
}
```

### 主要按钮

```css
.btn-primary {
  background-color: #FF284B;
  color: white;
  border-radius: 44px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.btn-primary:hover {
  background-color: #E62341;
}

/* 白色内发光效果 */
.btn-primary::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: white;
  opacity: 0.35;
}
```

---

## 状态矩阵

### 按钮状态

| 状态 | 背景色 | 文字色 | 其他 |
|------|--------|--------|------|
| Default | `#FF284B` | `#FFFFFF` | - |
| Hover | `#E62341` | `#FFFFFF` | - |
| Active | `#D11F3B` | `#FFFFFF` | - |
| Disabled | `#CCCCCC` | `#999999` | `cursor: not-allowed` |

### 链接状态

| 状态 | 颜色 | 过渡 |
|------|------|------|
| Default | `inherit` | - |
| Hover | `#FF284B` | `color 0.3s ease` |

### 输入框状态

| 状态 | 边框色 | 背景色 |
|------|--------|--------|
| Default | `#EDF2F5` | `transparent` |
| Focus | `#FF284B` | `transparent` |

---

## 动画清单

### CSS Transitions

| 组件 | 属性 | 时长 | 缓动 |
|------|------|------|------|
| 按钮 | `all` | `0.15s` | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| 链接 | `color` | `0.3s` | `ease` |
| 卡片 | `transform` | `0.2s` | `ease-in-out` |
| 搜索栏 | `border-color` | `0.2s` | `ease` |

### Hover 效果

| 组件 | 效果 |
|------|------|
| 话题卡片 | `transform: scale(1.02)` |
| 素材卡片 | `transform: translateY(-4px)` + `box-shadow` |
| 日历卡片 | 背景色 + 边框色变化 |

---

## 资源依赖

### 字体

| 字体名称 | 用途 | 加载方式 |
|----------|------|----------|
| Alibaba Sans | 主要字体 | 阿里巴巴字体 CDN |
| PingFang SC | 中文回退 | 系统字体 |
| Microsoft YaHei | Windows 中文 | 系统字体 |

### 图标

| 类型 | 数量 | 来源 |
|------|------|------|
| Inline SVG | 98+ | 自定义图标 |

### 第三方库

| 库名 | 用途 |
|------|------|
| slick | 轮播/滑动组件 |

### 图片 CDN

| 域名 | 用途 |
|------|------|
| `gd-hbimg-other.huaban.com` | 横幅图片 |
| `grocery-cdn.huaban.com` | Logo 等资源 |
| `gaoding-market.dancf.com` | 素材预览图 |
| `cdn.dancf.com` | 静态资源 |

---

## 代码示例

### 日历卡片

```html
<a href="#" class="calendar-card calendar-card--active">
  <div class="calendar-card__icon"></div>
  <div class="calendar-card__info">
    <span class="calendar-card__title">小年</span>
    <span class="calendar-card__date">02.10 - 02.11</span>
  </div>
  <span class="calendar-card__countdown">2天后</span>
</a>
```

### 区块标题

```html
<div class="section-header">
  <div class="section-title">
    <div class="section-title__icon-placeholder"></div>
    <span class="section-title__text">免抠元素</span>
    <span class="section-subtitle">爆款元素上新，多系列多风格</span>
  </div>
</div>
```

### 分类标签

```html
<div class="category-tabs">
  <a href="#" class="category-tab category-tab--active">字体</a>
  <a href="#" class="category-tab">3D系列</a>
  <a href="#" class="category-tab category-tab--hot">多行业店铺首页</a>
</div>
```

### 素材卡片

```html
<a href="#" class="category-card">
  <div class="category-card__img-wrapper">
    <img src="..." alt="" class="category-card__img">
  </div>
  <div class="category-card__info">
    <span class="category-card__title">冬季旅游借势海报</span>
    <span class="category-card__count">158张</span>
  </div>
</a>
```

### 主要按钮

```html
<button class="btn-primary">立即登录</button>
```

---

## 复刻验证清单

- [x] 页面骨架结构正确（sidebar + header + content）
- [x] 固定定位元素位置正确
- [x] 颜色变量应用正确
- [x] 字体栈设置正确
- [x] 圆角尺寸一致
- [x] 间距系统一致
- [x] Hover 状态正常工作
- [x] 过渡动画正常播放
- [x] 卡片布局正确
- [x] 响应式断点设置
- [ ] 图片占位符尺寸匹配（需根据实际图片调整）

---

## 文件结构

```
style/
├── huaban-style.md              # 本文档
├── huaban-evidence/
│   ├── fullpage.webp            # 全页面截图 (394KB)
│   └── extracted-data.json      # 提取的结构化数据
└── huaban-replica/
    ├── index.html               # 复刻页面
    ├── styles.css               # 样式文件
    └── scripts.js               # 交互脚本
```
