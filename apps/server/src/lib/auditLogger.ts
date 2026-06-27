import pino from "pino";
import { env } from "./env";

export const auditLogger = pino({
  level: "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    target: "pino-roll",
    options: {
      file: env.AUDIT_LOG_FILE_PATH,
      frequency: "daily",
      size: "10m",
      limit: { count: 5 },
      mkdir: true,
      dateFormat: "yyyy-MM-dd",
    },
  },
});
