# MVP开发计划

> **撰写者**: 全栈开发 (DHH 思维模型)  
> **日期**: 2026-02-12  
> **核心原则**: Convention over Configuration + Majestic Monolith + Shipping is a Feature

---

## 开发哲学

**目标**: 2个月上线MVP，验证核心价值

**原则**:
- ✅ **完成 > 完美**: 先shipping，再优化
- ✅ **删代码 > 写代码**: 能不写的就不写
- ✅ **约定 > 配置**: 遵循最佳实践，减少决策
- ✅ **单体 > 微服务**: 一个仓库、一次部署

---

## 技术方案细化

### 前端技术栈

```json
{
  "name": "emotional-companion-doll",
  "dependencies": {
    "none": "pure vanilla JS"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "sass": "^1.70.0"
  }
}
```

**项目结构**:
```
/frontend
  /src
    /assets
      doll.svg          ← 玩偶SVG
      emotions/         ← 表情资源
    /js
      app.js            ← 主应用逻辑
      api.js            ← API调用封装
      doll.js           ← 玩偶动画控制
      storage.js        ← localStorage封装
    /css
      main.scss         ← 主样式
      doll.scss         ← 玩偶样式
      chat.scss         ← 对话样式
    index.html          ← 入口页面
  vite.config.js
```

---

### 后端技术栈

```json
{
  "name": "emotional-companion-api",
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "openai": "^4.28.0",
    "dotenv": "^16.4.0",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.0"
  }
}
```

**项目结构**:
```
/backend
  /src
    /routes
      auth.js           ← 登录路由
      chat.js           ← 对话路由
      user.js           ← 用户路由
    /services
      ai-service.js     ← AI调用
      memory-service.js ← 记忆检索
      auth-service.js   ← JWT处理
    /models
      user.js           ← 用户模型
      conversation.js   ← 对话模型
    /middleware
      auth.js           ← JWT验证
      rate-limit.js     ← 限流
    /db
      schema.sql        ← 数据库Schema
      migrations/       ← 迁移脚本
    /config
      database.js       ← 数据库配置
      openai.js         ← AI配置
    app.js              ← Express应用
    server.js           ← 服务器入口
  Dockerfile
  .env.example
```

---

## 开发里程碑

### Week 1-2: 基础设施搭建

**任务**:
1. ✅ 初始化前后端项目
2. ✅ 数据库Schema创建
3. ✅ Railway部署配置
4. ✅ CI/CD管道(GitHub Actions)

**产出**:
- Git仓库结构
- Railway自动部署
- 数据库上线

**时间**: 3-4天

---

### Week 3-4: MVP核心功能 - 免登录对话

**前端任务**:
1. ✅ 页面布局(移动端优先)
2. ✅ 玩偶SVG + 基础表情(5种)
3. ✅ 对话气泡组件
4. ✅ 消息发送/接收逻辑
5. ✅ sessionStorage管理

**后端任务**:
1. ✅ `/api/chat` 接口
2. ✅ OpenAI API集成
3. ✅ 情绪分析(Prompt方式)
4. ✅ guest_sessions表CRUD
5. ✅ 20条限制逻辑

**集成测试**:
- E2E流程: 打开页面 → 发送10条消息 → 玩偶表情切换

**时间**: 7-10天

---

### Week 5-6: 登录与记忆系统

**前端任务**:
1. ✅ 登录弹窗UI
2. ✅ 第三方登录按钮(微信/QQ)
3. ✅ JWT token管理
4. ✅ 登录态持久化

**后端任务**:
1. ✅ `/api/auth/login` (OAuth)
2. ✅ `/api/auth/refresh` (token刷新)
3. ✅ JWT签发/验证中间件
4. ✅ users表CRUD
5. ✅ conversations + messages表CRUD
6. ✅ 记忆检索逻辑(最近20条)

**产出**:
- 完整登录流程
- 对话记忆功能

**时间**: 7-10天

---

### Week 7: 付费与转化

**前端任务**:
1. ✅ 免费额度提示UI
2. ✅ 付费引导弹窗
3. ✅ 支付集成(微信/支付宝)

**后端任务**:
1. ✅ 支付回调接口
2. ✅ 订阅状态管理
3. ✅ 权限验证中间件

**时间**: 4-5天

---

### Week 8: 优化与上线

**任务**:
1. ✅ 性能优化(代码分割、懒加载)
2. ✅ SEO优化(meta标签、sitemap)
3. ✅ 错误监控(Sentry)
4. ✅ 用户测试(5-10人)
5. ✅ Bug修复
6. ✅ 正式上线

**时间**: 5-7天

---

## API接口设计

### POST /api/chat

**请求**:
```json
{
  "message": "今天好累...",
  "session_id": "uuid", // 免登录必填
  "conversation_id": "uuid", // 登录后可选
  "user_id": "uuid" // 登录后必填
}
```

**响应**:
```json
{
  "id": "message_uuid",
  "reply": "辛苦了，工作很忙吗？",
  "emotion": "comfort",
  "remaining_messages": 15, // 免登录用户
  "created_at": "2026-02-12T15:00:00Z"
}
```

---

### POST /api/auth/login

**请求**:
```json
{
  "provider": "wechat",
  "code": "wx_auth_code"
}
```

**响应**:
```json
{
  "token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "username": "小雨",
    "avatar": "url"
  }
}
```

---

### GET /api/conversations

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "关于工作压力的对话",
      "last_message": "辛苦了...",
      "updated_at": "2026-02-12T15:00:00Z"
    }
  ]
}
```

---

## 开发工具链

### 本地开发

```bash
# 前端
cd frontend
npm install
npm run dev  # http://localhost:5173

# 后端
cd backend
docker-compose up -d  # PostgreSQL
npm install
npm run dev  # http://localhost:3000
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: emotional_companion
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

### 代码规范

**ESLint配置**(前后端共用):
```json
{
  "extends": "eslint:recommended",
  "rules": {
    "no-console": "warn",
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

**Prettier配置**:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2
}
```

**Git Hooks**(husky):
```json
{
  "pre-commit": "npm run lint && npm run test"
}
```

---

## 部署流程

### 自动化部署(Railway)

**.railwayignore**:
```
node_modules/
.env
*.log
```

**railway.json**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/health"
  }
}
```

**部署命令**:
```bash
# 推送到GitHub main分支 → 自动触发Railway部署
git push origin main
```

---

## 测试策略

### 单元测试(可选，MVP可跳过)
- 核心业务逻辑(AI prompt构建)
- 工具函数(日期格式化等)

### 集成测试(必须)
- API端到端测试(Postman/curl)
- 登录流程测试
- 对话流程测试

### 手动测试(必须)
- 5-10个真实用户测试
- 观察使用流程
- 收集反馈

---

## 监控与告警

### 必备指标
1. **API可用性**: Uptime > 99.5%
2. **响应时间**: P95 < 2s
3. **错误率**: < 1%
4. **AI调用成功率**: > 98%

### 工具
- **日志**: Winston → Railway Logs
- **告警**: Uptime Robot → Slack
- **性能**: Railway内置Metrics

---

## 时间估算总结

| 阶段 | 任务 | 时间 |
|------|------|------|
| Week 1-2 | 基础设施 | 3-4天 |
| Week 3-4 | 免登录对话 | 7-10天 |
| Week 5-6 | 登录与记忆 | 7-10天 |
| Week 7 | 付费功能 | 4-5天 |
| Week 8 | 优化上线 | 5-7天 |
| **总计** | **MVP上线** | **~2个月** |

**风险Buffer**: +2周(应对意外延期)

---

## 技术债务管理

### 允许的技术债(MVP)
- ❌ 无单元测试覆盖
- ❌ 代码未充分注释
- ❌ 性能未深度优化

### 不允许的技术债
- ✅ 数据库Schema设计不当
- ✅ 安全漏洞
- ✅ 核心API未文档化

**原则**: 影响未来重构成本的不欠债，可快速补救的可欠债

---

## 下一步: 开始编码

**现在就开始**:
1. 创建GitHub仓库
2. 初始化前后端项目
3. 设置Railway部署
4. 第一个API: `GET /health` (健康检查)

**记住DHH的话**:
> "The best code is no code at all. Every new line of code is a liability."

能用现成的就不自己写。能删的就删掉。能简化的就简化。

---

> **DHH的提醒**: 不要过度设计。这是MVP，不是产品的最终形态。先shipping，让真实用户告诉你哪里需要优化。Shipping is a feature.
