type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = (process.env.APP_LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(level: string, message: string, data?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const base = `${ts} [${level.toUpperCase()}] ${message}`;
  return data && Object.keys(data).length > 0 ? `${base} ${JSON.stringify(data)}` : base;
}

export const logger = {
  debug(message: string, data?: Record<string, unknown>) {
    if (shouldLog("debug")) console.debug(formatEntry("debug", message, data));
  },
  info(message: string, data?: Record<string, unknown>) {
    if (shouldLog("info")) console.info(formatEntry("info", message, data));
  },
  warn(message: string, data?: Record<string, unknown>) {
    if (shouldLog("warn")) console.warn(formatEntry("warn", message, data));
  },
  error(message: string, data?: Record<string, unknown>) {
    if (shouldLog("error")) console.error(formatEntry("error", message, data));
  },
};
