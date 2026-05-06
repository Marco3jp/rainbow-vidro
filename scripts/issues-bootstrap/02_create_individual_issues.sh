#!/usr/bin/env bash
# Step 2: 個別 Issue を作成する。
# 入力: data/issues.tsv (id\tfile\tphase\tgroup\tpriority\tarea\ttype)
# 出力: .state/issues.tsv (id\tnumber)

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib/common.sh"

ISSUES_FILE="$DATA_DIR/issues.tsv"
STATE_FILE="$STATE_DIR/issues.tsv"

if [[ ! -f "$ISSUES_FILE" ]]; then
  err "Issue 定義ファイルが見つかりません: $ISSUES_FILE"
  exit 1
fi

if [[ ! -d "$DRAFT_DIR" ]]; then
  err "Issue 原稿ディレクトリが見つかりません: $DRAFT_DIR"
  exit 1
fi

touch "$STATE_FILE"

log "個別 Issue を作成します"

# ヘッダ行をスキップ
tail -n +2 "$ISSUES_FILE" | while IFS=$'\t' read -r id file phase group priority area type; do
  [[ -z "${id:-}" ]] && continue

  if state_has "$STATE_FILE" "$id"; then
    existing="$(lookup_issue_number "$id")"
    log "スキップ: $id (作成済み #$existing)"
    continue
  fi

  draft_file="$DRAFT_DIR/$file"
  if [[ ! -f "$draft_file" ]]; then
    warn "原稿ファイルが見つかりません: $draft_file (id=$id)"
    continue
  fi

  title="$(extract_title "$draft_file")"
  if [[ -z "$title" ]]; then
    warn "タイトルが抽出できません: $draft_file (id=$id)"
    continue
  fi

  # ラベル組み立て (`-` または空はスキップ)
  labels=()
  [[ "${phase:-}"    != "-" && -n "${phase:-}"    ]] && labels+=("phase:${phase}")
  [[ "${group:-}"    != "-" && -n "${group:-}"    ]] && labels+=("group:${group}")
  [[ "${priority:-}" != "-" && -n "${priority:-}" ]] && labels+=("priority:${priority}")
  [[ "${area:-}"     != "-" && -n "${area:-}"     ]] && labels+=("area:${area}")
  [[ "${type:-}"     != "-" && -n "${type:-}"     ]] && labels+=("type:${type}")

  # Issue 本文を一時ファイルに書き出し
  body_tmp="$(mktemp)"
  trap 'rm -f "$body_tmp"' EXIT
  extract_body "$draft_file" > "$body_tmp"

  log "作成: [$id] $title"
  log "  labels: ${labels[*]}"

  if [[ "$DRY_RUN" == "1" ]]; then
    label_csv="$(IFS=,; printf '%s' "${labels[*]}")"
    printf '\033[35m[DRY]\033[0m gh issue create --title %q --body-file %q --label %q' \
      "$title" "$body_tmp" "$label_csv" >&2
    [[ -n "$REPO_FLAG" ]] && printf ' %s' "$REPO_FLAG" >&2
    printf '\n' >&2
    number="DRY_${id}"
  else
    args=(issue create --title "$title" --body-file "$body_tmp")
    for label in "${labels[@]}"; do
      args+=(--label "$label")
    done
    if [[ -n "$REPO_FLAG" ]]; then
      # shellcheck disable=SC2206
      repo_args=($REPO_FLAG)
      args+=("${repo_args[@]}")
    fi

    if ! url="$(gh "${args[@]}")"; then
      warn "  Issue 作成に失敗しました: $id"
      rm -f "$body_tmp"
      trap - EXIT
      continue
    fi
    number="$(extract_issue_number_from_url "$url")"
  fi

  rm -f "$body_tmp"
  trap - EXIT

  record_state "$STATE_FILE" "$id" "$number"
  log "  -> #$number"
done

log "個別 Issue 処理完了 (記録: $STATE_FILE)"
