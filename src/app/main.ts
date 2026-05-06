import { GameLoop } from '@/app/GameLoop';
import { World } from '@/core/world';
import { createConsoleLogger, installErrorReporter, MouseInputSource } from '@/platform';
import { PixiRenderer } from '@/render/PixiRenderer';

const container = document.querySelector<HTMLElement>('#app');
if (container === null) {
  throw new Error('#app が見つかりません');
}

const logger = createConsoleLogger();
installErrorReporter(logger);

const renderer = new PixiRenderer();
await renderer.mount(container);
renderer.drawDebugRect();

const world = new World();
const inputSource = new MouseInputSource(renderer.getCanvas() ?? container);
const gameLoop = new GameLoop(world, renderer, inputSource);
gameLoop.start();

window.addEventListener('beforeunload', () => {
  inputSource.dispose();
  gameLoop.stop();
  renderer.unmount();
});
