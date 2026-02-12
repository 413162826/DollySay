# Lottie动画集成完整指南

> **工具**: Lottie + React  
> **用途**: 玩偶表情和动画系统  
> **适用**: V1+V2全阶段

---

## Lottie简介

**什么是Lottie?**
- Adobe After Effects导出的JSON动画
- 性能优异，文件小巧
- 支持完整的矢量动画
- 跨平台(Web/iOS/Android)

**优势**:
- ✅ 设计师友好（AE制作）
- ✅ 代码友好（JSON格式）
- ✅ 免费资源多（LottieFiles市场）
- ✅ React集成简单

---

## 步骤1: 获取Lottie动画

### 方案A: 使用免费市场资源

**LottieFiles市场**: https://lottiefiles.com/

1. 搜索关键词:
   - "cute character"
   - "kawaii mascot"
   - "moon character"
   - "emotional character"

2. 筛选:
   - 免费 (Free)
   - 可商用 (Commercial Use)

3. 下载JSON文件

**推荐资源**:
- 🌙 Moon Character: https://lottiefiles.com/search?q=moon
- 😊 Happy Face: https://lottiefiles.com/search?q=happy
- 💭 Thinking: https://lottiefiles.com/search?q=thinking

---

### 方案B: 定制设计

**平台**: Fiverr / 猪八戒

**搜索**: "lottie animation character"

**预算**:
- 基础5个表情: $50-150 / ¥300-1000
- 高级10+表情+动作: $200-500 / ¥1500-3500

**交付物**:
- JSON文件 (每个表情独立文件)
- AE源文件 (可选，用于后续修改)

**Brief模板**:
```
项目: 情感陪伴玩偶Lottie动画
角色: 圆润可爱的月亮形象
需求:
1. 5种表情动画 (各1秒循环):
   - neutral (平静/默认)
   - happy (开心/微笑)
   - sad (难过/安慰)
   - thinking (思考)
   - surprised (惊讶)
2. 额外动作 (各1秒):
   - bounce (点击弹跳)
   - breathing (呼吸idle)
   
风格: 简洁、温暖、治愈系
颜色: 淡黄色主体 + 淡粉腮红
格式: JSON (Lottie格式)
分辨率: 400x400px
```

---

## 步骤2: React项目集成

### 2.1 安装依赖

```bash
npm install lottie-react
```

---

### 2.2 项目结构

```
src/
├── animations/           # 动画文件目录
│   ├── neutral.json
│   ├── happy.json
│   ├── sad.json
│   ├── thinking.json
│   ├── surprised.json
│   └── bounce.json
├── components/
│   └── Doll.jsx
└── App.jsx
```

---

### 2.3 基础Lottie组件

```jsx
// src/components/Doll.jsx
import { useState, useRef } from 'react';
import Lottie from 'lottie-react';

// 导入所有动画JSON
import neutralAnim from '../animations/neutral.json';
import happyAnim from '../animations/happy.json';
import sadAnim from '../animations/sad.json';
import thinkingAnim from '../animations/thinking.json';
import surprisedAnim from '../animations/surprised.json';
import bounceAnim from '../animations/bounce.json';

const EMOTION_ANIMATIONS = {
  neutral: neutralAnim,
  happy: happyAnim,
  sad: sadAnim,
  thinking: thinkingAnim,
  surprised: surprisedAnim,
};

export default function Doll({ emotion = 'neutral', onClick }) {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isBouncing, setIsBouncing] = useState(false);
  const lottieRef = useRef(null);

  // 监听emotion prop变化
  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  const handleClick = () => {
    // 播放点击弹跳动画
    setIsBouncing(true);
    onClick?.();
    
    // 1秒后恢复正常表情
    setTimeout(() => {
      setIsBouncing(false);
    }, 1000);
  };

  return (
    <div onClick={handleClick} className="doll-container">
      <Lottie
        lottieRef={lottieRef}
        animationData={isBouncing ? bounceAnim : EMOTION_ANIMATIONS[currentEmotion]}
        loop={true}
        autoplay={true}
        style={{ width: 200, height: 200, cursor: 'pointer' }}
      />
    </div>
  );
}
```

---

### 2.4 高级功能：表情切换动画

```jsx
// src/components/AnimatedDoll.jsx
import { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { useSpring, animated } from '@react-spring/web';

import neutralAnim from '../animations/neutral.json';
import happyAnim from '../animations/happy.json';
import sadAnim from '../animations/sad.json';
import thinkingAnim from '../animations/thinking.json';

const EMOTION_ANIMATIONS = {
  neutral: neutralAnim,
  happy: happyAnim,
  sad: sadAnim,
  thinking: thinkingAnim,
};

export default function AnimatedDoll({ emotion = 'neutral', onEmotionChange }) {
  const [currentEmotion, setCurrentEmotion] = useState(emotion);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 表情切换过渡动画
  const fadeSpring = useSpring({
    opacity: isTransitioning ? 0 : 1,
    config: { duration: 300 }
  });

  useEffect(() => {
    if (emotion !== currentEmotion) {
      // 淡出当前表情
      setIsTransitioning(true);
      
      setTimeout(() => {
        // 切换表情
        setCurrentEmotion(emotion);
        setIsTransitioning(false);
        onEmotionChange?.(emotion);
      }, 300);
    }
  }, [emotion]);

  return (
    <animated.div style={fadeSpring}>
      <Lottie
        animationData={EMOTION_ANIMATIONS[currentEmotion]}
        loop={true}
        autoplay={true}
        style={{ width: 200, height: 200 }}
      />
    </animated.div>
  );
}
```

---

### 2.5 与对话系统集成

```jsx
// src/App.jsx
import { useState } from 'react';
import Doll from './components/Doll';
import ChatBox from './components/ChatBox';

export default function App() {
  const [dollEmotion, setDollEmotion] = useState('neutral');

  const handleMessage = async (userMessage) => {
    // 用户输入时，玩偶变为"倾听"
    setDollEmotion('neutral');
    
    // 调用AI API
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
    
    // AI思考时，玩偶变为"思考"
    setDollEmotion('thinking');
    
    const data = await response.json();
    
    // AI回复后，根据情绪切换表情
    setDollEmotion(data.emotion); // 'happy', 'sad', 'surprised'
  };

  const handleDollClick = () => {
    console.log('玩偶被点击了！');
    // 可以让玩偶说一句话
  };

  return (
    <div className="app">
      <header>
        <Doll emotion={dollEmotion} onClick={handleDollClick} />
      </header>
      
      <main>
        <ChatBox onSendMessage={handleMessage} />
      </main>
    </div>
  );
}
```

---

## 步骤3: 高级特性

### 3.1 控制动画播放

```jsx
import { useRef } from 'react';
import Lottie from 'lottie-react';

function ControlledDoll() {
  const lottieRef = useRef(null);

  const playOnce = () => {
    lottieRef.current?.stop();
    lottieRef.current?.play();
  };

  const pause = () => {
    lottieRef.current?.pause();
  };

  const setSpeed = (speed) => {
    lottieRef.current?.setSpeed(speed); // 0.5x, 1x, 2x
  };

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animData}
      loop={false}
      autoplay={false}
    />
  );
}
```

---

### 3.2 说话时嘴巴动画 (V2语音功能)

```jsx
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import mouthMovingAnim from '../animations/mouth-moving.json';

export default function SpeakingDoll({ isSpeaking, emotion }) {
  const [animation, setAnimation] = useState(neutralAnim);

  useEffect(() => {
    if (isSpeaking) {
      setAnimation(mouthMovingAnim); // 切换到说话动画
    } else {
      setAnimation(EMOTION_ANIMATIONS[emotion]); // 恢复表情
    }
  }, [isSpeaking, emotion]);

  return <Lottie animationData={animation} loop={isSpeaking} />;
}
```

使用：
```jsx
<SpeakingDoll 
  emotion={currentEmotion} 
  isSpeaking={isPlayingVoice}
/>
```

---

## 步骤4: 优化与最佳实践

### 4.1 懒加载动画

```jsx
import { lazy, Suspense } from 'react';

const neutralAnim = lazy(() => import('../animations/neutral.json'));
const happyAnim = lazy(() => import('../animations/happy.json'));

function Doll({ emotion }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Lottie animationData={neutralAnim} />
    </Suspense>
  );
}
```

---

### 4.2 性能优化

```jsx
import { memo } from 'react';
import Lottie from 'lottie-react';

const Doll = memo(({ emotion, onClick }) => {
  return (
    <Lottie
      animationData={EMOTION_ANIMATIONS[emotion]}
      loop={true}
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
        progressiveLoad: true // 渐进加载
      }}
    />
  );
});

export default Doll;
```

---

### 4.3 减小文件体积

**工具**: LottieFiles Optimizer
https://lottiefiles.com/lottie-optimizer

步骤:
1. 上传JSON文件
2. 调整压缩率
3. 下载优化后文件

**效果**: 通常减小30-50%

---

## 步骤5: 测试清单

### 功能测试
- [ ] 5种表情能正常切换
- [ ] 点击玩偶有弹跳反馈
- [ ] 表情切换有过渡动画
- [ ] 循环动画流畅

### 性能测试
- [ ] 首次加载时间 < 2s
- [ ] 动画帧率 > 30fps
- [ ] JSON文件总大小 < 500KB

### 兼容性测试
- [ ] Chrome/Edge
- [ ] Safari
- [ ] Firefox
- [ ] 移动端浏览器

---

## 资源推荐

### Lottie编辑工具
1. **LottieFiles Editor**: https://lottiefiles.com/editor
   - 在线编辑
   - 无需AE

2. **Adobe After Effects**:
   - 专业动画制作
   - 需安装Bodymovin插件

### 学习资源
- 官方文档: https://airbnb.io/lottie/
- React Lottie: https://www.npmjs.com/package/lottie-react
- 教程视频: YouTube搜索 "Lottie React Tutorial"

### 设计灵感
- Dribbble: 搜索 "character animation"
- Behance: 搜索 "lottie animation"

---

## 预算估算

| 方案 | 成本 | 时间 |
|------|------|------|
| 免费市场资源 | ¥0 | 1-2天 |
| Fiverr基础定制 | ¥300-1000 | 3-5天 |
| Fiverr高级定制 | ¥1500-3500 | 1-2周 |
| 自己学AE制作 | ¥0 (时间成本高) | 2-4周 |

**推荐**: V1用免费资源 + 简单修改，V2再定制专属

---

## 常见问题

### Q1: JSON文件太大怎么办？
**A**: 
1. 使用LottieFiles Optimizer压缩
2. 减少关键帧数量
3. 简化路径和形状

### Q2: 动画不流畅
**A**:
1. 检查帧率 (建议30fps)
2. 启用GPU加速
3. 减少同时播放的动画数量

### Q3: 如何修改动画颜色？
**A**:
1. 用LottieFiles Editor在线修改
2. 或手动编辑JSON文件中的color值

---

## 下一步

V1阶段：
- ✅ 5种基础表情
- ✅ 点击弹跳动画
- ✅ 呼吸idle动画

V2阶段：
- ⏭️ 说话嘴巴动画
- ⏭️ 更多表情 (10+种)
- ⏭️ 复杂动作 (转身、点头等)

---

> **提示**: Lottie是最适合Web玩偶动画的方案，平衡了质量、性能和成本。建议先从免费资源开始，验证效果后再投资定制。
