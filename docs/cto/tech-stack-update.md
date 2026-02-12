# 技术栈调整方案 (基于创始人反馈)

> **更新日期**: 2026-02-12  
> **调整原因**: 创始人技术栈偏好 + 分阶段交付策略

---

## 核心调整

### 前端：React
**原方案**: Vanilla JS  
**新方案**: **React 18+**

**理由**:
- ✅ 创始人熟悉React生态
- ✅ 组件化开发，玩偶状态管理更清晰
- ✅ 丰富的动画库支持
- ✅ 更好的开发体验

**技术栈**:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^5.0.0" // 开发工具
}
```

---

### 后端：Spring Boot (Java)
**原方案**: Node.js + Express  
**新方案**: **Spring Boot 3.x + Java 17+**

**理由**:
- ✅ 创始人熟悉Java技术栈
- ✅ Spring生态成熟，适合长期维护
- ✅ 类型安全
- ✅ 更好的企业级支持

**技术栈**:
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
</dependencies>
```

---

## 版本规划调整

### V1 (MVP - 2个月)
**目标**: 快速验证核心价值

**必须功能**:
- ✅ 文字对话（用户输入 → AI回复）
- ✅ 玩偶展示（2D图片/SVG）
- ✅ 点击反应（点击玩偶 → 表情变化）
- ✅ 基础表情切换（3-5种）

**暂不实现**:
- ❌ 语音识别(ASR)
- ❌ 语音合成(TTS)
- ❌ 复杂动画

**成功标准**:
- 用户能完成完整对话流程
- 玩偶点击有明显反馈
- 平均响应时间 < 2s

---

### V2 (语音增强 - Month 3-4)
**目标**: 增加语音交互能力

**新增功能**:
- ✅ ASR (语音识别)：用户语音 → 文字
- ✅ TTS (语音合成)：AI文字 → 语音播放
- ✅ 精致互动：
  - 玩偶说话时嘴巴动画
  - 更丰富的表情和动作
  - 呼吸动画、眨眼等细节

---

## 玩偶动画技术方案

### 方案1: Lottie动画 (推荐用于V1)
**工具**: Lottie + React

**优点**:
- ✅ 免费，开源
- ✅ 性能好（基于JSON）
- ✅ 设计师可用Adobe After Effects制作
- ✅ React集成简单

**实现**:
```bash
npm install lottie-react
```

```jsx
import Lottie from 'lottie-react';
import happyAnimation from './animations/happy.json';

function Doll({ emotion }) {
  const animationData = emotionMap[emotion];
  return <Lottie animationData={animationData} loop={true} />;
}
```

**资源**:
- LottieFiles市场: https://lottiefiles.com/ (免费+付费动画)
- 可直接搜索"kawaii character" "cute mascot"

---

### 方案2: Spine动画 (推荐用于V2)
**工具**: Spine + spine-react

**优点**:
- ✅ 专业骨骼动画
- ✅ 动作流畅自然
- ✅ 适合复杂角色动画

**缺点**:
- ❌ Spine软件付费 ($69-$329)
- ❌ 学习曲线较陡

**实现**:
```bash
npm install @esotericsoftware/spine-webgl
```

**资源**:
- 官网: http://esotericsoftware.com/
- 可雇佣设计师制作（Fiverr $50-200）

---

### 方案3: React Spring (轻量级)
**工具**: react-spring

**优点**:
- ✅ 完全免费
- ✅ 纯代码实现，无需设计师
- ✅ 适合简单动画（弹跳、缩放、旋转）

**实现**:
```bash
npm install @react-spring/web
```

```jsx
import { useSpring, animated } from '@react-spring/web';

function Doll() {
  const bounce = useSpring({
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(-10px)' },
    config: { tension: 300, friction: 10 },
    loop: { reverse: true }
  });
  
  return <animated.div style={bounce}>🌙</animated.div>;
}
```

---

### 方案4: Live2D (专业级，可选)
**工具**: Live2D Cubism

**优点**:
- ✅ 顶级2D角色动画
- ✅ 非常适合虚拟形象
- ✅ VTuber级别效果

**缺点**:
- ❌ 软件付费 (免费版有限制)
- ❌ 学习成本高
- ❌ 文件较大

**推荐**: V2阶段如果产品成功再考虑

---

## 推荐方案组合

### V1 方案
**玩偶静态图 + React Spring点击动画**

```
技术栈:
- 玩偶形象: SVG/PNG图片
- 表情切换: CSS transition
- 点击反应: react-spring的弹跳动画
- 成本: $0
- 开发时间: 3-5天
```

**步骤**:
1. 设计5种表情的静态图（自己用Figma或雇设计师$30）
2. 用react-spring实现点击弹跳
3. CSS切换不同表情图片

---

### V2 方案
**Lottie动画 + 语音同步**

```
技术栈:
- 玩偶动画: Lottie (从LottieFiles购买/定制)
- 表情系统: 10+种Lottie动画文件
- 说话动画: 嘴巴开合Lottie
- 成本: $50-200
- 开发时间: 1-2周
```

---

## ASR/TTS集成方案

### 方案1: 讯飞开放平台 (推荐)
**服务**: 科大讯飞

**优点**:
- ✅ 国内服务，速度快
- ✅ 中文识别准确
- ✅ 免费额度高
- ✅ 官方Java SDK

**定价**:
- ASR: 每天500次免费，超出¥0.0015/次
- TTS: 每天500次免费，超出¥0.002/次

**集成**:
```xml
<!-- Maven依赖 -->
<dependency>
  <groupId>com.iflytek.cloud</groupId>
  <artifactId>java-sdk</artifactId>
  <version>1.0.0</version>
</dependency>
```

**官网**: https://www.xfyun.cn/

---

### 方案2: 阿里云 (备选)
**服务**: 阿里云智能语音

**优点**:
- ✅ 稳定
- ✅ 多种音色
- ✅ Java SDK完善

**定价**:
- ASR: 前3个月免费，后¥0.0025/次
- TTS: ¥0.003/次

**官网**: https://ai.aliyun.com/nls

---

### 方案3: Azure Speech (国际)
**服务**: Microsoft Azure

**优点**:
- ✅ 质量顶级
- ✅ 多语言支持

**缺点**:
- ❌ 国内速度慢
- ❌ 费用较高

---

## 推荐工具资源

### 动画资源网站
1. **LottieFiles**: https://lottiefiles.com/
   - 免费+付费Lottie动画
   - 搜索"cute character" "mascot"
   
2. **Rive**: https://rive.app/
   - 实时交互动画
   - 有免费版

3. **IconScout**: https://iconscout.com/
   - 付费动画素材
   - 质量高

### 设计外包
1. **Fiverr**: https://fiverr.com/
   - 搜索"lottie animation" "character animation"
   - $50-200可定制专属玩偶动画

2. **猪八戒**: https://www.zbj.com/
   - 国内设计师
   - ¥200-1000

---

## 更新后的架构图

```
前端 (React)
  ├─ UI组件
  │  ├─ DollComponent (Lottie动画)
  │  ├─ ChatBox
  │  └─ VoiceButton (V2)
  ├─ 状态管理: Zustand/Redux
  └─ API调用: Axios

      ↓ REST API

后端 (Spring Boot)
  ├─ Controller
  │  ├─ ChatController
  │  └─ VoiceController (V2)
  ├─ Service
  │  ├─ AIService (调用GPT API)
  │  ├─ ASRService (讯飞SDK, V2)
  │  └─ TTSService (讯飞SDK, V2)
  ├─ Repository (JPA)
  └─ PostgreSQL
```

---

## 下一步行动

### 立即行动
1. ✅ 确认技术栈：React + Spring Boot
2. ⏭️ 选择动画方案（推荐V1用React Spring）
3. ⏭️ 初始化项目脚手架
4. ⏭️ 设计/获取玩偶形象素材

### V1开发顺序（2个月）
1. Week 1-2: 搭建React+Spring Boot基础架构
2. Week 3-4: 实现文字对话功能
3. Week 5-6: 集成玩偶展示+点击动画
4. Week 7-8: 登录+记忆系统

### V2开发顺序（Month 3-4）
1. Week 9-10: 集成讯飞ASR/TTS
2. Week 11-12: Lottie动画升级+说话动画

---

## 成本估算

| 项目 | V1 | V2 |
|------|----|----|
| 静态玩偶素材 | ¥0-200 | - |
| Lottie动画定制 | - | ¥500-1500 |
| 讯飞ASR/TTS | - | ¥100-300/月 |
| 服务器 | ¥100/月 | ¥100/月 |
| **总计** | **¥100-300** | **¥700-2000** |

---

> **CTO建议**: React + Spring Boot是更稳健的选择，虽然初期搭建稍慢，但长期维护性更好。V1先用简单动画验证需求，V2再投入精致化。
