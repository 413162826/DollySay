# V1 开发启动指南 ✅

> **目标**: 2天内完成所有准备工作，第3天开始编码  
> **预计开发周期**: 8周  
> **最后更新**: 2026-02-12

---

## 📋 准备工作检查清单

### 第一步：账号注册 (预计1小时)

#### 1. OpenAI API (必需)
- [ ] 注册账号: https://platform.openai.com/
- [ ] 绑定支付方式（信用卡）
- [ ] 获取API Key
- [ ] 设置用量限制（建议$20/月）
- [ ] 测试API连通性

**费用**: $10-30/月 (V1阶段)

**备选方案**: Claude API (https://console.anthropic.com/)

---

#### 2. 数据库服务 (必需)
**推荐**: Railway.app

- [ ] 注册账号: https://railway.app/
- [ ] 连接GitHub账号
- [ ] 创建新项目
- [ ] 添加PostgreSQL服务
- [ ] 记录数据库连接信息

**费用**: 前$5免费，之后约$5-10/月

**备选方案**: 
- Supabase (https://supabase.com/) - 免费额度更高
- 本地PostgreSQL - 初期开发使用

---

#### 3. 前端部署 (可选，后期)
**推荐**: Vercel

- [ ] 注册账号: https://vercel.com/
- [ ] 连接GitHub账号

**费用**: 免费（个人项目）

---

### 第二步：工具安装 (预计1小时)

#### 1. 开发环境基础工具

```bash
# 检查是否已安装
node --version   # 需要 v18+
java --version   # 需要 Java 17+
git --version
```

**需要安装的工具**:
- [ ] Node.js 18+ : https://nodejs.org/
- [ ] Java 17+ : https://adoptium.net/
- [ ] Git : https://git-scm.com/
- [ ] Maven (通常随Java一起安装)

---

#### 2. IDE 和编辑器
**推荐组合**:
- [ ] IntelliJ IDEA (Java后端) - Community版免费
- [ ] VS Code (React前端) - 免费

**VS Code插件**:
- [ ] ES7+ React/Redux/React-Native snippets
- [ ] Prettier - Code formatter
- [ ] ESLint

---

#### 3. 数据库客户端
**推荐**:
- [ ] DBeaver (免费) : https://dbeaver.io/
- [ ] 或 TablePlus (付费，更美观)

---

#### 4. API测试工具
- [ ] Postman : https://www.postman.com/
- [ ] 或 Thunder Client (VS Code插件)

---

### 第三步：获取动画素材 (预计2-4小时)

#### 方案A: 使用免费Lottie动画 (推荐V1)

**步骤**:
1. [ ] 访问 LottieFiles: https://lottiefiles.com/
2. [ ] 搜索关键词: "cute moon character" 或 "kawaii character"
3. [ ] 筛选: Free + Commercial Use
4. [ ] 下载5个表情的JSON文件:
   - neutral.json (平静/默认)
   - happy.json (开心)
   - sad.json (难过)
   - thinking.json (思考)
   - surprised.json (惊讶)
5. [ ] 下载1个点击动画: bounce.json

**备用搜索词**:
- "moon mascot"
- "emotional character"
- "cute blob character"

**如果找不到合适的**:
→ 暂时用Emoji表情（🌙😊😢🤔😮），V1.5再升级

---

#### 方案B: 定制Lottie动画 (可选，后期)

**平台**: Fiverr
**预算**: $50-150 / ¥300-1000
**周期**: 3-7天

**Brief模板** (保存好，需要时直接用):
```
项目: Emotional Companion Doll - Character Animation
Character: Cute moon-shaped mascot
Required: 5 Lottie animations (1 second each, loop)
1. Neutral/Calm (default state)
2. Happy/Smile
3. Sad/Comfort
4. Thinking
5. Surprised
Bonus: Bounce animation for click interaction
Style: Simple, warm, healing
Colors: Light yellow (#FFF4E0) + soft pink blush
Format: JSON (Lottie) + AE source files
Resolution: 400x400px
```

---

### 第四步：创建项目仓库 (预计30分钟)

#### 1. 初始化Git仓库

```powershell
# 在项目根目录执行
cd "d:\Program Files\dev-project\sgw\DollSay"
git init

# 创建.gitignore
$gitignore = @"
# 后端
backend/target/
backend/.mvn/
backend/mvnw
backend/mvnw.cmd

# 前端
frontend/node_modules/
frontend/dist/
frontend/.env.local

# IDE
.idea/
.vscode/
*.iml

# 环境变量
.env
*.env

# 日志
*.log

# OS
.DS_Store
Thumbs.db
"@
$gitignore | Out-File -FilePath .gitignore -Encoding UTF8

# 首次提交
git add .
git commit -m "Initial commit: Project planning docs"
```

---

#### 2. 创建GitHub仓库

- [ ] 访问 https://github.com/new
- [ ] 仓库名: `emotional-companion-doll` (或你喜欢的名字)
- [ ] 设置为Private (初期)
- [ ] 不初始化README (本地已有)
- [ ] 创建后，按照提示push代码:

```powershell
git remote add origin https://github.com/你的用户名/emotional-companion-doll.git
git branch -M main
git push -u origin main
```

---

### 第五步：创建项目结构 (预计30分钟)

```powershell
# 在 D:\Program Files\dev-project\sgw\DollSay 目录下执行

# 创建前端项目
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios zustand @react-spring/web lottie-react
cd ..

# 创建后端项目（将Spring Initializr下载的项目解压到这里）
# 手动操作：访问 https://start.spring.io/
# 配置见文档 react-java-quick-start.md
# 下载后解压并重命名为 backend

# 创建素材目录
New-Item -ItemType Directory -Force -Path "frontend\src\animations"
New-Item -ItemType Directory -Force -Path "frontend\src\components"
New-Item -ItemType Directory -Force -Path "frontend\src\services"
New-Item -ItemType Directory -Force -Path "frontend\src\hooks"
```

**最终项目结构**:
```
DollSay/
├── docs/              # 已有的规划文档
├── frontend/          # React前端
│   ├── src/
│   │   ├── animations/    # Lottie JSON文件
│   │   ├── components/    # React组件
│   │   ├── services/      # API调用
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/           # Spring Boot后端
│   ├── src/main/java/com/dollsay/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── repository/
│   │   └── dto/
│   └── pom.xml
└── README.md
```

---

### 第六步：环境配置 (预计30分钟)

#### 1. 配置环境变量

```powershell
# 创建后端配置文件
$applicationYml = @"
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/dollsay
    username: postgres
    password: your_local_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    
server:
  port: 8080

openai:
  api-key: \${OPENAI_API_KEY}
  model: gpt-4o-mini
"@
$applicationYml | Out-File -FilePath "backend\src\main\resources\application.yml" -Encoding UTF8
```

```powershell
# 创建前端环境变量文件
$frontendEnv = @"
VITE_API_URL=http://localhost:8080/api
"@
$frontendEnv | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
```

---

#### 2. 设置Windows环境变量

```powershell
# 设置OpenAI API Key（临时，仅当前会话）
$env:OPENAI_API_KEY = "your-api-key-here"

# 或永久设置（推荐）
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "your-api-key-here", "User")
```

---

#### 3. 启动本地PostgreSQL

**如果没有本地PostgreSQL，使用Docker**:
```powershell
# 安装Docker Desktop: https://www.docker.com/products/docker-desktop/

# 启动PostgreSQL容器
docker run --name dollsay-db `
  -e POSTGRES_PASSWORD=yourpassword `
  -e POSTGRES_DB=dollsay `
  -p 5432:5432 `
  -d postgres:15
```

---

## 🚀 开始开发！

### Day 1-2: 验证环境 + Hello World

#### 1. 测试后端

```powershell
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

**期望输出**: 
```
Started BackendApplication in X.XXX seconds
```

**测试API**:
```powershell
curl http://localhost:8080/actuator/health
# 应该返回: {"status":"UP"}
```

---

#### 2. 测试前端

```powershell
cd frontend
npm run dev
```

**期望输出**:
```
VITE v5.x.x ready in xxx ms
Local: http://localhost:5173/
```

浏览器访问 http://localhost:5173/ 应该看到Vite默认页面

---

#### 3. 测试前后端连接

**后端添加测试Controller**:
```java
// backend/src/main/java/com/dollsay/backend/controller/HealthController.java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello from Backend!";
    }
}
```

**前端测试**:
```javascript
// frontend/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/hello')
      .then(res => setMessage(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h1>{message || 'Loading...'}</h1>;
}

export default App;
```

刷新页面，应该看到 "Hello from Backend!"

---

### Day 3: 开始真正编码

**第一个任务**: 实现基础对话功能

1. ✅ 后端ChatController
2. ✅ 后端AIService (对接OpenAI)
3. ✅ 前端ChatBox组件
4. ✅ 测试完整对话流程

**参考文档**: 
- `docs/fullstack/react-java-quick-start.md` (有完整代码)

---

## 📝 开发周期规划 (8周)

### Week 1-2: 基础架构
- [x] 环境搭建 ← 你在这里
- [ ] 实现对话API
- [ ] 基础前端UI
- [ ] OpenAI集成

### Week 3-4: 玩偶与交互
- [ ] 集成Lottie动画
- [ ] 表情切换逻辑
- [ ] 点击交互
- [ ] 呼吸动画

### Week 5-6: 登录与记忆
- [ ] 用户注册/登录
- [ ] JWT认证
- [ ] 对话存储
- [ ] 记忆召回

### Week 7: 付费功能
- [ ] 免费/付费区分
- [ ] 支付集成(支付宝/微信)
- [ ] 订阅管理

### Week 8: 优化与上线
- [ ] 性能优化
- [ ] 部署Railway
- [ ] SEO优化
- [ ] 用户测试

---

## ⚠️ 常见问题

### Q1: OpenAI API太慢怎么办？
**A**: 
1. 检查网络（可能需要代理）
2. 切换到Claude API
3. 使用国内中转API (需自行寻找可靠服务商)

### Q2: 前端访问后端报CORS错误？
**A**: 确保后端Controller加了 `@CrossOrigin(origins = "*")`

### Q3: Maven下载依赖很慢？
**A**: 配置阿里云镜像
```xml
<!-- ~/.m2/settings.xml -->
<mirror>
  <id>aliyun</id>
  <mirrorOf>central</mirrorOf>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

### Q4: 没找到合适的Lottie动画？
**A**: V1先用Emoji (🌙😊😢🤔😮)，不影响功能验证

---

## 📞 需要帮助？

开发过程中遇到问题，随时问我！我会：
1. 提供具体代码示例
2. 调试错误信息
3. 推荐最佳实践
4. 帮你绕过坑

---

## ✅ 最终检查清单

开始编码前，确保：
- [ ] OpenAI API Key已获取并测试
- [ ] PostgreSQL可以连接
- [ ] 后端能启动并访问 http://localhost:8080
- [ ] 前端能启动并访问 http://localhost:5173
- [ ] 前后端能成功通信
- [ ] Git仓库已创建并推送到GitHub
- [ ] 动画素材已准备（或决定用Emoji）

**全部打✅ 后，你就可以开始V1的核心功能开发了！** 🎉

---

> **Bezos说**: "Day 1心态，快速行动！不要等一切完美才开始，70%准备好就可以启动。"

> **DHH说**: "Shipping is a feature. 先上线一个能用的版本，比完美的PPT重要得多。"

**现在开始行动吧！** 💪
