#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/data/sparkdesk.pid"
PORT_FILE="$ROOT_DIR/data/sparkdesk.port"

if [[ ! -f "$PID_FILE" ]]; then
  echo "Sparkdesk 未运行（未找到 PID 文件）。"
  rm -f "$PORT_FILE"
  exit 0
fi

server_pid="$(tr -d '[:space:]' < "$PID_FILE")"
if [[ ! "$server_pid" =~ ^[0-9]+$ ]]; then
  echo "PID 文件内容无效，已清理：$PID_FILE"
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 1
fi

if ! kill -0 "$server_pid" 2>/dev/null; then
  echo "Sparkdesk 进程已不存在，已清理过期 PID 文件。"
  rm -f "$PID_FILE" "$PORT_FILE"
  exit 0
fi

process_command="$(ps -p "$server_pid" -o command= 2>/dev/null || true)"
if [[ "$process_command" != *"SPARKDESK_MANAGED=1"* ]] \
  && [[ "$process_command" != *"$ROOT_DIR/main.py"* ]]; then
  echo "拒绝关闭 PID ${server_pid}：进程不属于当前 Sparkdesk。" >&2
  echo "进程命令：$process_command" >&2
  exit 1
fi

echo "正在关闭 Sparkdesk（PID: ${server_pid}）..."
kill -TERM "$server_pid"

stopped=0
for _ in $(seq 1 50); do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    stopped=1
    break
  fi
  sleep 0.2
done

if [[ "$stopped" -ne 1 ]]; then
  echo "应用未在 10 秒内退出，正在发送强制终止信号..."
  kill -KILL "$server_pid" 2>/dev/null || true
fi

rm -f "$PID_FILE" "$PORT_FILE"
echo "Sparkdesk 已关闭。"
