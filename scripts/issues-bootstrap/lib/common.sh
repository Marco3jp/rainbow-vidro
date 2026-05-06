#!/usr/bin/env bash
# 共通関数および定数。各ステップスクリプトの先頭で source する。

set -euo pipefail

# このファイルの場所からプロジェクトの各種パスを解決する。
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$(cd "$LIB_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
STATE_DIR="$SCRIPT_DIR/.state"
DRAFT_DIR="$REPO_ROOT/issues-draft"

mkdir -p "$STATE_DIR"

# 環境変数 (run.sh 経由で export される想定)
DRY_RUN="${DRY_RUN:-0}"
REPO_FLAG="${REPO_FLAG:-}"

# ロギング
log()  { printf '\033[36m[issues-bootstrap]\033[0m %s\n' "$*" >&2; }
warn() { printf '\033[33m[issues-bootstrap]\033[0m %s\n' "$*" >&2; }
err()  { printf '\033[31m[issues-bootstrap]\033[0m %s\n' "$*" >&2; }

# DRY_RUN を考慮した gh 実行ラッパー
gh_run() {
  if [[ "$DRY_RUN" == "1" ]]; then
    printf '\033[35m[DRY]\033[0m gh' >&2
    for arg in "$@"; do
      printf ' %q' "$arg" >&2
    done
    printf '\n' >&2
    return 0
  fi
  gh "$@"
}

# Markdown ファイルから H1 をタイトルとして抽出する。
# 入力: ファイルパス
# 出力: タイトル文字列 (1 行)
extract_title() {
  local file="$1"
  awk '/^# / { sub(/^# /, ""); print; exit }' "$file"
}

# Markdown ファイルから H1 を除いた本文を抽出し、相対パスを Issue 本文に合うよう書き換える。
# 入力: ファイルパス
# 出力: 本文 (複数行)
extract_body() {
  local file="$1"
  awk '
    BEGIN { found_h1 = 0 }
    /^# / && !found_h1 { found_h1 = 1; next }
    found_h1 { print }
  ' "$file" | sed \
    -e 's|](\.\./docs/|](docs/|g' \
    -e 's|](\.\./AGENTS\.md|](AGENTS.md|g' \
    -e 's|](\.\./README\.md|](README.md|g' \
    -e 's|](\.\./LICENSE|](LICENSE|g'
}

# .state/issues.tsv から ID に対応する Issue 番号を取得する。
# 入力: ID 文字列
# 出力: Issue 番号 (見つからなければ空文字)
lookup_issue_number() {
  local id="$1"
  local file="$STATE_DIR/issues.tsv"
  if [[ ! -f "$file" ]]; then
    echo ""
    return 0
  fi
  awk -F'\t' -v id="$id" '$1 == id { print $2; exit }' "$file"
}

# State ファイル (TSV) に id -> number のレコードを追記する。
# 入力: ファイルパス, id, number
record_state() {
  local file="$1"
  local id="$2"
  local number="$3"
  printf '%s\t%s\n' "$id" "$number" >> "$file"
}

# State ファイルに id が記録済みかを判定する。
# 入力: ファイルパス, id
# 戻り値: 0 = 記録済み、1 = 未記録
state_has() {
  local file="$1"
  local id="$2"
  if [[ ! -f "$file" ]]; then
    return 1
  fi
  awk -F'\t' -v id="$id" '$1 == id { found = 1 } END { exit found ? 0 : 1 }' "$file"
}

# gh issue create の出力 (URL) から Issue 番号を抽出する。
extract_issue_number_from_url() {
  local url="$1"
  printf '%s' "$url" | sed -E 's|.*/issues/([0-9]+)$|\1|'
}
