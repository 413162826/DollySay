# 环境变量配置说明

## 本地开发
使用 `.env.local` 文件配置本地开发环境:

```env
VITE_API_URL=http://localhost:8080
```

## 生产环境
部署到 Railway 后,修改 `.env.local`:

```env
VITE_API_URL=https://your-app-name.railway.app
```

将 `your-app-name` 替换为你的 Railway 后端域名。

## 前端部署 (可选)

如果需要将前端也部署到 Railway:

1. 在 Railway 创建新项目
2. 选择 `DollSay` 仓库
3. 设置 Root Directory 为 `frontend`
4. 添加环境变量:
   - `VITE_API_URL`: 后端 Railway 域名

Railway 会自动检测 Vite 项目并部署。
