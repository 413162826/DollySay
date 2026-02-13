# Railway.app 部署指南

本指南将帮助你在 5 分钟内将 DollSay 后端部署到 Railway.app 云平台。

## 前置准备

- [x] GitHub 账号
- [ ] Railway 账号 (使用 GitHub 登录即可)
- [ ] DeepSeek API Key ([获取地址](https://platform.deepseek.com/))

---

## 部署步骤

### 1. 推送代码到 GitHub

```bash
# 如果还没有推送到 GitHub
cd "d:\Program Files\dev-project\sgw\DollSay"
git add .
git commit -m "feat: 添加 Railway 部署配置"
git push origin main
```

### 2. 注册并登录 Railway

1. 访问 [Railway.app](https://railway.app/)
2. 点击 **Start a New Project**
3. 使用 GitHub 账号登录

### 3. 创建后端项目

1. 在 Railway 控制台点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 授权 Railway 访问你的 GitHub 仓库
4. 选择 `DollSay` 仓库
5. Railway 会自动检测到 Spring Boot 项目

### 4. 配置根目录

> [!IMPORTANT]
> Railway 默认会从仓库根目录构建,需要指定 `backend` 目录

1. 在项目设置中找到 **Settings** → **Service Settings**
2. 设置 **Root Directory** 为 `backend`
3. 保存设置

### 5. 添加 PostgreSQL 数据库

1. 在项目页面点击 **New** → **Database** → **Add PostgreSQL**
2. Railway 会自动创建数据库并注入 `DATABASE_URL` 环境变量
3. 无需手动配置连接信息

### 6. 配置环境变量

在 **Variables** 标签页添加以下环境变量:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DEEPSEEK_API_KEY` | `sk-xxxxx` | 你的 DeepSeek API Key |
| `SHOW_SQL` | `false` | 生产环境关闭 SQL 日志 |
| `DB_DRIVER` | `org.postgresql.Driver` | PostgreSQL 驱动 |
| `DB_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` | PostgreSQL 方言 |

> [!TIP]
> `DATABASE_URL`、`DB_USERNAME`、`DB_PASSWORD` 会由 Railway PostgreSQL 自动注入,无需手动配置

### 7. 部署

1. 配置完成后,Railway 会自动触发部署
2. 在 **Deployments** 标签页查看部署进度
3. 等待构建完成(首次约 3-5 分钟)

### 8. 获取公网地址

1. 部署成功后,在 **Settings** → **Networking** 中
2. 点击 **Generate Domain**
3. 获得类似 `your-app-name.railway.app` 的域名

---

## 验证部署

### 测试健康检查

```bash
curl https://your-app-name.railway.app/api/health
```

**预期响应:**
```json
{
  "status": "UP",
  "timestamp": "2026-02-13T01:30:00"
}
```

### 测试对话接口

```bash
curl -X POST https://your-app-name.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "sessionId": "test-001",
    "isGuest": true
  }'
```

**预期响应:**
```json
{
  "id": "uuid-xxxx",
  "reply": "你好呀!我是小月,很高兴认识你~",
  "emotion": "happy",
  "remainingMessages": 19,
  "timestamp": "2026-02-13T01:30:00"
}
```

---

## 前端配置

修改前端 `.env.local` 文件:

```env
VITE_API_BASE_URL=https://your-app-name.railway.app
```

重启前端开发服务器:
```bash
cd frontend
npm run dev
```

---

## 常见问题

### 1. 部署失败: "Build failed"

**原因:** Maven 构建失败或内存不足

**解决方案:**
- 检查 `pom.xml` 依赖是否正确
- 在 Railway 设置中增加内存限制 (Settings → Resources)

### 2. 应用启动失败: "Application failed to start"

**原因:** 环境变量未配置或数据库连接失败

**解决方案:**
- 检查 `DEEPSEEK_API_KEY` 是否配置
- 确认 PostgreSQL 服务已添加
- 查看 Logs 标签页的详细错误信息

### 3. API 调用返回 500 错误

**原因:** DeepSeek API Key 无效或余额不足

**解决方案:**
- 登录 [DeepSeek 平台](https://platform.deepseek.com/) 检查 API Key
- 确认账户余额充足

### 4. 数据库连接超时

**原因:** Railway PostgreSQL 服务未正确关联

**解决方案:**
- 在项目页面确认 PostgreSQL 服务已添加
- 检查 `DATABASE_URL` 环境变量是否自动注入
- 重启服务: Settings → Restart

---

## 成本说明

Railway 免费套餐:
- **免费额度:** 每月 $5 (约 500 小时运行时间)
- **数据库:** PostgreSQL 免费 1GB 存储
- **流量:** 100GB/月

**预估使用:**
- 后端服务: 24/7 运行约消耗 $3-4/月
- 数据库: 免费额度内
- **总计:** 免费额度完全够用

---

## 下一步

- [ ] 配置自定义域名 (可选)
- [ ] 设置 HTTPS 证书 (Railway 自动提供)
- [ ] 配置 CI/CD 自动部署 (推送代码自动部署)
- [ ] 监控和日志分析

---

## 技术支持

- Railway 文档: https://docs.railway.app/
- DeepSeek API 文档: https://platform.deepseek.com/api-docs/
- 项目 Issues: 在 GitHub 仓库提交问题

---

> **恭喜!** 🎉 你的后端服务已成功部署到云端,现在可以从任何地方访问了!
