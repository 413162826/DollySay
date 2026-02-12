# 系统架构设计文档 (ADR)

> **撰写者**: CTO (Werner Vogels 思维模型)  
> **日期**: 2026-02-12  
> **核心原则**: Everything Fails + API First + You Build It You Run It

---

## 架构决策概览

### 核心决策
1. **Majestic Monolith** - 单体架构，非微服务
2. **API First** - 前后端通过REST API通信
3. **Serverless优先** - 用托管服务减少运维负担
4. **PostgreSQL** - 单一数据库，非分布式
5. **边缘计算** - CDN + Edge Functions加速全球访问

---

## 系统架构图

```
┌─────────────────────────────────────────────┐
│              CloudFlare CDN                  │ ← 全球加速
│        (静态资源 + Edge Functions)           │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│            前端 (Vanilla JS SPA)             │
│  - index.html                                │
│  - app.js (对话逻辑)                         │
│  - doll.js (玩偶动画)                        │
│  - styles.css                                │
└──────────────┬──────────────────────────────┘
               │ REST API (HTTPS)
┌──────────────▼──────────────────────────────┐
│         后端 (Node.js / Express)             │
│  ┌────────────────────────────────────────┐ │
│  │  API Gateway                           │ │
│  │  - /api/chat (对话)                    │ │
│  │  - /api/auth (登录)                    │ │
│  │  - /api/user (用户信息)                │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │  Business Logic                        │ │
│  │  - ChatService (AI调用 + 情绪分析)    │ │
│  │  - MemoryService (记忆检索)           │ │
│  │  - AuthService (JWT认证)              │ │
│  └────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴─────┐
        │            │
┌───────▼──────┐ ┌──▼────────────┐
│ PostgreSQL   │ │  AI API       │
│ (主数据库)   │ │  (GPT/Claude) │
│              │ │               │
│ - users      │ └───────────────┘
│ - conversations
│ - messages
│ - sessions
└──────────────┘
```

---

## 技术栈选型

### 前端

**决策**: Vanilla JavaScript + HTML5 (非React/Vue)

**理由**:
- ✅ **简单性**: 一人开发，不需要复杂框架
- ✅ **性能**: 无框架overhead，加载快
- ✅ **可控性**: 完全掌控代码，无黑盒
- ✅ **未来灵活**: 需要时可逐步迁移到框架

**工具链**:
- 构建: Vite (开发服务器 + 打包)
- 动画: CSS + 少量GSAP
- 状态管理: 轻量localStorage + sessionStorage
- HTTP: Fetch API

---

### 后端

**决策**: Node.js + Express.js

**理由**:
- ✅ **一人全栈**: 前后端同语言，降低认知负担
- ✅ **成熟生态**: npm包丰富，轮子多
- ✅ **异步友好**: 适合I/O密集(AI API调用)
- ✅ **部署简单**: Dockerfile一行搞定

**框架选择**:
- Express.js (轻量，灵活)
- 不用Next.js(太重) / Nest.js(过度工程)

---

### 数据库

**决策**: PostgreSQL 15+

**理由**:
- ✅ **成熟稳定**: Boring technology
- ✅ **功能完整**: JSONB字段存储灵活数据
- ✅ **扩展性**: pg_vector插件支持向量搜索(记忆检索)
- ✅ **托管方便**: Supabase / Railway 自带PostgreSQL

**Schema设计**:
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  oauth_provider VARCHAR(20), -- 'wechat', 'qq', 'email'
  oauth_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 对话会话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255), -- 会话标题(根据首条消息生成)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  emotion VARCHAR(20), -- 'happy', 'sad', 'neutral', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 免登录会话表(临时)
CREATE TABLE guest_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL DEFAULT '[]', -- 存储消息数组
  message_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- 索引
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_guest_sessions_expires ON guest_sessions(expires_at);
```

---

### AI服务

**决策**: OpenAI GPT-4o-mini (主) + Claude Haiku (备)

**理由**:
- GPT-4o-mini: 
  - ✅ 性价比高($0.15/1M input tokens)
  - ✅ 快速(< 2s响应)
  - ✅ 情感理解好
- Claude Haiku:
  - ✅ 备份方案(防OpenAI宕机)
  - ✅ 多样性(不同用户可选不同AI)

**不选择自部署开源模型**:
- 运维成本高
- GPU费用贵
- 一人公司负担不起

---

### 托管服务

**决策**: Railway.app (all-in-one)

**理由**:
- ✅ **一键部署**: Git push即部署
- ✅ **自带PostgreSQL**: 无需额外配置
- ✅ **自动扩容**: 流量高时自动Scale
- ✅ **按用量计费**: 早期成本低
- ✅ **监控内置**: 日志 + Metrics免费

**备选方案**:
- Vercel (前端) + Supabase (后端+DB)
- Fly.io (全栈)

---

## 核心功能架构设计

### 1. 免登录对话流程

```
用户访问页面
  ↓
前端检查: localStorage有session_id?
  ├─ 无 → 生成UUID作为session_id → localStorage保存
  └─ 有 → 使用现有session_id
  ↓
用户发送消息
  ↓
POST /api/chat
  {
    "session_id": "...",
    "message": "今天好累...",
    "is_guest": true
  }
  ↓
后端逻辑:
  1. 查询 guest_sessions 表
  2. 检查 message_count < 20
  3. 调用 OpenAI API
  4. 分析情绪(emotion)
  5. 更新 guest_sessions.messages (JSONB数组)
  6. 返回AI回复 + emotion
  ↓
前端收到响应
  {
    "reply": "辛苦了...",
    "emotion": "comfort",
    "remaining_messages": 15
  }
  ↓
前端:
  - 显示AI回复
  - 切换玩偶表情为 "comfort"
  - 显示剩余消息数(若 < 5)
```

**关键设计**:
- Session存储在DB而非内存(防服务器重启丢失)
- 24小时过期自动清理(定时任务)
- JSONB存储消息(避免额外表join)

---

### 2. 登录后对话流程

```
用户登录
  ↓
POST /api/auth/login
  {
    "oauth_provider": "wechat",
    "code": "..."
  }
  ↓
后端:
  1. 调用OAuth API验证
  2. 创建/查找 user
  3. 签发JWT token
  4. 返回token + user_id
  ↓
前端:
  - localStorage保存token
  - 后续请求带上 Authorization: Bearer <token>
  ↓
用户发送消息
  ↓
POST /api/chat
  {
    "message": "今天好累...",
    "user_id": "...",
    "conversation_id": "..." (可选)
  }
  Headers: { Authorization: "Bearer ..." }
  ↓
后端逻辑:
  1. 验证JWT token
  2. 若无conversation_id → 创建新conversation
  3. 检索历史记忆(最近20条messages)
  4. 构建Prompt: system + 历史 + 当前消息
  5. 调用OpenAI API
  6. 保存消息到 messages 表
  7. 返回AI回复 + emotion
```

**记忆检索优化**:
- Phase 1: 简单的"最近N条"
- Phase 2: 向量相似度检索(pg_vector)
- Phase 3: 主题聚类 + 重要性排序

---

### 3. 情绪分析实现

**方案A**: GPT函数调用(Function Calling)

```javascript
const functions = [{
  name: "analyze_emotion",
  description: "分析用户情绪",
  parameters: {
    type: "object",
    properties: {
      emotion: {
        type: "string",
        enum: ["happy", "sad", "neutral", "surprised", "thinking"]
      }
    }
  }
}];

const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [...],
  functions: functions,
  function_call: "auto"
});

const emotion = response.choices[0].message.function_call.arguments.emotion;
```

**方案B**: Prompt Engineering(更便宜)

```
System Prompt:
你是一个温暖的情感陪伴玩偶。
在每次回应后，用<emotion>标签标注用户的情绪。
可选情绪: happy, sad, neutral, surprised, thinking

示例:
用户: 今天升职了！
你的回复: 太棒了！恭喜你！<emotion>happy</emotion>
```

后端正则提取:
```javascript
const match = aiReply.match(/\u003cemotion\u003e(.*?)\u003c\/emotion\u003e/);
const emotion = match ? match[1] : 'neutral';
```

**选择**: 方案B (更便宜，延迟更低)

---

## 故障模式与对策 (Failure Modes)

### 故障1: AI API超时/宕机

**检测**: API调用超时 > 10s

**对策**:
1. 立即切换到备用AI (Claude)
2. 前端显示: "正在换个思路回复..."
3. 降级方案: 预设模板回复
4. 告警: Slack通知

**代码**:
```javascript
async function callAI(messages) {
  try {
    return await callOpenAI(messages, {timeout: 8000});
  } catch (err) {
    logger.warn('OpenAI failed, fallback to Claude');
    return await callClaude(messages, {timeout: 8000});
  }
}
```

---

### 故障2: 数据库连接失败

**检测**: PostgreSQL连接错误

**对策**:
1. 连接池自动重试(3次)
2. 免登录用户: 降级到内存存储(单次会话)
3. 登录用户: 返回友好错误 "服务繁忙，请稍后再试"
4. 告警: 立即人工介入

---

### 故障3: 用户刷爆免费额度

**检测**: 恶意用户单日发送1000+消息

**对策**:
1. Rate Limiting: 每IP每小时最多100条
2. 异常检测: 同一session_id超限 → 暂时封禁
3. Cloudflare Bot Protection

**实现**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 每IP 100次
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/chat', limiter);
```

---

## 可观测性 (Observability)

### 关键指标

**RED Metrics**:
- **Rate**: API请求速率 (req/s)
- **Errors**: 错误率 (%)
- **Duration**: 响应时间 (P50, P95, P99)

**业务指标**:
- AI调用成功率
- 平均对话轮次
- 转化率(免费→登录)

### 工具选择

**日志**: Winston + Railway内置日志  
**监控**: Railway Metrics (免费)  
**告警**: Uptime Robot + Slack Webhook

---

## 安全性设计

### 1. API安全

- ✅ HTTPS only (强制)
- ✅ CORS限制(只允许自己的域名)
- ✅ Rate Limiting (防滥用)
- ✅ JWT token(有效期7天，可刷新)

### 2. 数据安全

- ✅ 密码哈希(bcrypt, 12 rounds)
- ✅ OAuth token加密存储
- ✅ 敏感数据(聊天记录)加密(可选)

### 3. AI内容审核

- ✅ OpenAI Moderation API过滤不当内容
- ✅ 预设黑名单词汇
- ✅ 用户举报机制

```javascript
const moderation = await openai.moderations.create({
  input: userMessage
});

if (moderation.results[0].flagged) {
  return {error: '您的消息包含不适当内容'};
}
```

---

## 部署架构

### 开发环境
```
本地: Node.js + PostgreSQL (Docker Compose)
测试: Railway Preview环境 (PR自动部署)
```

### 生产环境
```
Railway Production
  ├─ Web Service (Node.js)
  ├─ PostgreSQL (自动备份)
  └─ Redis (未来缓存用)
  
Cloudflare
  ├─ DNS
  ├─ CDN (静态资源)
  └─ WAF (防火墙)
```

---

## 扩展性考虑

### 短期(月活 < 10K)
- 单实例足够
- 垂直扩展(加CPU/内存)

### 中期(月活 10K-100K)
- 水平扩展(多实例 + Load Balancer)
- Redis缓存热数据
- CDN加速静态资源

### 长期(月活 > 100K)
- 读写分离(PostgreSQL Replica)
- 向量数据库独立部署(Pinecone)
- AI服务自部署(降低成本)

**原则**: 不过早优化，根据实际流量决策

---

## 成本估算

### MVP阶段(月活 1000)

| 项目 | 费用/月 |
|------|---------|
| Railway (Web + DB) | $5-20 |
| OpenAI API (10K对话) | $3-5 |
| Cloudflare | $0 (免费层) |
| 域名 | $1 |
| **总计** | **$10-30** |

### 规模化阶段(月活 50K)

| 项目 | 费用/月 |
|------|---------|
| Railway Pro | $100-200 |
| OpenAI API (500K对话) | $150-250 |
| Cloudflare Pro | $20 |
| **总计** | **$270-470** |

**盈亏平衡**: 500付费用户 (¥29/月) = $2000+，覆盖成本。

---

## 下一步: 交接给全栈开发

CTO的架构设计完成，现在需要**全栈开发 (DHH)**:
1. 制定详细的开发计划
2. 搭建项目脚手架
3. 定义API接口规范
4. 估算开发时间

---

> **Vogels的提醒**: Everything fails, all the time. 这个架构的每一层都有后备方案。AI挂了有备用，数据库挂了有降级。永远为失败而设计，而不是试图避免失败。
