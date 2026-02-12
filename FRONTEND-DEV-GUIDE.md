# 前端开发任务书 (V1 MVP)

> **开发AI**: 请严格按照本文档完成前端开发  
> **技术栈**: React 18 + Vite + Lottie  
> **开发周期**: 2周

---

## 项目概述

你正在开发一个**情感陪伴玩偶**的前端界面，核心是一个可爱的月亮玩偶和对话系统。

**核心功能**:
1. 展示可爱的玩偶，支持5种表情动画
2. 用户可以发送消息，AI回复
3. 玩偶表情随AI情绪变化
4. 点击玩偶有弹跳动画
5. 免登录用户达到20条消息时显示登录引导

---

## 技术要求

### 框架与库
- React 18+
- Vite (开发工具)
- Lottie-react (动画)
- Axios (API请求)
- Zustand (状态管理，可选)

### 项目初始化
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios lottie-react @react-spring/web
```

---

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── Doll.jsx              # 玩偶组件
│   │   ├── ChatBox.jsx           # 对话框
│   │   ├── MessageBubble.jsx     # 消息气泡
│   │   └── LoginPrompt.jsx       # 登录引导弹窗
│   ├── services/
│   │   └── api.js                # API调用
│   ├── animations/
│   │   ├── neutral.json          # 平静表情
│   │   ├── happy.json            # 开心表情
│   │   ├── sad.json              # 难过表情
│   │   ├── thinking.json         # 思考表情
│   │   └── surprised.json        # 惊讶表情
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── .env.local
└── package.json
```

---

## 环境配置

### .env.local
```bash
VITE_API_URL=http://localhost:8080
```

---

## UI设计规范

### 配色方案
```css
/* 主配色 */
--bg-gradient: linear-gradient(180deg, #1A1F36, #2D3561); /* 深蓝夜空 */
--bubble-user: #5B7FFF;    /* 用户消息蓝 */
--bubble-ai: #3D485F;      /* AI消息灰蓝 */
--text-white: #FFFFFF;
--accent: #FFB74D;         /* 温暖橙(CTA按钮) */
--doll-bg: #FFF4E0;        /* 玩偶背景淡黄 */
```

### 字体
```css
font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
```

### 布局
- **移动端优先**: 320px - 768px
- **桌面端**: 768px+

---

## 核心代码实现

### 1. API Service

#### src/services/api.js
```javascript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 生成或获取sessionId
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'guest-' + crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// 发送消息
export const sendMessage = async (message) => {
  const response = await api.post('/chat', {
    message,
    sessionId: getSessionId(),
    isGuest: !localStorage.getItem('token')  // V1都是true
  });
  return response.data;
};

// 健康检查
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
```

---

### 2. 玩偶组件

#### src/components/Doll.jsx
```jsx
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { useSpring, animated } from '@react-spring/web';

// 导入动画JSON (如果有Lottie文件)
// import neutralAnim from '../animations/neutral.json';
// import happyAnim from '../animations/happy.json';
// ... 其他表情

// V1阶段如果没有Lottie，用Emoji
const EMOJI_EMOTIONS = {
  neutral: '🌙',
  happy: '😊🌙',
  sad: '😢🌙',
  thinking: '🤔🌙',
  surprised: '😮🌙'
};

export default function Doll({ emotion = 'neutral', onClick }) {
  const [isClicked, setIsClicked] = useState(false);

  // 点击弹跳动画
  const bounce = useSpring({
    transform: isClicked 
      ? 'translateY(-20px) scale(1.1)' 
      : 'translateY(0px) scale(1)',
    config: { tension: 300, friction: 10 },
    onRest: () => setIsClicked(false)
  });

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
  };

  return (
    <animated.div
      style={bounce}
      onClick={handleClick}
      className="doll-container"
    >
      <div className="doll-emoji">
        {EMOJI_EMOTIONS[emotion]}
      </div>
    </animated.div>
  );
}
```

**对应CSS**:
```css
.doll-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  margin: 0 auto;
}

.doll-emoji {
  font-size: 120px;
  transition: all 0.3s ease;
}

.doll-container:hover .doll-emoji {
  transform: scale(1.05);
}
```

---

### 3. 消息气泡组件

#### src/components/MessageBubble.jsx
```jsx
export default function MessageBubble({ role, content }) {
  return (
    <div className={`message-bubble ${role}`}>
      <div className="bubble-content">
        {content}
      </div>
      <div className="bubble-tail"></div>
    </div>
  );
}
```

**对应CSS**:
```css
.message-bubble {
  max-width: 70%;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
}

.message-bubble.user {
  align-self: flex-end;
}

.message-bubble.ai {
  align-self: flex-start;
}

.bubble-content {
  padding: 12px 16px;
  border-radius: 16px;
  word-wrap: break-word;
  font-size: 16px;
  line-height: 1.5;
}

.message-bubble.user .bubble-content {
  background: #5B7FFF;
  color: white;
}

.message-bubble.ai .bubble-content {
  background: #3D485F;
  color: white;
}
```

---

### 4. 对话框组件

#### src/components/ChatBox.jsx
```jsx
import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/api';
import MessageBubble from './MessageBubble';

export default function ChatBox({ onEmotionChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(20);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // 切换为"思考"表情
    onEmotionChange?.('thinking');
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      
      // 添加AI回复
      setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);
      
      // 切换表情
      onEmotionChange?.(response.emotion);
      
      // 更新剩余消息数
      if (response.remainingMessages !== null) {
        setRemainingMessages(response.remainingMessages);
      }
      
    } catch (error) {
      console.error('发送消息失败', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: '抱歉，我现在有点累了，稍后再聊好吗？' 
      }]);
      onEmotionChange?.('sad');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-box">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index} 
            role={msg.role} 
            content={msg.content} 
          />
        ))}
        {isLoading && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="和我说说吧，我在听..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          发送
        </button>
      </div>

      {remainingMessages <= 5 && remainingMessages > 0 && (
        <div className="remaining-hint">
          免费体验还剩{remainingMessages}条消息
        </div>
      )}
    </div>
  );
}
```

**对应CSS**:
```css
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.input-container {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: white;
  border-top: 1px solid #eee;
}

.input-container input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
}

.input-container button {
  padding: 12px 24px;
  background: #FFB74D;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

.input-container button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 16px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.remaining-hint {
  text-align: center;
  padding: 8px;
  font-size: 14px;
  color: #FFB74D;
}
```

---

### 5. 主应用

#### src/App.jsx
```jsx
import { useState } from 'react';
import Doll from './components/Doll';
import ChatBox from './components/ChatBox';
import './App.css';

function App() {
  const [emotion, setEmotion] = useState('neutral');

  const handleDollClick = () => {
    console.log('玩偶被点击了！');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>小月 🌙</h1>
        <p className="subtitle">你的24小时倾听者</p>
      </header>

      <main className="app-main">
        <div className="doll-section">
          <Doll emotion={emotion} onClick={handleDollClick} />
        </div>

        <div className="chat-section">
          <ChatBox onEmotionChange={setEmotion} />
        </div>
      </main>
    </div>
  );
}

export default App;
```

**对应CSS** (src/App.css):
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1F36, #2D3561);
  color: white;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 20px;
}

.app-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.doll-section {
  padding: 20px 0;
}

.chat-section {
  flex: 1;
  background: white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 响应式 */
@media (min-width: 768px) {
  .app-main {
    flex-direction: row;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .doll-section {
    width: 40%;
  }

  .chat-section {
    flex: 1;
    border-radius: 20px;
  }
}
```

---

## 开发步骤

### Week 1: 基础UI
- [ ] Day 1-2: 搭建Vite项目，配置API服务
- [ ] Day 3-4: 实现Doll组件和基础动画
- [ ] Day 5-6: 实现ChatBox和消息发送
- [ ] Day 7: 测试前后端联调

### Week 2: 功能完善
- [ ] Day 8-9: 完善表情切换逻辑
- [ ] Day 10-11: 实现剩余消息数提示
- [ ] Day 12: 优化UI细节和动画
- [ ] Day 13-14: 响应式适配，性能优化

---

## 测试要求

### 功能测试
- [ ] 能发送消息并收到AI回复
- [ ] 表情能随emotion正确切换
- [ ] 点击玩偶有弹跳动画
- [ ] 免费用户20条限制提示生效
- [ ] 响应式布局在移动端和桌面端正常

### 用户体验测试
- [ ] 对话流畅，无明显卡顿
- [ ] 消息自动滚动到底部
- [ ] 输入框placeholder友好
- [ ] Loading状态清晰

---

## 交付物检查清单

- [ ] 完整的React项目代码
- [ ] 所有组件正常工作
- [ ] API调用成功
- [ ] UI美观，符合设计规范
- [ ] 响应式布局适配
- [ ] README.md (启动说明)

---

## 参考资料

- **API规范**: `API-SPECIFICATION.md`
- **UI设计**: `docs/ui/visual-design-and-animation-system.md`
- **React文档**: https://react.dev/
- **Lottie文档**: https://airbnb.io/lottie/

---

> **提示**: 严格遵循API-SPECIFICATION.md的接口定义，确保前后端数据格式一致！
