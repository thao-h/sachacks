function formatEntry(level: string, message: string, data?: Record<string, unknown>) {
  const ts = new Date().toISOString();
  const base = `${ts} [${level.toUpperCase()}] ${message}`;
  return data && Object.keys(data).length > 0 ? `${base} ${JSON.stringify(data)}` : base;
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => console.log(formatEntry("info", message, data)),
  warn: (message: string, data?: Record<string, unknown>) => console.warn(formatEntry("warn", message, data)),
  error: (message: string, data?: Record<string, unknown>) => console.error(formatEntry("error", message, data)),
  debug: (message: string, data?: Record<string, unknown>) => console.debug(formatEntry("debug", message, data)),
};
