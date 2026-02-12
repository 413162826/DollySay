# 后端开发任务书 (V1 MVP)

> **开发AI**: 请严格按照本文档完成后端开发  
> **技术栈**: Spring Boot 3.x + Java 17 + PostgreSQL  
> **AI模型**: DeepSeek API (主) / Gemini API (备)  
> **开发周期**: 2周

---

## 项目概述

你正在开发一个**情感陪伴玩偶**的后端服务，为前端提供AI对话能力。

**核心功能**:
1. 接收用户消息，调用DeepSeek API生成回复
2. 分析AI回复的情绪，返回emotion标签
3. 管理免登录用户的会话和消息限制
4. 提供健康检查接口

---

## 技术要求

### 框架与版本
- Spring Boot 3.2.x
- Java 17+
- PostgreSQL 15+
- Maven

### 必需依赖
```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- PostgreSQL -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>provided</scope>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

---

## 项目结构

```
backend/
├── src/main/java/com/dollsay/backend/
│   ├── controller/
│   │   ├── ChatController.java       # 对话接口
│   │   └── HealthController.java     # 健康检查
│   ├── service/
│   │   ├── ChatService.java          # 对话业务逻辑
│   │   ├── DeepSeekService.java      # DeepSeek API调用
│   │   └── EmotionAnalyzer.java      # 情绪分析
│   ├── model/
│   │   └── GuestSession.java         # 游客会话实体
│   ├── repository/
│   │   └── GuestSessionRepository.java
│   ├── dto/
│   │   ├── ChatRequest.java          # 请求DTO
│   │   └── ChatResponse.java         # 响应DTO
│   ├── exception/
│   │   └── GlobalExceptionHandler.java
│   └── BackendApplication.java
└── src/main/resources/
    └── application.yml
```

---

## 配置文件

### application.yml
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dollsay
    username: postgres
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update  # 开发环境用update，生产用validate
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080

# DeepSeek API配置
deepseek:
  api-key: ${DEEPSEEK_API_KEY}
  api-url: https://api.deepseek.com/v1/chat/completions
  model: deepseek-chat
  
# 业务配置
app:
  guest:
    max-messages: 20  # 免登录用户最大消息数
```

---

## 核心代码实现

### 1. DTO定义

#### ChatRequest.java
```java
package com.dollsay.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "消息内容不能为空")
    private String message;
    
    @NotBlank(message = "会话ID不能为空")
    private String sessionId;
    
    @NotNull(message = "isGuest不能为空")
    private Boolean isGuest;
}
```

#### ChatResponse.java
```java
package com.dollsay.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatResponse {
    private String id;
    private String reply;
    private String emotion;  // neutral, happy, sad, thinking, surprised
    private Integer remainingMessages;  // 免登录用户剩余消息数
    private LocalDateTime timestamp;
}
```

---

### 2. 实体类

#### GuestSession.java
```java
package com.dollsay.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "guest_sessions")
public class GuestSession {
    @Id
    private String id;  // sessionId
    
    @Column(name = "messages_count")
    private Integer messagesCount = 0;
    
    @Column(name = "chat_history", columnDefinition = "jsonb")
    private String chatHistory = "[]";  // JSON数组字符串
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

---

### 3. Repository

#### GuestSessionRepository.java
```java
package com.dollsay.backend.repository;

import com.dollsay.backend.model.GuestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestSessionRepository extends JpaRepository<GuestSession, String> {
}
```

---

### 4. Service层

#### DeepSeekService.java
```java
package com.dollsay.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class DeepSeekService {
    
    @Value("${deepseek.api-key}")
    private String apiKey;
    
    @Value("${deepseek.api-url}")
    private String apiUrl;
    
    @Value("${deepseek.model}")
    private String model;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public String generateReply(String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(
            Map.of("role", "system", "content", buildSystemPrompt()),
            Map.of("role", "user", "content", userMessage)
        ));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 150);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            
            throw new RuntimeException("DeepSeek API返回格式异常");
            
        } catch (Exception e) {
            log.error("调用DeepSeek API失败", e);
            return "抱歉，我现在有点累了，稍后再聊好吗？";
        }
    }
    
    private String buildSystemPrompt() {
        return "你是一个温暖的情感陪伴玩偶，名叫小月。" +
               "你善于倾听和安慰，回复要温柔、简短（50字以内），多用共情语言。" +
               "不要问太多问题，重点是陪伴和理解。";
    }
}
```

#### EmotionAnalyzer.java
```java
package com.dollsay.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmotionAnalyzer {
    
    public String analyze(String text) {
        if (text == null) {
            return "neutral";
        }
        
        String lower = text.toLowerCase();
        
        // 开心
        if (lower.contains("开心") || lower.contains("太好了") || 
            lower.contains("哈哈") || lower.contains("真棒")) {
            return "happy";
        }
        
        // 难过
        if (lower.contains("难过") || lower.contains("抱歉") || 
            lower.contains("遗憾") || lower.contains("心疼")) {
            return "sad";
        }
        
        // 惊讶
        if (lower.contains("哇") || lower.contains("真的吗") || 
            lower.contains("不会吧") || lower.contains("天啊")) {
            return "surprised";
        }
        
        // 思考
        if (lower.contains("让我想想") || lower.contains("可能") || 
            lower.contains("也许")) {
            return "thinking";
        }
        
        return "neutral";
    }
}
```

#### ChatService.java
```java
package com.dollsay.backend.service;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import com.dollsay.backend.model.GuestSession;
import com.dollsay.backend.repository.GuestSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final DeepSeekService deepSeekService;
    private final EmotionAnalyzer emotionAnalyzer;
    private final GuestSessionRepository sessionRepository;
    
    @Value("${app.guest.max-messages}")
    private Integer maxGuestMessages;
    
    public ChatResponse processChat(ChatRequest request) {
        // 1. 检查免登录用户限制
        if (request.getIsGuest()) {
            GuestSession session = sessionRepository.findById(request.getSessionId())
                .orElseGet(() -> createNewSession(request.getSessionId()));
            
            if (session.getMessagesCount() >= maxGuestMessages) {
                throw new RuntimeException("MESSAGES_LIMIT_EXCEEDED");
            }
            
            session.setMessagesCount(session.getMessagesCount() + 1);
            sessionRepository.save(session);
        }
        
        // 2. 调用AI生成回复
        String aiReply = deepSeekService.generateReply(request.getMessage());
        
        // 3. 分析情绪
        String emotion = emotionAnalyzer.analyze(aiReply);
        
        // 4. 计算剩余消息数
        Integer remaining = null;
        if (request.getIsGuest()) {
            GuestSession session = sessionRepository.findById(request.getSessionId()).orElseThrow();
            remaining = maxGuestMessages - session.getMessagesCount();
        }
        
        // 5. 构建响应
        return ChatResponse.builder()
            .id(UUID.randomUUID().toString())
            .reply(aiReply)
            .emotion(emotion)
            .remainingMessages(remaining)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    private GuestSession createNewSession(String sessionId) {
        GuestSession session = new GuestSession();
        session.setId(sessionId);
        session.setMessagesCount(0);
        session.setChatHistory("[]");
        return session;
    }
}
```

---

### 5. Controller层

#### ChatController.java
```java
package com.dollsay.backend.controller;

import com.dollsay.backend.dto.ChatRequest;
import com.dollsay.backend.dto.ChatResponse;
import com.dollsay.backend.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return chatService.processChat(request);
    }
}
```

#### HealthController.java
```java
package com.dollsay.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {
    
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now()
        );
    }
}
```

---

### 6. 全局异常处理

#### GlobalExceptionHandler.java
```java
package com.dollsay.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "INVALID_REQUEST");
        error.put("message", ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage());
        error.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        
        if ("MESSAGES_LIMIT_EXCEEDED".equals(ex.getMessage())) {
            error.put("error", "MESSAGES_LIMIT_EXCEEDED");
            error.put("message", "免费用户已达到20条消息限制，请登录继续");
        } else {
            error.put("error", "AI_SERVICE_ERROR");
            error.put("message", "AI服务暂时不可用，请稍后重试");
        }
        
        error.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

---

## 数据库初始化

### 创建数据库
```sql
CREATE DATABASE dollsay;
```

### 表会由Hibernate自动创建
配置了`ddl-auto: update`，表会自动生成。

---

## 开发步骤

### Week 1: 基础框架
- [ ] Day 1-2: 搭建Spring Boot项目，配置PostgreSQL
- [ ] Day 3-4: 实现ChatController和基础DTO
- [ ] Day 5: 实现DeepSeekService并测试
- [ ] Day 6-7: 完成数据库集成和会话管理

### Week 2: 功能完善
- [ ] Day 8-9: 实现情绪分析逻辑
- [ ] Day 10-11: 完善异常处理和日志
- [ ] Day 12-13: 性能优化，响应时间<3s
- [ ] Day 14: 集成测试，准备联调

---

## 测试要求

### 单元测试
- [ ] DeepSeekService调用测试
- [ ] EmotionAnalyzer分析测试
- [ ] ChatService业务逻辑测试

### 集成测试
- [ ] API端到端测试
- [ ] 数据库CRUD测试
- [ ] 免费用户限制测试

### 测试命令
```bash
# 启动应用
./mvnw spring-boot:run

# 测试健康检查
curl http://localhost:8080/api/health

# 测试对话
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天好累",
    "sessionId": "guest-test-001",
    "isGuest": true
  }'
```

---

## 交付物检查清单

- [ ] 完整的Spring Boot项目代码
- [ ] application.yml配置文件
- [ ] README.md (启动说明)
- [ ] API可以成功调用DeepSeek并返回
- [ ] 免费用户20条限制生效
- [ ] 情绪分析返回正确的emotion标签
- [ ] 全局异常处理正常工作
- [ ] 数据库表自动创建成功

---

## 参考资料

- **API规范**: `API-SPECIFICATION.md`
- **DeepSeek API文档**: https://platform.deepseek.com/api-docs/
- **Spring Boot文档**: https://spring.io/projects/spring-boot

---

> **提示**: 开发过程中严格遵循API-SPECIFICATION.md的接口定义，确保前后端联调顺利！
