# [Phase1][U-04] マッチヒストリー画面 (localStorage 一覧)

## 背景

フェアモードでも対戦ヒストリーを保存する要件 ([`docs/game-design.md`](../docs/game-design.md) §5)。1stバージョンでは localStorage に保存し、一覧画面で確認できるようにする。

## ゴール

- 試合終了時に MatchStats が localStorage に保存される。
- タイトル画面から「マッチヒストリー」画面に遷移でき、過去の試合が一覧で見られる。
- 各エントリの詳細 (ダメージ、ブロック数、シード、リプレイ有無) が確認できる。

## 作業内容

1. `src/platform/matchHistoryStore.ts` を作成する。
   ```ts
   interface MatchHistoryEntry extends MatchStats {
     id: string;
     playedAt: string; // ISO
     character: string;
     replayFileId?: string;
   }
   export interface MatchHistoryStore {
     list(): MatchHistoryEntry[];
     add(entry: MatchHistoryEntry): void;
     get(id: string): MatchHistoryEntry | undefined;
     remove(id: string): void;
     clear(): void;
   }
   ```
2. localStorage 実装を提供。容量上限を考慮 (例: 最新 50 件保持) [要調整]。
3. 試合終了時に `add()` を呼ぶ (U-03 と連動)。
4. `src/ui/scenes/HistoryScene.ts` を作成し、一覧と詳細を表示する。
5. リプレイファイル (F-13) は別途 localStorage に保存し、エントリから参照する設計とする。
6. テスト:
   - 保存と取り出しが正しい
   - 上限を超えると古いものが削除される
   - 試合終了で履歴が残る

## 受け入れ条件

- [ ] 実機で履歴一覧が表示される。
- [ ] テストが緑。

## スコープ外

- リプレイ再生 UI (U-05)
- フィルタ・ソート (将来)

## 依存

- U-03, F-13

## 参照

- [`docs/game-design.md`](../docs/game-design.md) §5
