#!/usr/bin/env bash
# issues-bootstrap オーケストレータ。各ステップを順次実行する。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<USAGE
Usage: $0 [OPTIONS]

Issue 一括作成スクリプト群。詳細は ${SCRIPT_DIR}/README.md を参照。

Options:
  --dry-run                実際には作成せず、コマンドを表示する
  --repo OWNER/REPO        対象リポジトリを明示 (省略時は gh が自動検出)
  --skip-labels            Step 1 (ラベル) をスキップ
  --skip-issues            Step 2 (個別 Issue) をスキップ
  --skip-trackings         Step 3 (トラッキング Issue) をスキップ
  --reset-state            .state/ を削除してから実行する
  -h, --help               このヘルプを表示

Steps:
  1. ラベルを作成または更新する  (data/labels.tsv)
  2. issues-draft/*.md から個別 Issue を作成する  (.state/issues.tsv に記録)
  3. data/groups.tsv からトラッキング Issue を作成する  (.state/trackings.tsv に記録)

再実行時は .state/ に記録済みの項目をスキップするため、原則べき等です。

Prerequisites:
  - gh CLI がインストール済みかつ認証済み (gh auth status)
  - 対象リポジトリへの Issue 作成・ラベル管理権限
USAGE
}

DRY_RUN=0
REPO_FLAG=""
SKIP_LABELS=0
SKIP_ISSUES=0
SKIP_TRACKINGS=0
RESET_STATE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)         DRY_RUN=1; shift ;;
    --repo)
      if [[ $# -lt 2 ]]; then
        echo "Error: --repo には OWNER/REPO 形式の引数が必要です" >&2
        exit 1
      fi
      REPO_FLAG="--repo $2"
      shift 2
      ;;
    --skip-labels)     SKIP_LABELS=1; shift ;;
    --skip-issues)     SKIP_ISSUES=1; shift ;;
    --skip-trackings)  SKIP_TRACKINGS=1; shift ;;
    --reset-state)     RESET_STATE=1; shift ;;
    -h|--help)         usage; exit 0 ;;
    *)
      echo "Error: 不明なオプション: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

export DRY_RUN REPO_FLAG

# .state リセット
if [[ "$RESET_STATE" == "1" ]]; then
  if [[ -d "$SCRIPT_DIR/.state" ]]; then
    rm -rf "$SCRIPT_DIR/.state"
    echo "[reset] .state/ を削除しました" >&2
  fi
fi

# 前提チェック
if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI が見つかりません。https://cli.github.com/ からインストールしてください。" >&2
  exit 1
fi

if [[ "$DRY_RUN" != "1" ]]; then
  if ! gh auth status >/dev/null 2>&1; then
    echo "Error: gh が認証されていません。'gh auth login' を実行してください。" >&2
    exit 1
  fi
fi

# 各ステップ実行
if [[ "$SKIP_LABELS" != "1" ]]; then
  bash "$SCRIPT_DIR/01_create_labels.sh"
fi

if [[ "$SKIP_ISSUES" != "1" ]]; then
  bash "$SCRIPT_DIR/02_create_individual_issues.sh"
fi

if [[ "$SKIP_TRACKINGS" != "1" ]]; then
  bash "$SCRIPT_DIR/03_create_tracking_issues.sh"
fi

echo
echo "完了しました。状態ファイル: $SCRIPT_DIR/.state/" >&2
