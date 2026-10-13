#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [port] (default: 4000)"
}

if [[ ${1:-} == "--help" || ${1:-} == "-h" ]]; then
  usage
  exit 0
fi

port=${1:-4000}
if (( $# > 1 )) || [[ ! $port =~ ^[0-9]{1,5}$ ]]; then
  usage >&2
  exit 1
fi
port=$((10#$port))
if (( port < 1 || port > 65535 )); then
  echo "Port must be between 1 and 65535." >&2
  exit 1
fi

repo_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd -- "$repo_root"

for command in node pnpm; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing $command. Install Node.js 24+ and pnpm 11.7.0 in Linux, then retry." >&2
    exit 1
  fi
done

pnpm install --frozen-lockfile
pnpm --filter @llm-bench/benchmark-data build

echo "Starting LLM Bench at http://localhost:$port"
echo "Open this URL in your browser once ready. Press Ctrl+C to stop."
exec pnpm web --hostname 127.0.0.1 --port "$port"
