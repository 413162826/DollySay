# DollSay Backend

情感陪伴玩偶后端服务 - Spring Boot 3.x + PostgreSQL + DeepSeek AI

## 环境要求

- **Java**: JDK 17+
- **Maven**: 3.8+
- **PostgreSQL**: 15+
- **DeepSeek API Key**: [申请地址](https://platform.deepseek.com/)

## 快速开始

### 1. 准备数据库

#### 方式一:Docker (推荐)
```bash
docker run --name dollsay-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dollsay \
  -p 5432:5432 \
  -d postgres:15
```

#### 方式二:本地PostgreSQL
```sql
CREATE DATABASE dollsay;
```

### 2. 配置环境变量

创建 `.env` 文件或配置环境变量:
```bash
export DEEPSEEK_API_KEY=your_api_key_here
export DB_PASSWORD=postgres
```

Windows PowerShell:
```powershell
$env:DEEPSEEK_API_KEY="your_api_key_here"
$env:DB_PASSWORD="postgres"
```

### 3. 运行应用

```bash
# 下载依赖
mvn clean install

# 启动应用
mvn spring-boot:run
```

应用将在 `http://localhost:8080` 启动

## API 测试

### 健康检查
```bash
curl http://localhost:8080/api/health
```

### 发送消息
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "今天好累啊",
    "sessionId": "test-session-001",
    "isGuest": true
  }'
```

## 项目结构

```
backend/
├── src/main/java/com/dollsay/backend/
│   ├── controller/      # REST API 控制器
│   ├── service/         # 业务逻辑层
│   ├── model/           # JPA 实体类
│   ├── repository/      # 数据访问层
│   ├── dto/             # 数据传输对象
│   └── exception/       # 异常处理
├── src/main/resources/
│   └── application.yml  # 配置文件
└── pom.xml              # Maven 配置
```

## 配置说明

### application.yml
- `spring.datasource.*`: PostgreSQL 数据库连接
- `deepseek.*`: DeepSeek API 配置
- `app.guest.max-messages`: 免费用户消息限制(默认20条)

### 环境变量
- `DEEPSEEK_API_KEY`: (必需) DeepSeek API 密钥
- `DB_PASSWORD`: (可选) 数据库密码,默认为 `postgres`

## 故障排查

### 1. 数据库连接失败
检查PostgreSQL是否启动:
```bash
docker ps  # Docker方式
pg_isready # 本地安装
```

### 2. AI API调用失败
- 检查 `DEEPSEEK_API_KEY` 是否正确设置
- 查看日志中的详细错误信息
- 确认网络可访问 `api.deepseek.com`

### 3. 应用启动失败
```bash
# 查看详细日志
mvn spring-boot:run -X
```

## API 文档

完整API规范请参考项目根目录的 `API-SPECIFICATION.md`

## 开发指南

详细开发说明请参考 `BACKEND-DEV-GUIDE.md`
