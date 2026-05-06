#!/usr/bin/env bash
# Step 3: グループごとのトラッキング Issue を作成する。
# 入力: data/groups.tsv (id\ttitle\tpriority\tmembers)
# 入力: .state/issues.tsv (Step 2 で作成済み)
# 出力: .state/trackings.tsv (group_id\tnumber)

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

GROUPS_FILE="$DATA_DIR/groups.tsv"
ISSUES_STATE_FILE="$STATE_DIR/issues.tsv"
TRACKING_STATE_FILE="$STATE_DIR/trackings.tsv"

if [[ ! -f "$GROUPS_FILE" ]]; then
  err "グループ定義ファイルが見つかりません: $GROUPS_FILE"
  exit 1
fi

if [[ "$DRY_RUN" != "1" && ! -f "$ISSUES_STATE_FILE" ]]; then
  err "個別 Issue の状態ファイルが見つかりません: $ISSUES_STATE_FILE (先に 02 を実行してください)"
  exit 1
fi

touch "$TRACKING_STATE_FILE"

log "トラッキング Issue を作成します"

tail -n +2 "$GROUPS_FILE" | while IFS=$'\t' read -r group_id title priority members; do
  [[ -z "${group_id:-}" ]] && continue

  if state_has "$TRACKING_STATE_FILE" "$group_id"; then
    existing="$(lookup_issue_number "$group_id")"
    log "スキップ: $group_id (作成済み #$existing)"
    continue
  fi

  # チェックリストを構築
  checklist=""
  IFS=',' read -ra ids <<< "$members"
  for member_id in "${ids[@]}"; do
    member_id="${member_id// /}"
    [[ -z "$member_id" ]] && continue
    num="$(lookup_issue_number "$member_id")"
    if [[ -z "$num" ]]; then
      if [[ "$DRY_RUN" == "1" ]]; then
        checklist+="- [ ] #(未作成: ${member_id})"$'\n'
      else
        warn "  $group_id: $member_id の Issue 番号が見つかりません (チェックリストから除外)"
      fi
    else
      checklist+="- [ ] #${num} (${member_id})"$'\n'
    fi
  done

  # Issue 本文を一時ファイルに書き出し
  body_tmp="$(mktemp)"
  trap 'rm -f "$body_tmp"' EXIT

  cat > "$body_tmp" <<EOF
## 概要

Phase 1 の作業グループ **${group_id}: ${title}**。

詳細は [\`docs/roadmap.md\`](docs/roadmap.md) の「Phase 1 の作業グループと優先度」セクションを参照してください。

## 含まれる子 Issue

${checklist}
## 完了条件

- 上記すべての子 Issue が Close されている
- 各子 Issue の受け入れ条件をすべて満たしている

## 参照ドキュメント

- [\`docs/roadmap.md\`](docs/roadmap.md)
- [\`docs/architecture.md\`](docs/architecture.md)
- [\`docs/game-design.md\`](docs/game-design.md)
- [\`docs/testing.md\`](docs/testing.md)
- [\`AGENTS.md\`](AGENTS.md)

## 作業方針 (Cursor エージェント向け)

- **1 グループ = 1 PR でも、1 Issue = 1 PR でも可**。コンテキストスイッチを抑えたい場合はグループまとめで1 PR、レビューしやすさ優先なら個別 PR
- いずれの場合も、コミットは Issue 単位で分ける (Conventional Commits、メッセージは日本語)
- 作業前に [\`AGENTS.md\`](AGENTS.md) と関連ドキュメントを必ず読む
- 着手時はこのトラッキング Issue にコメントで宣言すると後追いしやすい
- ブロッカーが発生したらこのトラッキング Issue にコメントで報告して停止
EOF

  labels=("tracking" "phase:1" "group:${group_id}")
  if [[ "${priority:-}" != "-" && -n "${priority:-}" ]]; then
    labels+=("priority:${priority}")
  fi

  log "作成: [${group_id}] $title"
  log "  labels: ${labels[*]}"

  if [[ "$DRY_RUN" == "1" ]]; then
    label_csv="$(IFS=,; printf '%s' "${labels[*]}")"
    printf '\033[35m[DRY]\033[0m gh issue create --title %q --body-file %q --label %q' \
      "[${group_id}] ${title}" "$body_tmp" "$label_csv" >&2
    [[ -n "$REPO_FLAG" ]] && printf ' %s' "$REPO_FLAG" >&2
    printf '\n' >&2
    number="DRY_${group_id}"
  else
    args=(issue create --title "[${group_id}] ${title}" --body-file "$body_tmp")
    for label in "${labels[@]}"; do
      args+=(--label "$label")
    done
    if [[ -n "$REPO_FLAG" ]]; then
      # shellcheck disable=SC2206
      repo_args=($REPO_FLAG)
      args+=("${repo_args[@]}")
    fi

    if ! url="$(gh "${args[@]}")"; then
      warn "  トラッキング Issue 作成に失敗しました: $group_id"
      rm -f "$body_tmp"
      trap - EXIT
      continue
    fi
    number="$(extract_issue_number_from_url "$url")"
  fi

  rm -f "$body_tmp"
  trap - EXIT

  record_state "$TRACKING_STATE_FILE" "$group_id" "$number"
  log "  -> #$number"
done

log "トラッキング Issue 処理完了 (記録: $TRACKING_STATE_FILE)"
