#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$ROOT_DIR/.venv"
PYTHON_BIN="${PYTHON_BIN:-python3}"
PORT="${APP_PORT:-${PORT:-8668}}"
HOST="${APP_HOST:-${HOST:-127.0.0.1}}"
if [[ "$HOST" == "0.0.0.0" || "$HOST" == "::" ]]; then
  BROWSER_HOST="127.0.0.1"
else
  BROWSER_HOST="$HOST"
fi
DATA_DIR="$ROOT_DIR/data"
PID_FILE="$DATA_DIR/sparkdesk.pid"
PORT_FILE="$DATA_DIR/sparkdesk.port"
LOG_FILE="$DATA_DIR/sparkdesk.log"
PIP_INDEX="${PIP_INDEX_URL:-https://mirrors.aliyun.com/pypi/simple/}"

mkdir -p "$DATA_DIR"
cd "$ROOT_DIR"

if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(tr -d '[:space:]' < "$PID_FILE")"
  if [[ "$existing_pid" =~ ^[0-9]+$ ]] && kill -0 "$existing_pid" 2>/dev/null; then
    existing_command="$(ps -p "$existing_pid" -o command= 2>/dev/null || true)"
    if [[ "$existing_command" == *"$ROOT_DIR/main.py"* ]] \
      || [[ "$existing_command" == *"SPARKDESK_MANAGED=1"* ]]; then
      if [[ -f "$PORT_FILE" ]]; then
        PORT="$(tr -d '[:space:]' < "$PORT_FILE")"
      fi
      echo "Sparkdesk 已在运行，PID: $existing_pid"
      echo "访问地址: http://$BROWSER_HOST:$PORT"
      exit 0
    fi
  fi
  rm -f "$PID_FILE" "$PORT_FILE"
fi

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  echo "正在创建虚拟环境..."
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

if ! "$VENV_DIR/bin/python" -c "import fastapi, uvicorn" >/dev/null 2>&1; then
  echo "正在安装运行依赖..."
  "$VENV_DIR/bin/python" -m pip install \
    --disable-pip-version-check \
    -i "$PIP_INDEX" \
    -r "$ROOT_DIR/requirements.txt"
fi

if ! "$VENV_DIR/bin/python" -m compileall -q "$ROOT_DIR/app" "$ROOT_DIR/main.py"; then
  echo "代码语法检查失败，未启动服务。" >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1 \
  && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "端口 $PORT 已被其他程序占用。" >&2
  echo "可换个端口启动，例如：APP_PORT=8669 ./start.sh" >&2
  exit 1
fi

echo "正在启动 Sparkdesk..."
APP_HOST="$HOST" APP_PORT="$PORT" \
  nohup env SPARKDESK_MANAGED=1 \
  "$VENV_DIR/bin/python" "$ROOT_DIR/main.py" \
  >>"$LOG_FILE" 2>&1 &
server_pid=$!
echo "$server_pid" >"$PID_FILE"
echo "$PORT" >"$PORT_FILE"

healthy=0
for _ in $(seq 1 40); do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    break
  fi
  if curl --silent --fail --max-time 1 \
    "http://$BROWSER_HOST:$PORT/api/health" >/dev/null 2>&1; then
    healthy=1
    break
  fi
  sleep 0.2
done

if [[ "$healthy" -ne 1 ]]; then
  echo "Sparkdesk 启动失败，最近日志：" >&2
  tail -n 20 "$LOG_FILE" >&2 || true
  kill "$server_pid" 2>/dev/null || true
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 1
fi

echo "Sparkdesk 已启动"
echo "访问地址: http://$BROWSER_HOST:$PORT"
echo "API 文档: http://$BROWSER_HOST:$PORT/docs"
echo "进程 PID: $server_pid"
echo "日志文件: $LOG_FILE"
echo "关闭服务: ./stop.sh"
