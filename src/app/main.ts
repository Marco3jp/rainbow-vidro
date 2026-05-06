import '@/app/main.css';
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

const world = new World();
const canvas = renderer.getCanvas() ?? container;

function mapScreenToField(clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
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

const inputSource = new MouseInputSource(canvas, (x, y) => {
  return mapScreenToField(x, y);
});

const onMouseMove = (event: MouseEvent): void => {
  const mapped = mapScreenToField(event.clientX, event.clientY);
  renderer.setVisualBarTargetX(mapped.x);
  renderer.setVisualPointer(mapped);
};
const onMouseLeave = (): void => {
  renderer.setVisualBarTargetX(null);
  renderer.setVisualPointer(null);
};
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseleave', onMouseLeave);

const gameLoop = new GameLoop(world, renderer, inputSource);
gameLoop.start();

window.addEventListener('beforeunload', () => {
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mouseleave', onMouseLeave);
  inputSource.dispose();
  gameLoop.stop();
  renderer.unmount();
});
