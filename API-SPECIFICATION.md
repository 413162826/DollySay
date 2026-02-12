# API 接口规范文档 (V1 MVP)

> **版本**: V1.0  
> **更新日期**: 2026-02-12  
> **前后端契约**: 本文档是前后端开发的唯一依据

---

## 基础信息

### 服务地址
- **开发环境**: `http://localhost:8080`
- **生产环境**: 待定

### 通用规范
- **字符编码**: UTF-8
- **请求格式**: JSON
- **响应格式**: JSON
- **时间格式**: ISO 8601 (例: `2026-02-12T16:25:28+08:00`)

### HTTP状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 500 | 服务器错误 |

### 通用响应结构 (错误时)
```json
{
  "error": "错误简短描述",
  "message": "详细错误信息",
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

---

## 核心接口

### 1. 发送消息（对话）

#### 请求
```http
POST /api/chat
Content-Type: application/json
```

**请求Body**:
```json
{
  "message": "今天好累啊",
  "sessionId": "guest-uuid-xxx",
  "isGuest": true
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| message | string | 是 | 用户发送的消息内容 |
| sessionId | string | 是 | 会话ID，免登录用户传"guest-{uuid}"，登录用户传用户ID |
| isGuest | boolean | 是 | 是否为游客，true=免登录，false=已登录 |

#### 响应
```json
{
  "id": "msg-uuid-xxx",
  "reply": "辛苦了，工作很忙吗？我在这里陪你，想聊聊今天发生了什么吗？",
  "emotion": "neutral",
  "remainingMessages": 15,
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 消息唯一ID |
| reply | string | AI回复内容 |
| emotion | string | 情绪标签: `neutral`, `happy`, `sad`, `thinking`, `surprised` |
| remainingMessages | integer | 免登录用户剩余消息数，登录用户为null |
| timestamp | string | 回复时间 |

---

### 2. 健康检查

#### 请求
```http
GET /api/health
```

#### 响应
```json
{
  "status": "UP",
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

---

## 情绪标签定义

前端根据`emotion`字段切换玩偶表情：

| emotion值 | 说明 | 对应表情 |
|-----------|------|----------|
| `neutral` | 平静/倾听 | 默认表情 |
| `happy` | 开心/鼓励 | 笑脸表情 |
| `sad` | 难过/安慰 | 安慰表情 |
| `thinking` | 思考中 | 思考表情 |
| `surprised` | 惊讶 | 惊讶表情 |

**情绪判断逻辑** (后端实现):
```
AI回复包含"开心" OR "太好了" → happy
AI回复包含"难过" OR "抱歉" → sad
AI回复包含"思考" OR "让我想想" → thinking
AI回复包含"哇" OR "真的吗" → surprised
其他 → neutral
```

---

## 免登录用户限制

**V1阶段规则**:
- 免登录用户每次会话限制**20条消息**
- 前端localStorage存储已发送消息数
- 每次发送消息，后端返回`remainingMessages`
- 当`remainingMessages = 0`时，前端显示登录引导弹窗

**示例流程**:
```
第1条消息 → remainingMessages: 19
第2条消息 → remainingMessages: 18
...
第19条消息 → remainingMessages: 1
第20条消息 → remainingMessages: 0 → 前端弹窗引导登录
```

---

## AI API配置

### DeepSeek API

**接口地址**: `https://api.deepseek.com/v1/chat/completions`

**请求示例**:
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个温暖的情感陪伴玩偶，名叫小月。你善于倾听和安慰，回复要温柔、简短（50字以内），多用共情语言。"
    },
    {
      "role": "user",
      "content": "今天好累啊"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```

**鉴权**:
```http
Authorization: Bearer YOUR_DEEPSEEK_API_KEY
```

**费用**: ¥0.001/1K tokens (约$0.00014)

---

### Gemini API

**接口地址**: `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

**请求示例**:
```json
{
  "contents": [{
    "parts": [{
      "text": "你是一个温暖的情感陪伴玩偶，名叫小月。用户说：今天好累啊"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 150
  }
}
```

**鉴权**:
```http
x-goog-api-key: YOUR_GEMINI_API_KEY
```

**费用**: 免费额度15次/分钟

---

## 数据库Schema (V1)

### 表: `guest_sessions` (免登录会话)

```sql
CREATE TABLE guest_sessions (
    id VARCHAR(255) PRIMARY KEY,
    messages_count INTEGER DEFAULT 0,
    chat_history JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**字段说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | varchar(255) | sessionId |
| messages_count | integer | 已发送消息数 |
| chat_history | jsonb | 完整对话历史 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

**chat_history JSON结构**:
```json
[
  {"role": "user", "content": "今天好累", "timestamp": "2026-02-12T16:00:00+08:00"},
  {"role": "assistant", "content": "辛苦了...", "timestamp": "2026-02-12T16:00:02+08:00"}
]
```

---

## 错误处理

### 常见错误响应

#### 1. 消息内容为空
```json
{
  "error": "INVALID_REQUEST",
  "message": "消息内容不能为空",
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

#### 2. 免费用户超出限制
```json
{
  "error": "MESSAGES_LIMIT_EXCEEDED",
  "message": "免费用户已达到20条消息限制，请登录继续",
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

#### 3. AI服务异常
```json
{
  "error": "AI_SERVICE_ERROR",
  "message": "AI服务暂时不可用，请稍后重试",
  "timestamp": "2026-02-12T16:25:28+08:00"
}
```

---

## CORS配置

后端必须允许跨域请求：

```java
@CrossOrigin(origins = "http://localhost:5173") // 开发环境
```

生产环境改为实际前端域名。

---

## 性能指标

| 指标 | 要求 |
|------|------|
| API响应时间 | < 3秒 (含AI调用) |
| AI回复最大长度 | 150 tokens (约50-100字) |
| 数据库查询 | < 100ms |

---

## 测试用例

### 1. 正常对话
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天好累啊",
    "sessionId": "guest-test-001",
    "isGuest": true
  }'
```

**预期响应**: 状态码200，包含reply和emotion

### 2. 空消息
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "",
    "sessionId": "guest-test-001",
    "isGuest": true
  }'
```

**预期响应**: 状态码400，错误信息"消息内容不能为空"

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| V1.0 | 2026-02-12 | 初始版本，支持基础对话 |

---

## 附录：完整请求示例

### 使用curl测试
```bash
# 发送第一条消息
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好，小月",
    "sessionId": "guest-abc-123",
    "isGuest": true
  }'

# 健康检查
curl http://localhost:8080/api/health
```

### 使用JavaScript (axios)
```javascript
import axios from 'axios';

const sendMessage = async (message) => {
  const response = await axios.post('http://localhost:8080/api/chat', {
    message,
    sessionId: localStorage.getItem('sessionId') || 'guest-' + crypto.randomUUID(),
    isGuest: !localStorage.getItem('token')
  });
  return response.data;
};
```

---

> **重要提醒**: 
> - 前后端必须严格遵循本文档定义的接口格式
> - 任何变更必须同步更新本文档
> - 前后端联调前，双方先用Mock数据验证各自逻辑
