# Issue 原稿一覧

## Phase 1 (1stバージョン) — 詳細

### Foundation (基盤)

| ID | ファイル | 依存 |
| --- | --- | --- |
| F-01 | [phase1-foundation-F-01-project-setup.md](phase1-foundation-F-01-project-setup.md) | - |
| F-02 | [phase1-foundation-F-02-vitest-setup.md](phase1-foundation-F-02-vitest-setup.md) | F-01 |
| F-03 | [phase1-foundation-F-03-playwright-setup.md](phase1-foundation-F-03-playwright-setup.md) | F-01, F-02 |
| F-04 | [phase1-foundation-F-04-ci.md](phase1-foundation-F-04-ci.md) | F-01, F-02 |
| F-05 | [phase1-foundation-F-05-pages-deploy.md](phase1-foundation-F-05-pages-deploy.md) | F-01, F-04 |
| F-06 | [phase1-foundation-F-06-pr-preview.md](phase1-foundation-F-06-pr-preview.md) | F-01, F-04, F-05 |
| F-07 | [phase1-foundation-F-07-renderer-abstraction.md](phase1-foundation-F-07-renderer-abstraction.md) | F-01, F-02 |
| F-08 | [phase1-foundation-F-08-game-loop.md](phase1-foundation-F-08-game-loop.md) | F-07 |
| F-09 | [phase1-foundation-F-09-seeded-rng.md](phase1-foundation-F-09-seeded-rng.md) | F-01, F-02 |
| F-10 | [phase1-foundation-F-10-clock.md](phase1-foundation-F-10-clock.md) | F-01, F-02 |
| F-11 | [phase1-foundation-F-11-logger.md](phase1-foundation-F-11-logger.md) | F-01, F-02 |
| F-12 | [phase1-foundation-F-12-input-source.md](phase1-foundation-F-12-input-source.md) | F-08 |
| F-13 | [phase1-foundation-F-13-replay-foundation.md](phase1-foundation-F-13-replay-foundation.md) | F-09, F-12 |

### Core Game (コアゲーム)

| ID | ファイル | 依存 |
| --- | --- | --- |
| C-01 | [phase1-core-C-01-world-state.md](phase1-core-C-01-world-state.md) | F-08, F-09, F-10 |
| C-02 | [phase1-core-C-02-ball.md](phase1-core-C-02-ball.md) | C-01 |
| C-03 | [phase1-core-C-03-bar.md](phase1-core-C-03-bar.md) | C-01, F-12 |
| C-04 | [phase1-core-C-04-wall-reflection.md](phase1-core-C-04-wall-reflection.md) | C-02 |
| C-05 | [phase1-core-C-05-bar-reflection.md](phase1-core-C-05-bar-reflection.md) | C-02, C-03, C-04 |
| C-06 | [phase1-core-C-06-block-hp.md](phase1-core-C-06-block-hp.md) | C-02, C-04, C-05, H-01 |
| C-07 | [phase1-core-C-07-block-advance.md](phase1-core-C-07-block-advance.md) | C-06 |
| C-08 | [phase1-core-C-08-player-hp-loss.md](phase1-core-C-08-player-hp-loss.md) | C-07, H-01 |
| C-09 | [phase1-core-C-09-sling-charge.md](phase1-core-C-09-sling-charge.md) | C-02, C-03, F-12 |
| C-10 | [phase1-core-C-10-charge-shot-multiplier.md](phase1-core-C-10-charge-shot-multiplier.md) | C-09 |
| C-11 | [phase1-core-C-11-special-blocks.md](phase1-core-C-11-special-blocks.md) | C-06, H-01, H-08 |
| C-12 | [phase1-core-C-12-boss-block.md](phase1-core-C-12-boss-block.md) | C-06 |
| C-13 | [phase1-core-C-13-boss-core-block.md](phase1-core-C-13-boss-core-block.md) | C-08, C-12 |
| C-14 | [phase1-core-C-14-enemy-skill.md](phase1-core-C-14-enemy-skill.md) | C-11, C-12 |
| C-15 | [phase1-core-C-15-damage-formula.md](phase1-core-C-15-damage-formula.md) | C-04, C-06, C-10 |

### Character (キャラクター)

| ID | ファイル | 依存 |
| --- | --- | --- |
| H-01 | [phase1-character-H-01-character-stats.md](phase1-character-H-01-character-stats.md) | C-01 |
| H-02 | [phase1-character-H-02-mana.md](phase1-character-H-02-mana.md) | H-01 |
| H-03 | [phase1-character-H-03-skill-system.md](phase1-character-H-03-skill-system.md) | H-01, H-02, F-09 |
| H-04 | [phase1-character-H-04-passive.md](phase1-character-H-04-passive.md) | H-03, H-05 |
| H-05 | [phase1-character-H-05-skill-shot.md](phase1-character-H-05-skill-shot.md) | H-03, C-15 |
| H-06 | [phase1-character-H-06-sling-buff.md](phase1-character-H-06-sling-buff.md) | H-03, C-09, C-10, C-06 |
| H-07 | [phase1-character-H-07-ultimate-ball-clone.md](phase1-character-H-07-ultimate-ball-clone.md) | H-03, C-02 |
| H-08 | [phase1-character-H-08-exp-level.md](phase1-character-H-08-exp-level.md) | H-01, C-06 |
| H-09 | [phase1-character-H-09-skill-points-ui.md](phase1-character-H-09-skill-points-ui.md) | H-03, H-08, U-02 |

### UI / Meta

| ID | ファイル | 依存 |
| --- | --- | --- |
| U-01 | [phase1-ui-U-01-title-screen.md](phase1-ui-U-01-title-screen.md) | C-01, F-08 |
| U-02 | [phase1-ui-U-02-hud.md](phase1-ui-U-02-hud.md) | C-01, H-01, H-03, H-08, H-09 |
| U-03 | [phase1-ui-U-03-result-screen.md](phase1-ui-U-03-result-screen.md) | C-08, C-13, F-13 |
| U-04 | [phase1-ui-U-04-match-history.md](phase1-ui-U-04-match-history.md) | U-03, F-13 |
| U-05 | [phase1-ui-U-05-replay-playback.md](phase1-ui-U-05-replay-playback.md) | F-13, U-01, U-04 |
| U-06 | [phase1-ui-U-06-fonts-styles.md](phase1-ui-U-06-fonts-styles.md) | U-01, U-02 |

### Quality (品質)

| ID | ファイル | 依存 |
| --- | --- | --- |
| Q-01 | [phase1-quality-Q-01-autoplay-strategy.md](phase1-quality-Q-01-autoplay-strategy.md) | F-12, C-01 |
| Q-02 | [phase1-quality-Q-02-headless-fuzz.md](phase1-quality-Q-02-headless-fuzz.md) | Q-01 |
| Q-03 | [phase1-quality-Q-03-error-monitor-ui.md](phase1-quality-Q-03-error-monitor-ui.md) | F-11 |

## Phase 2 以降 — 概要のみ

| Phase | ファイル |
| --- | --- |
| Phase 2 | [phase2-overview.md](phase2-overview.md) |
| Phase 3 | [phase3-overview.md](phase3-overview.md) |
| Phase 4 | [phase4-overview.md](phase4-overview.md) |
| Phase 5 | [phase5-overview.md](phase5-overview.md) |

## 注意 (このディレクトリの扱い)

- 内容を確認・修正の上で、GitHub Issue として手動 (もしくは別エージェント) で作成してください。
- Issue 化が完了した原稿はこのディレクトリから削除し、コミットしてください。
- すべて削除されたら `issues-draft/` ディレクトリ自体を削除してください。
