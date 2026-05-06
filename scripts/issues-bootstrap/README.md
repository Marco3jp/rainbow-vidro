# issues-bootstrap

`issues-draft/` 配下の Issue 原稿を、GitHub の本物の Issue として一括作成するためのスクリプト群です。

## 前提

- [GitHub CLI (`gh`)](https://cli.github.com/) がインストール済みかつ認証済み (`gh auth status`)
- 対象リポジトリへの Issue 作成・ラベル管理権限
- `bash` (4 系以降推奨) と一般的な POSIX ユーティリティ (`awk`, `sed`, `grep`)

## 使い方

リポジトリのルートで実行する想定です。

```bash
cd /path/to/rainbow-vidro

# 1. dry-run で内容確認 (実際には作成しない)
bash scripts/issues-bootstrap/run.sh --dry-run

# 2. 本番実行
bash scripts/issues-bootstrap/run.sh
```

明示的に対象リポジトリを指定する場合:

```bash
bash scripts/issues-bootstrap/run.sh --repo Marco3jp/rainbow-vidro
```

## 実行ステップ

| 順 | スクリプト | 内容 |
| --- | --- | --- |
| 1 | `01_create_labels.sh` | `data/labels.tsv` を読み、ラベルを作成 (既存は色・説明を更新) |
| 2 | `02_create_individual_issues.sh` | `issues-draft/*.md` から個別 Issue を作成し、`.state/issues.tsv` に `<id>\t<number>` を記録 |
| 3 | `03_create_tracking_issues.sh` | `data/groups.tsv` を読み、各グループのトラッキング Issue を作成。本文には `.state/issues.tsv` から取得した実 Issue 番号でチェックリストを生成 |

## べき等性

- `.state/issues.tsv` / `.state/trackings.tsv` に記録された Issue は再実行時にスキップされます
- 全 Issue を作り直したい場合: `bash scripts/issues-bootstrap/run.sh --reset-state`
- `.state/` は `.gitignore` 対象 (個人実行ログのためコミット不要)

> **NOTE**: `.state/` は実行マシンに紐づく状態ファイルです。別マシンで実行すると重複作成のリスクがあります。Issue 作成は1台のマシンから1回だけ行い、その `.state/` を必要なら手元で残しておいてください。

## オプション

| フラグ | 効果 |
| --- | --- |
| `--dry-run` | 実際には作成せず、コマンドだけ表示 |
| `--repo OWNER/REPO` | 対象リポジトリを明示 (省略時は `gh` の自動検出) |
| `--skip-labels` | ステップ1 (ラベル) をスキップ |
| `--skip-issues` | ステップ2 (個別 Issue) をスキップ |
| `--skip-trackings` | ステップ3 (トラッキング Issue) をスキップ |
| `--reset-state` | `.state/` を削除して全作業をやり直す |
| `-h`, `--help` | ヘルプを表示 |

## データファイル

| ファイル | 役割 |
| --- | --- |
| `data/labels.tsv` | 作成・更新するラベル一覧 (`name\tcolor\tdescription`) |
| `data/issues.tsv` | 個別 Issue 一覧 (`id\tfile\tphase\tgroup\tpriority\tarea\ttype`) |
| `data/groups.tsv` | グループ → トラッキング Issue 用メタデータ (`id\ttitle\tpriority\tmembers`) |

ヘッダ行 (1 行目) はスキップされます。空フィールドは `-` で表現してください (例: Phase 2-5 の overview 用 issue は group/priority/area が `-`)。

## マークダウンの加工

`issues-draft/*.md` を Issue 本文に流し込む際、以下の変換を行います:

- 1 行目の H1 (`# [Phase1][F-01] ...`) を Issue タイトルとして抽出 (本文からは除外)
- `](../docs/...)` → `](docs/...)`
- `](../AGENTS.md)` → `](AGENTS.md)`
- `](../README.md)` → `](README.md)`
- `](../LICENSE)` → `](LICENSE)`

これは Issue 本文がリポジトリルート基準で相対リンクを解決するためです。

## トラブルシューティング

| 症状 | 対処 |
| --- | --- |
| `gh: command not found` | [GitHub CLI](https://cli.github.com/) をインストール |
| 認証エラー | `gh auth login` または `gh auth refresh -s repo` |
| ラベルの色不一致で更新失敗 | `gh label edit <name> --color <hex>` で手動調整するか、`data/labels.tsv` の色を合わせる |
| Issue 作成に失敗する | `gh auth refresh -s repo` で権限を再付与 / API レート制限を確認 |
| 重複した Issue が作られた | 重複分を手動で Close → `.state/issues.tsv` を編集して正しい番号に |

## 完了後の作業

すべての Issue 作成が成功したら、`issues-draft/` 配下のファイルを削除してコミット・push してください。

```bash
git rm -r issues-draft
git commit -m "chore: Issue化が完了したため仮原稿フォルダを削除する"
git push
```
