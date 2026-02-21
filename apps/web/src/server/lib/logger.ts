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

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog("debug")) console.debug(`[DEBUG] ${message}`, data ?? "");
  },
  info: (message: string, data?: unknown) => {
    if (shouldLog("info")) console.info(`[INFO] ${message}`, data ?? "");
  },
  warn: (message: string, data?: unknown) => {
    if (shouldLog("warn")) console.warn(`[WARN] ${message}`, data ?? "");
  },
  error: (message: string, data?: unknown) => {
    if (shouldLog("error")) console.error(`[ERROR] ${message}`, data ?? "");
  },
};
