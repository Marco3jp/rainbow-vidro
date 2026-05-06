export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  ts: number;
  level: LogLevel;
  msg: string;
  ctx?: Record<string, unknown>;
  error?: { name: string; message: string; stack?: string };
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, error?: unknown, ctx?: Record<string, unknown>): void;
}

function normalizeError(error: unknown): LogEntry['error'] | undefined {
  if (error instanceof Error) {
    const base = { name: error.name, message: error.message };
    if (error.stack !== undefined) {
      return { ...base, stack: error.stack };
    }
    return base;
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error };
  }
  return undefined;
}

function createEntry(
  level: LogLevel,
  msg: string,
  ctx?: Record<string, unknown>,
  error?: unknown,
): LogEntry {
  const entry: LogEntry = {
    ts: Date.now(),
    level,
    msg,
  };
  if (ctx !== undefined) {
    entry.ctx = ctx;
  }
  const normalized = normalizeError(error);
  if (normalized !== undefined) {
    entry.error = normalized;
  }
  return entry;
}

export function createConsoleLogger(): Logger {
  return {
    debug(msg, ctx) {
      console.debug(createEntry('debug', msg, ctx));
    },
    info(msg, ctx) {
      console.info(createEntry('info', msg, ctx));
    },
    warn(msg, ctx) {
      console.warn(createEntry('warn', msg, ctx));
    },
    error(msg, error, ctx) {
      console.error(createEntry('error', msg, ctx, error));
    },
  };
}

export function installErrorReporter(logger: Logger): () => void {
  const onError = (event: ErrorEvent): void => {
    logger.error(event.message || 'window error', event.error ?? event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
    logger.error('unhandledrejection', event.reason);
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}
