# Render.com 部署配置

## AI 已完成的准备工作
- ✅ 创建 `render.yaml` 配置文件
- ✅ 推送配置到 GitHub
- ✅ 编写详细部署指南

## 你现在需要做的

### 🚀 开始部署(10分钟)

1. **访问 Render.com**
   - 打开: https://render.com/
   - 点击 "Get Started" 或 "Sign Up"

2. **GitHub 登录**
   - 选择 "Sign in with GitHub"
   - 授权 Render 访问你的账号

3. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 选择 `DollySay` 仓库
   - 点击 "Connect"

4. **配置服务**
   ```
   Name: dollsay-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend  ⚠️ 重要!
   Runtime: Java (自动检测)
   Build Command: mvn clean package -DskipTests
   Start Command: java -Xmx512m -jar target/backend-1.0.0.jar
   Instance Type: Free  ⚠️ 重要!
   ```

5. **添加环境变量**
   点击 "Add Environment Variable":
   ```
   DEEPSEEK_API_KEY = sk-你的API密钥  ⚠️ 必填
   SHOW_SQL = false
   DB_DRIVER = org.postgresql.Driver
   DB_DIALECT = org.hibernate.dialect.PostgreSQLDialect
   ```

6. **创建服务**
   - 点击 "Create Web Service"
   - 等待首次部署(会失败,因为没数据库)

7. **添加 PostgreSQL**
   - 返回 Dashboard
   - 点击 "New +" → "PostgreSQL"
   - Name: dollsay-db
   - Plan: Free
   - 点击 "Create Database"

8. **连接数据库**
   - 进入 PostgreSQL 页面
   - 复制 "Internal Database URL"
   - 回到 Web Service
   - 添加环境变量:
     ```
     DATABASE_URL = 粘贴刚才复制的URL
     ```
   - 保存后自动重新部署

9. **验证部署**
   - 等待 3-5 分钟
   - 访问: https://你的域名.onrender.com/api/health
   - 应该看到: `{"status":"UP",...}`

---

## 📞 遇到问题?

告诉我在哪一步卡住了,我会帮你解决!

## 📚 详细文档

查看完整指南: [render-deployment-guide.md](file:///C:/Users/Administrator/.gemini/antigravity/brain/10c70612-c200-4926-a0fc-913870a32ea8/render-deployment-guide.md)
