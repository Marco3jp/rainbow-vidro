#!/usr/bin/env bash
# Step 1: ラベルを作成または更新する。
# 入力: data/labels.tsv (name\tcolor\tdescription)

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

LABELS_FILE="$DATA_DIR/labels.tsv"

if [[ ! -f "$LABELS_FILE" ]]; then
  err "ラベル定義ファイルが見つかりません: $LABELS_FILE"
  exit 1
fi

log "ラベルを作成・更新します ($LABELS_FILE)"

# ヘッダ行をスキップして1行ずつ処理
tail -n +2 "$LABELS_FILE" | while IFS=$'\t' read -r name color description; do
  # 空行スキップ
  [[ -z "${name:-}" ]] && continue

  log "ラベル: $name (color=#$color)"

  # --force で既存ラベルの色・説明を上書き更新
  args=(label create "$name" --color "$color" --description "$description" --force)
  if [[ -n "$REPO_FLAG" ]]; then
    # shellcheck disable=SC2206
    repo_args=($REPO_FLAG)
    args+=("${repo_args[@]}")
  fi

  if ! gh_run "${args[@]}"; then
    warn "  作成・更新に失敗しました: $name"
  fi
done

log "ラベル処理完了"
