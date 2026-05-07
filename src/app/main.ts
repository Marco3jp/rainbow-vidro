import '@/app/main.css';
import { GameLoop } from '@/app/GameLoop';
import { attachPointerPreview } from '@/app/pointerPreview';
import { World } from '@/core/world';
import { createConsoleLogger, installErrorReporter, MouseInputSource } from '@/platform';
import { PixiRenderer } from '@/render/PixiRenderer';
import { GameScene } from '@/ui';

const container = document.querySelector<HTMLElement>('#app');
if (container === null) {
  throw new Error('#app が見つかりません');
}

const logger = createConsoleLogger();
installErrorReporter(logger);

const world = new World();
const scene = new GameScene(new PixiRenderer(), {
  onDebugValueChange: (key, value) => {
    if (key === 'characterBallSpeed') {
      world.state.entities.character.stats.ballSpeed = value;
      return;
    }
    world.state.config[key] = value;
  },
});
await scene.mount(container);
const inputTarget = scene.getInputTarget() ?? container;

function mapScreenToField(clientX: number, clientY: number): { x: number; y: number } {
  const rect = inputTarget.getBoundingClientRect();
  const screenX = clientX - rect.left;
  const screenY = clientY - rect.top;

  const field = world.state.field;
  const scale = Math.min(rect.width / field.width, rect.height / field.height);
  const offsetX = (rect.width - field.width * scale) / 2;
  const offsetY = (rect.height - field.height * scale) / 2;

  const fieldX = (screenX - offsetX) / scale;
  const fieldY = (screenY - offsetY) / scale;
  return {
    x: Math.max(0, Math.min(field.width, fieldX)),
    y: Math.max(0, Math.min(field.height, fieldY)),
  };
}

const inputSource = new MouseInputSource(inputTarget, (x, y) => {
  return mapScreenToField(x, y);
});

const disposePointerPreview = attachPointerPreview(inputTarget, mapScreenToField, scene);

const gameLoop = new GameLoop(world, scene, inputSource);
gameLoop.start();

window.addEventListener('beforeunload', () => {
  disposePointerPreview();
  inputSource.dispose();
  gameLoop.stop();
  scene.unmount();
});
