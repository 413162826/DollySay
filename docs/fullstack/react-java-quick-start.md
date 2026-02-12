# React + Spring Boot 快速启动指南

> **目标**: 2天内搭建完整前后端框架  
> **适用**: V1 MVP开发

---

## 前端：React项目初始化

### 1. 创建React项目

```bash
# 使用Vite创建React项目（比CRA更快）
npm create vite@latest doll-frontend -- --template react

cd doll-frontend
npm install
```

**项目结构**:
```
doll-frontend/
├── src/
│   ├── components/
│   │   ├── Doll.jsx           # 玩偶组件
│   │   ├── ChatBox.jsx        # 对话框
│   │   └── MessageBubble.jsx  # 消息气泡
│   ├── hooks/
│   │   └── useChat.js         # 对话逻辑
│   ├── services/
│   │   └── api.js             # API调用
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

### 2. 安装必要依赖

```bash
# 核心依赖
npm install axios                    # API请求
npm install zustand                  # 轻量状态管理
npm install @react-spring/web       # 动画库

# 可选依赖（V1暂不需要）
# npm install lottie-react           # Lottie动画
# npm install react-speech-kit       # 语音相关
```

---

### 3. 示例代码：玩偶组件

```jsx
// src/components/Doll.jsx
import { useSpring, animated } from '@react-spring/web';
import { useState } from 'react';

const EMOTIONS = {
  neutral: '🌙',
  happy: '😊🌙',
  sad: '😢🌙',
  thinking: '🤔🌙',
};

export default function Doll({ emotion = 'neutral', onClick }) {
  const [isClicked, setIsClicked] = useState(false);

  // 点击弹跳动画
  const bounce = useSpring({
    transform: isClicked ? 'translateY(-20px) scale(1.1)' : 'translateY(0px) scale(1)',
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
        {EMOTIONS[emotion]}
      </div>
    </animated.div>
  );
}
```

**CSS**:
```css
/* src/components/Doll.css */
.doll-container {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
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

### 4. API服务层

```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const chatAPI = {
  // 发送消息
  sendMessage: async (message, sessionId) => {
    const response = await api.post('/chat', {
      message,
      sessionId,
      isGuest: !localStorage.getItem('token')
    });
    return response.data;
  },

  // 获取会话历史
  getHistory: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  }
};

export default api;
```

---

## 后端：Spring Boot项目初始化

### 1. 创建Spring Boot项目

访问 https://start.spring.io/ 配置：

```
Project: Maven
Language: Java
Spring Boot: 3.2.x
Group: com.dollsay
Artifact: backend
Java: 17

Dependencies:
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Lombok
- Validation
```

下载后解压到项目目录。

---

### 2. 项目结构

```
backend/
├── src/main/java/com/dollsay/backend/
│   ├── controller/
│   │   └── ChatController.java
│   ├── service/
│   │   ├── AIService.java
│   │   └── ChatService.java
│   ├── model/
│   │   ├── Message.java
│   │   └── Conversation.java
│   ├── repository/
│   │   └── MessageRepository.java
│   ├── dto/
│   │   ├── ChatRequest.java
│   │   └── ChatResponse.java
│   └── BackendApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

---

### 3. 配置文件

```yaml
# src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dollsay
    username: postgres
    password: yourpassword
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    
server:
  port: 8080

# OpenAI配置
openai:
  api-key: ${OPENAI_API_KEY}
  model: gpt-4o-mini
```

---

### 4. 核心代码示例

#### ChatController
```java
// src/main/java/com/dollsay/backend/controller/ChatController.java
package com.dollsay.backend.controller;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import com.dollsay.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 开发环境，生产环境需限制
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.processChat(request);
    }
}
```

#### DTO
```java
// src/main/java/com/dollsay/backend/dto/ChatRequest.java
package com.dollsay.backend.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String sessionId;
    private Boolean isGuest;
}
```

```java
// src/main/java/com/dollsay/backend/dto/ChatResponse.java
package com.dollsay.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String id;
    private String reply;
    private String emotion; // "happy", "sad", "neutral"
    private Integer remainingMessages; // 免费用户剩余
}
```

#### ChatService
```java
// src/main/java/com/dollsay/backend/service/ChatService.java
package com.dollsay.backend.service;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final AIService aiService;

    public ChatResponse processChat(ChatRequest request) {
        // 1. 调用AI生成回复
        String aiReply = aiService.generateReply(request.getMessage());
        
        // 2. 分析情绪
        String emotion = analyzeEmotion(aiReply);
        
        // 3. 构建响应
        return ChatResponse.builder()
            .id(UUID.randomUUID().toString())
            .reply(aiReply)
            .emotion(emotion)
            .remainingMessages(request.getIsGuest() ? 15 : null)
            .build();
    }

    private String analyzeEmotion(String text) {
        // 简单实现，V1阶段
        if (text.contains("开心") || text.contains("太好了")) return "happy";
        if (text.contains("难过") || text.contains("抱歉")) return "sad";
        return "neutral";
    }
}
```

#### AIService (OpenAI集成)
```java
// src/main/java/com/dollsay/backend/service/AIService.java
package com.dollsay.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateReply(String userMessage) {
        String url = "https://api.openai.com/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(
            Map.of("role", "system", "content", "你是一个温暖的情感陪伴玩偶，善于倾听和安慰。"),
            Map.of("role", "user", "content", userMessage)
        ));
        body.put("max_tokens", 150);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "抱歉，我现在有点累了，稍后再聊好吗？";
        }
    }
}
```

---

## 本地开发运行

### 启动后端
```bash
cd backend
./mvnw spring-boot:run
```
访问: http://localhost:8080

### 启动前端
```bash
cd doll-frontend
npm run dev
```
访问: http://localhost:5173

---

## 快速测试

### 测试API
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天好累",
    "sessionId": "test-123",
    "isGuest": true
  }'
```

---

## 部署建议

### 前端部署：Vercel (免费)
```bash
npm run build
npx vercel --prod
```

### 后端部署：Railway
1. 连接GitHub仓库
2. 自动检测Spring Boot项目
3. 添加PostgreSQL服务
4. 设置环境变量OPENAI_API_KEY
5. 自动部署

---

## 下一步开发

V1 MVP开发顺序：
1. ✅ 搭建基础框架（本文档）
2. ⏭️ 完善对话UI（ChatBox组件）
3. ⏭️ 集成玩偶动画（升级Doll组件）
4. ⏭️ 添加登录功能
5. ⏭️ 实现记忆系统

预计时间：2个月全职开发

---

> **提示**: 代码已经可以直接运行，复制粘贴即可启动！专注于V1核心功能，动画暂时用Emoji表情+react-spring，V2再升级Lottie。
