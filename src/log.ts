import { env } from "./env";

const logMetadata = {
    service: "monitoring",
    environment: env.environmentType,
    project: env.projectName
};

export function log(msg: {
    error?: Error | string;
    msg: string;
    severity: string;
    [x: string]: any;
  }) {
    console.error(
      JSON.stringify({
        message: msg.msg,
        ...(msg.error ? { error: msg.error + "" } : {}),
        ...(msg.error instanceof Error ? { stack: msg.error.stack + "" } : {}),
        severity: msg.severity,
        timestamp: Date.now(),
        isotime: new Date().toISOString(),
        ...logMetadata
      })
    );
  }
  