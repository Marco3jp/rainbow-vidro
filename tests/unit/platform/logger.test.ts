// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

import { createConsoleLogger, installErrorReporter, type Logger } from '@/platform';

describe('logger', () => {
  it('各レベルで console メソッドが呼ばれる', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = createConsoleLogger();
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e', new Error('x'));

    expect(debug).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('error / unhandledrejection を捕捉する', () => {
    const logger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const uninstall = installErrorReporter(logger);

    window.dispatchEvent(new ErrorEvent('error', { message: 'boom', error: new Error('boom') }));
    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.resolve(undefined),
        reason: new Error('reject'),
      }),
    );

    expect(logger.error).toHaveBeenCalledTimes(2);

    uninstall();
    window.dispatchEvent(new ErrorEvent('error', { message: 'after uninstall' }));
    expect(logger.error).toHaveBeenCalledTimes(2);
  });
});
