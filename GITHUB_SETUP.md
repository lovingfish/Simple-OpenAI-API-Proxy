# GitHub 仓库创建和同步指南

本指南将帮助您创建 GitHub 仓库并同步代码。

## 目录
- [创建 GitHub 仓库](#创建-github-仓库)
- [初始化本地代码库](#初始化本地代码库)
- [连接到远程仓库](#连接到远程仓库)
- [推送代码到 GitHub](#推送代码到-github)
- [后续维护建议](#后续维护建议)

---

## 创建 GitHub 仓库

### 步骤 1：登录 GitHub

1. 访问 [github.com](https://github.com)
2. 使用您的账号登录
3. 如果没有账号，点击 "Sign up" 注册新账号

### 步骤 2：创建新仓库

#### 方法一：网页端创建（推荐）

1. **点击创建**
   - 登录后，点击右上角的 "+" 号
   - 选择 "New repository"

2. **填写仓库信息**
   ```
   Repository name: openai-api-proxy
   Description: OpenAI API reverse proxy service
   选择：Public（公开，这样他人可以使用和贡献）
   不勾选：Add a README file（我们已经创建了）
   不勾选：Add .gitignore
   不勾选：Choose a license
   ```

3. **创建仓库**
   - 点击 "Create repository"
   - 仓库创建成功后，会显示仓库地址

#### 方法二：使用 GitHub CLI

如果您安装了 GitHub CLI：

```bash
# 登录 GitHub
gh auth login

# 创建仓库
gh repo create openai-api-proxy --public --description "OpenAI API reverse proxy service"
```

### 步骤 3：获取仓库地址

创建成功后，您会看到仓库地址：
```
HTTPS: https://github.com/yourusername/openai-api-proxy.git
SSH: git@github.com:yourusername/openai-api-proxy.git
```

---

## 初始化本地代码库

首先，确保您在正确的目录中：

```bash
# 确认您在项目根目录
pwd
# 应该显示：/x/Projcet/TokenCounters
```

### 1. 初始化 Git 仓库

```bash
git init
```

### 2. 添加文件到暂存区

```bash
# 添加所有文件
git add .

# 或选择性添加
git add README.md DEPLOYMENT.md GITHUB_SETUP.md
```

### 3. 提交文件

```bash
# 提交并添加说明
git commit -m "Initial commit: Add OpenAI API proxy documentation"

# 查看提交状态
git status
```

---

## 连接到远程仓库

### 方法一：使用 HTTPS（推荐，适合初学者）

```bash
# 添加远程仓库
git remote add origin https://github.com/yourusername/openai-api-proxy.git

# 验证远程仓库连接
git remote -v
```

### 方法二：使用 SSH（需要配置 SSH 密钥）

如果您已经配置了 SSH 密钥：

```bash
# 添加远程仓库
git remote add origin git@github.com:yourusername/openai-api-proxy.git
```

#### 配置 SSH 密钥（如未配置）

1. **生成 SSH 密钥**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **添加到 SSH agent**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **添加公钥到 GitHub**
   - 复制公钥：
     ```bash
     # Windows
     clip < ~/.ssh/id_ed25519.pub
     
     # macOS
     pbcopy < ~/.ssh/id_ed25519.pub
     
     # Linux
     cat ~/.ssh/id_ed25519.pub
     ```
   - 在 GitHub Settings → SSH and GPG keys → New SSH key 中添加

---

## 推送代码到 GitHub

### 1. 首次推送

```bash
# 推送到 main 分支
git push -u origin main
```

如果遇到错误，可能是因为默认分支不是 main：

```bash
# 检查分支名
git branch

# 如果是 master，推送到 master
git push -u origin master
```

### 2. 验证推送成功

1. **刷新 GitHub 页面**
   - 访问您的仓库页面
   - 应该能看到所有已上传的文件

2. **检查文件内容**
   - 点击 README.md、DEPLOYMENT.md 等
   - 确认内容正确

### 3. 添加项目徽章（可选）

在 README.md 中添加仓库状态徽章：

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub stars](https://img.shields.io/github/stars/yourusername/openai-api-proxy?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/openai-api-proxy?style=social)
```

---

## 后续维护建议

### 1. 创建 .gitignore 文件

为了避免敏感信息被提交，创建 `.gitignore` 文件：

```bash
# 创建 .gitignore 文件
cat > .gitignore << EOF
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 环境变量
.env
.env.local
.env.*.local

# 日志
logs/
*.log

# 运行时数据
pids/
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 临时文件
tmp/
temp/
EOF

# 添加到 Git
git add .gitignore
git commit -m "Add .gitignore file"
git push
```

### 2. 设置 LICENSE 文件

创建 MIT 许可证：

```bash
# 使用 GitHub CLI 创建 LICENSE
gh api repos/yourusername/openai-api-proxy/license -f template=mit
```

### 3. 创建 README 示例代码

更新 README.md 中的链接：

```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/openai-api-proxy&envs=OPENAI_API_KEY)
```

### 4. 定期更新建议

```bash
# 拉取他人贡献（如果有）
git pull origin main

# 创建新分支开发
git checkout -b feature/new-feature

# 开发完成后合并到主分支
git checkout main
git merge feature/new-feature
git push origin main
```

### 5. 管理 Contributors

如果您想接受他人的代码贡献：

1. **开启 Pull Request**
   - 在仓库 Settings → Options → Allow merge commits
   - 设置分支保护规则

2. **贡献指南**
   - 创建 CONTRIBUTING.md 文件
   - 说明如何提交 PR

---

## 常见问题

### Q1: 推送时出现 "failed to push" 错误

**解决方法：**
```bash
# 强制推送（谨慎使用）
git push -f origin main

# 或检查配置
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Q2: 提示 "Permission denied"

**原因：** 权限不足
**解决：**
1. 检查是否登录了正确的 GitHub 账号
2. 如果使用 HTTPS，可能需要输入密码或 Personal Access Token
3. 如果使用 SSH，检查密钥是否正确配置

### Q3: 仓库名称可以修改吗？

**可以：**
1. 进入仓库 Settings
2. 在 Repository Name 处修改
3. 本地需要更新远程地址：
   ```bash
   git remote set-url origin https://github.com/yourusername/new-name.git
   ```

### Q4: 如何删除仓库？

**警告：** 删除后不可恢复！
1. Settings → Danger Zone → Delete this repository
2. 输入仓库名称确认删除

---

恭喜！您已经成功创建了 GitHub 仓库并上传了代码。现在您可以：
- 分享仓库链接给他人
- 使用 Railway/Render 等平台一键部署
- 接受他人的 Pull Request
- 跟踪项目的 Stars 和 Forks