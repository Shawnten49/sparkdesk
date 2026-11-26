# Sparkdesk

一个本地运行的个人灵感与项目孵化管理工具。用于集中记录零散想法、补充资料、进行头脑风暴，并把每个想法拆解成可跟踪的目标与里程碑。

项目使用 **Python + FastAPI + SQLite** 构建，前端采用 **HTML + Tailwind CSS CDN + 原生 JavaScript ES Modules**，无需 Node.js 或前端构建流程。

## 功能

- 管理灵感的标题、简介、标签和状态
- 支持“头脑风暴”“进行中”“已搁置”“已废弃”四种状态
- 按状态、关键词和归档状态筛选灵感
- 归档已废弃的灵感并保留全部记录
- 为灵感添加文本、网页链接和思路修改记录
- 原生 Markdown 渲染与 HTML 安全过滤
- 为灵感添加阶段目标和预计完成日期
- 勾选里程碑并自动计算项目完成进度
- 头脑风暴卡片显示创建时间
- 提供自动生成的 OpenAPI 文档
- 启动脚本自动创建虚拟环境、检查依赖并管理后台进程

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Python 3.9+、FastAPI、Pydantic |
| 数据库 | SQLite、原生 `sqlite3` |
| 服务 | Uvicorn |
| 前端 | HTML5、Tailwind CSS CDN、原生 JavaScript ES Modules |
| Markdown | Marked、DOMPurify |
| 测试 | Pytest、FastAPI TestClient |

## 快速启动

### 环境要求

- Python 3.9 或更高版本
- macOS 或 Linux
- `curl`
- Bash

### 使用启动脚本

```bash
./start.sh
```

启动脚本会自动：

1. 创建 `.venv` 虚拟环境。
2. 安装 `requirements.txt` 中的依赖。
3. 检查代码语法。
4. 在后台启动服务。
5. 等待健康检查通过并打开浏览器。

默认访问地址：

```text
应用：http://127.0.0.1:8668
API 文档：http://127.0.0.1:8668/docs
```

关闭服务：

```bash
./stop.sh
```

运行日志位于：

```text
data/sparkdesk.log
```

### 自定义端口

```bash
APP_PORT=8669 ./start.sh
```

### 不自动打开浏览器

```bash
NO_BROWSER=1 ./start.sh
```

### 手动启动

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 配置

配置通过环境变量传入。

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `APP_HOST` | `127.0.0.1` | 服务监听地址 |
| `APP_PORT` | `8668` | 服务监听端口 |
| `NO_BROWSER` | 未设置 | 设置为 `1` 时不自动打开浏览器 |
| `OPEN_BROWSER` | `true` | 是否自动打开浏览器 |
| `IDEAS_DB_PATH` | `data/ideas.db` | SQLite 数据库路径 |
| `UPLOADS_DIR` | `data/uploads` | 上传文件目录，为后续图片功能预留 |
| `MAX_UPLOAD_MB` | `10` | 未来上传功能的文件大小上限 |
| `PIP_INDEX_URL` | 阿里云 PyPI 镜像 | 启动脚本安装依赖时使用的镜像 |

示例：

```bash
APP_HOST=0.0.0.0 APP_PORT=8668 NO_BROWSER=1 ./start.sh
```

## 项目结构

```text
sparkdesk/
├── main.py                       # 兼容启动入口
├── start.sh                      # 后台启动脚本
├── stop.sh                       # 关闭脚本
├── app/
│   ├── main.py                   # FastAPI 应用工厂
│   ├── config.py                 # 应用配置
│   ├── db/
│   │   ├── connection.py         # SQLite 连接
│   │   ├── migrations.py         # 数据库迁移
│   │   └── migrations/
│   │       └── 001_initial.sql
│   ├── ideas/
│   │   ├── router.py
│   │   ├── repository.py
│   │   └── schemas.py
│   ├── notes/
│   ├── milestones/
│   ├── shared/
│   └── web/
├── web/
│   ├── index.html
│   └── static/
│       ├── css/app.css
│       └── js/
│           ├── app.js
│           ├── actions.js
│           ├── core/
│           ├── features/
│           └── controllers/
├── data/
│   ├── ideas.db                  # 运行时生成，不提交到 Git
│   └── uploads/images/           # 上传资源预留目录
├── tests/
├── requirements.txt
├── requirements-dev.txt
└── pytest.ini
```

后端按照功能纵向拆分。`router` 负责 HTTP 接口，`repository` 负责数据库操作和业务规则，`schemas` 定义请求与响应结构。

## 数据模型

项目包含三张核心表：

| 表 | 说明 |
| --- | --- |
| `ideas` | 灵感标题、简介、标签、状态、归档状态和时间 |
| `notes` | 关联灵感的文本、链接和思路修改记录 |
| `milestones` | 关联灵感的阶段目标、预计日期和完成状态 |

数据库文件会在首次启动时自动创建。删除灵感时，其笔记和里程碑会通过外键级联删除。

数据库结构通过 `PRAGMA user_version` 管理迁移，迁移脚本具有幂等性。

## API

启动后可访问 `http://127.0.0.1:8668/docs` 查看交互式 API 文档。

### 灵感

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/ideas` | 获取灵感列表 |
| `POST` | `/api/ideas` | 创建灵感 |
| `GET` | `/api/ideas/{idea_id}` | 获取灵感详情 |
| `PUT` | `/api/ideas/{idea_id}` | 更新灵感 |
| `DELETE` | `/api/ideas/{idea_id}` | 永久删除灵感 |
| `POST` | `/api/ideas/{idea_id}/archive` | 归档灵感 |
| `POST` | `/api/ideas/{idea_id}/restore` | 恢复归档 |

灵感列表支持以下查询参数：

```text
GET /api/ideas?status=进行中&include_archived=true&q=视频
```

### 笔记

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/ideas/{idea_id}/notes` | 按时间倒序获取笔记 |
| `POST` | `/api/ideas/{idea_id}/notes` | 添加笔记 |
| `GET` | `/api/notes/{note_id}` | 获取单条笔记 |
| `PUT` | `/api/notes/{note_id}` | 更新笔记 |
| `DELETE` | `/api/notes/{note_id}` | 删除笔记 |

笔记类型支持：

```text
text      普通文本或 Markdown 笔记
link      网页链接
revision  思路修改记录
```

### 里程碑

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/api/ideas/{idea_id}/milestones` | 获取里程碑列表 |
| `POST` | `/api/ideas/{idea_id}/milestones` | 添加里程碑 |
| `GET` | `/api/milestones/{milestone_id}` | 获取单个里程碑 |
| `PUT` | `/api/milestones/{milestone_id}` | 更新或切换完成状态 |
| `DELETE` | `/api/milestones/{milestone_id}` | 删除里程碑 |

### 健康检查

```text
GET /api/health
```

返回：

```json
{"status": "ok"}
```

## 测试

安装开发依赖：

```bash
source .venv/bin/activate
pip install -r requirements-dev.txt
```

运行测试：

```bash
pytest -q
```

测试覆盖灵感 CRUD、状态筛选、归档与恢复、笔记 CRUD、里程碑进度、级联删除、数据库迁移和静态资源路由。

## 数据安全

- `data/ideas.db`、备份、日志、上传文件、PID 文件和虚拟环境均已加入 `.gitignore`。
- 不要将个人数据库或上传材料提交到远程仓库。
- 建议定期备份 `data/ideas.db`。
- 应用默认只监听 `127.0.0.1`，不会直接暴露到局域网或其他设备。

## 后续扩展

`data/uploads/images/` 和上传相关配置已预留。后续实现图片功能时，建议：

- 新增独立的 `attachments` 表保存文件元数据。
- 使用随机文件名存储图片，不直接暴露磁盘路径。
- 校验 MIME 类型、文件大小和图片来源。
- 删除素材时同步清理数据库记录与本地文件。

