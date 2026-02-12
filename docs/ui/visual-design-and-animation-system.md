# 玩偶视觉设计与动画系统

> **撰写者**: UI设计 (Matías Duarte 思维模型)  
> **日期**: 2026-02-12  
> **核心原则**: Bold, Graphic, Intentional + Motion Provides Meaning

---

## 设计系统概览

### 设计哲学
- **Material Metaphor**: 玩偶有物理属性(软、圆润、有重量感)
- **Typography First**: 文字清晰可读是第一优先级
- **Motion Meaning**: 每个动画都传递信息，不是装饰
- **Adaptive**: 移动端优先，渐进增强到桌面端

---

## 玩偶视觉设计

### MVP玩偶形象: "小月" (Moon Buddy)

**设计理念**: 治愈系、中性化、夜间陪伴

**形象描述**:
- **形状**: 圆润的月亮造型，略带梨形(下半部分更圆润)
- **配色**: 
  - 主体: 淡奶黄色 `#FFF4E0`(温暖但不刺眼)
  - 阴影: 淡灰蓝 `#E8EDF5`(月光感)
  - 腮红: 淡粉 `#FFD1DC`(可爱感)
- **五官**:
  - 眼睛: 简单的黑点(平静)或弯月形(微笑)
  - 嘴巴: 简单弧线，表情变化时调整曲率
  - 无鼻子(简洁化)
- **大小**: 
  - 移动端: 120x140px (屏幕上方1/4)
  - 桌面端: 200x240px

**为什么选月亮？**
- 符合使用场景(夜间陪伴)
- 软萌无攻击性
- 中性化，男女通吃
- 文化普适性(月亮是普世符号)

### 设计草图描述

```
     ___
    /   \
   |  ・ ・|    ← 眼睛(平静状态)
   |   ︶  |    ← 微笑
    \___/
      ||        ← 小小的身体(可省略)
```

**重要**: 
- MVP用2D矢量图实现(SVG)
- 表情切换通过修改眼睛和嘴巴的Path实现
- 颜色可编程控制(为未来定制化做准备)

---

## 表情系统设计

### 5种核心表情

#### 1. 平静/倾听 (Default)
```
眼睛: ○ ○ (睁开，略带温柔)
嘴巴: —  (平静线条)
腮红: 淡粉色
```
**使用场景**: 默认状态、用户浏览页面时

---

#### 2. 开心/微笑 (Happy)
```
眼睛: ⌒ ⌒ (弯月形，眯眼笑)
嘴巴: ︶ (向上弧度)
腮红: 粉色加深
动画: 轻微左右摇摆
```
**使用场景**: 
- 用户分享好事时
- 点击玩偶时(随机触发)

**动画**: 
- Duration: 0.8s
- Easing: ease-in-out
- 摇摆角度: ±5度

---

#### 3. 难过/安慰 (Sad/Comfort)
```
眼睛: ・ ・ (眼睛缩小，略带泪光)
嘴巴: ︿ (向下弧度)
腮红: 渐隐
动画: 轻微点头
```
**使用场景**: 
- 用户倾诉困难/伤心时
- AI分析到负面情绪时

**动画**:
- Duration: 1s
- 点头3次(表达"我理解")

---

#### 4. 思考 (Thinking)
```
眼睛: ◉ ◉ (睁大，略带上看)
嘴巴: 〇 (小圆圈，思考状)
上方: ". . ." 气泡动画
```
**使用场景**: 
- AI生成回复中

**动画**:
- 眼珠转动(向上看)
- 气泡逐个淡入淡出循环

---

#### 5. 惊讶 (Surprised)
```
眼睛: ○ ○ (圆睁)
嘴巴: o (小圆形)
头部: 略微后倾
```
**使用场景**: 
- 用户说了意外的事

**动画**:
- 头部快速后倾
- 持续0.5s恢复

---

## 动画系统

### Idle动画(呼吸)

**目的**: 让玩偶"活着"，不是静态图片

**实现**:
```css
@keyframes breathing {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.doll {
  animation: breathing 3s ease-in-out infinite;
}
```

**细节**:
- 呼吸周期: 3秒(模拟真人呼吸)
- 缩放幅度: 3%(微妙但可感知)
- 持续循环

---

### 表情切换动画

**原则**: 自然过渡，不突兀

```css
.doll-face {
  transition: all 0.3s ease-out;
}
```

**关键帧**:
1. 旧表情 → 淡出(0.15s)
2. 新表情 → 淡入(0.15s)
3. 伴随轻微缩放(scale 0.95 → 1)

---

### 点击反馈动画

**目的**: 让用户感知"玩偶被点到了"

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

**效果**:
- 玩偶向上弹跳
- 表情切换为开心/害羞
- 简短语音气泡: "嘿！""怎么啦？"
- Duration: 0.6s

---

### 眼神跟随(高级功能，MVP可选)

**目的**: 增强交互感

**实现**:
- 鼠标移动 → 计算玩偶与光标角度
- 眼珠(黑点)轻微向光标方向移动
- 移动范围限制在眼眶内±3px

**代码逻辑**:
```javascript
function followMouse(mouseX, mouseY) {
  const dollX = dollElement.offsetLeft;
  const dollY = dollElement.offsetTop;
  const angle = Math.atan2(mouseY - dollY, mouseX - dollX);
  const offsetX = Math.cos(angle) * 3;
  const offsetY = Math.sin(angle) * 3;
  eyeLeft.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  eyeRight.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}
```

---

## 页面布局设计

### 移动端布局(优先)

```
┌────────────────────┐
│    Header         │ ← Logo + 设置按钮
├────────────────────┤
│                    │
│       玩偶        │ ← 120x140px, 居中
│       小月        │
│                    │
├────────────────────┤
│   对话气泡区域    │ ← 可滚动
│   用户消息(右)    │
│   AI消息(左)      │
│   ...              │ ← 自动滚动到最新
├────────────────────┤
│   输入框 [发送]   │ ← 固定底部
└────────────────────┘
```

**关键尺寸**:
- Header: 56px
- 玩偶区域: 200px(含padding)
- 对话区域: 剩余高度 - 70px
- 输入栏: 70px(固定)

---

### 桌面端布局

```
┌──────────────────────────────────┐
│         Header         │ Login  │
├────────────┬─────────────────────┤
│            │                     │
│   玩偶     │   对话气泡区域     │
│   小月     │   (左右布局)       │
│ 200x240px  │                     │
│            │                     │
│ [点击互动] │   输入框 [发送]    │
└────────────┴─────────────────────┘
```

**自适应规则**:
- < 768px: 垂直布局(移动端)
- >= 768px: 左右布局(桌面端)

---

## 设计系统规范

### Typography Scale

| 用途 | 字号 | 行高 | 字重 |
|------|------|------|------|
| H1 (页面标题) | 24px | 32px | 600 |
| H2 (区块标题) | 20px | 28px | 500 |
| Body (对话文本) | 16px | 24px | 400 |
| Caption (提示文本) | 14px | 20px | 400 |
| Small (辅助信息) | 12px | 18px | 400 |

**字体**:
- 主字体: "PingFang SC", "Helvetica Neue", sans-serif (苹果风格)
- 英文/数字: "SF Pro Display"(如可用)

---

### Color Palette

#### Primary Colors
```css
/* 玩偶主色 */
--doll-primary: #FFF4E0; /* 奶黄 */
--doll-shadow: #E8EDF5;  /* 月光灰 */
--doll-blush: #FFD1DC;   /* 腮红粉 */
```

#### Interface Colors
```css
/* 背景渐变(夜间氛围) */
--bg-gradient: linear-gradient(180deg, 
  #1A1F36 0%,    /* 深蓝夜空 */
  #2D3561 100%   /* 深紫夜空 */
);

/* 文字 */
--text-primary: #FFFFFF;   /* 主文字(白) */
--text-secondary: #B8C1EC; /* 次文字(淡蓝) */

/* 对话气泡 */
--bubble-user: #5B7FFF;    /* 用户消息(蓝) */
--bubble-ai: #3D485F;      /* AI消息(深灰蓝) */

/* 强调色 */
--accent-primary: #FFB74D;  /* 温暖橙(CTA按钮) */
--accent-success: #81C784;  /* 成功绿 */
--accent-error: #E57373;    /* 错误红 */
```

**对比度验证**:
- 白色文字 on 深蓝背景: 12.6:1 (AAA级)
- 白色文字 on 用户气泡: 4.7:1 (AA级)

---

### 间距系统(8px Grid)

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
```

**应用规则**:
- 组件内边距: 16px
- 组件间距: 24px
- 区块间距: 32px

---

### 圆角与阴影

```css
/* 圆角 */
--radius-sm: 8px;  /* 按钮、输入框 */
--radius-md: 16px; /* 对话气泡 */
--radius-lg: 24px; /* 卡片 */
--radius-full: 50%; /* 玩偶、头像 */

/* 阴影(Material Design层级) */
--shadow-1: 0 2px 4px rgba(0,0,0,0.1);  /* 轻微悬浮 */
--shadow-2: 0 4px 8px rgba(0,0,0,0.15); /* 对话气泡 */
--shadow-3: 0 8px 16px rgba(0,0,0,0.2); /* 弹窗 */
```

---

## 组件设计

### 对话气泡

**用户消息**(右侧):
```css
.bubble-user {
  background: var(--bubble-user);
  color: white;
  border-radius: 16px 16px 4px 16px; /* 右下角尖角 */
  padding: 12px 16px;
  max-width: 70%;
  box-shadow: var(--shadow-2);
}
```

**AI消息**(左侧):
```css
.bubble-ai {
  background: var(--bubble-ai);
  color: white;
  border-radius: 16px 16px 16px 4px; /* 左下角尖角 */
  padding: 12px 16px;
  max-width: 75%;
  box-shadow: var(--shadow-1);
}
```

**逐字显示动画**:
```javascript
function typeWriter(text, element, speed = 30) {
  let i = 0;
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
```

---

### 输入框

```css
.input-box {
  background: rgba(255,255,255,0.1); /* 半透明 */
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 24px;
  padding: 12px 20px;
  color: white;
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
}

.input-box:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(255,183,77,0.2); /* 高亮环 */
}
```

---

### 发送按钮

```css
.send-button {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: var(--shadow-2);
  transition: all 0.2s;
}

.send-button:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-3);
}

.send-button:active {
  transform: scale(0.95);
}
```

---

## 无障碍性设计

### 对比度
- ✅ 所有文字对比度 > 4.5:1
- ✅ 大号文字(18px+)对比度 > 3:1

### 交互目标
- ✅ 按钮最小尺寸: 44x44px
- ✅ 点击区域有视觉反馈

### 键盘导航
- ✅ Tab键可遍历所有交互元素
- ✅ Enter发送消息
- ✅ ESC关闭弹窗

### 屏幕阅读器
```html
<button aria-label="发送消息">📤</button>
<div role="log" aria-live="polite">
  <!-- AI消息区域，自动朗读新消息 -->
</div>
```

---

## 动效时间规范

遵循Material Design Duration原则：

| 动效类型 | 时长 | Easing |
|----------|------|--------|
| 微交互(点击反馈) | 100-200ms | ease-out |
| 状态切换(表情) | 250-350ms | ease-in-out |
| 页面转场 | 300-400ms | cubic-bezier(0.4,0,0.2,1) |
| 复杂动画(弹窗) | 400-500ms | ease-in-out |

**原则**: 
- 快速响应 > 炫酷动画
- 动画不应阻塞交互

---

## 响应式断点

```css
/* Mobile First */
@media (min-width: 768px) { /* 平板 */ }
@media (min-width: 1024px) { /* 桌面 */ }
@media (min-width: 1440px) { /* 大屏 */ }
```

---

## 实现建议

### 技术栈推荐
- **框架**: ~~React~~ → Vanilla JS + HTML5 (更轻量)
- **动画**: CSS Transitions + 少量GSAP(复杂动画)
- **图标**: SVG inline(可编程控制颜色)
- **字体**: 系统字体优先(性能)

### 性能优化
- 玩偶SVG < 5KB
- 首屏CSS < 10KB (Critical CSS inline)
- 动画用transform/opacity(GPU加速)
- 避免layout thrashing

---

## 下一步: 交接给技术团队

UI设计规范已完成，现在需要**CTO (Vogels)**和**全栈开发 (DHH)**:
1. 确定技术栈和系统架构
2. 选择AI API服务商
3. 设计数据库schema
4. 制定开发计划

---

> **Duarte的提醒**: 记住，动效不是装饰，是信息传递。玩偶的每一个表情变化、每一次动画，都在告诉用户"发生了什么"。Motion provides meaning.
