// import "server-only";
import winston from "winston";
import { ZodIssue } from "zod";

// Available server error types
type ErrorMessage =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "UNKNOWN_ERROR";

interface ErrorDetails {
  loggerMessage?: string;
  clientMessage?: string;
  zodErrors?: ZodIssue[];
}

const errorMessages: Record<ErrorMessage, string> = {
  NOT_FOUND: "Not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  INVALID_REQUEST: "Invalid request",
  UNKNOWN_ERROR: "Something went wrong",
};

type ServerReturns<T> =
  | {
      status: "success";
      data?: T;
    }
  | {
      status: "error";
      error: { message: string };
    };

// Initialize winston logger
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

// Custom error class that can be used to throw errors
// in route handlers and server actions.
export class ServerError extends Error {
  constructor(message: ErrorMessage, details?: ErrorDetails) {
    super(message);
    this.message = message;
    this.details = details;
  }

  public message: ErrorMessage;
  public details?: ErrorDetails;
}

// Server actions error handler
export function handleServerError(
  e: unknown | Error | ServerError,
): ServerReturns<undefined> {
  const error = e as Error | ServerError;
  const details = error instanceof ServerError ? error.details : undefined;

  // Log error to winston
  logger.error(error.message, {
    ddsource: "vercel",
    stack: process.env.NODE_ENV === "production" ? error.stack : undefined,
    src: "winston",
    details: {
      error: error.message,
      loggerMessage: details?.loggerMessage,
      zodErrors: details?.zodErrors,
    },
  });

  if (error instanceof ServerError) {
    return {
      status: "error",
      error: {
        message:
          error.details?.clientMessage ||
          errorMessages[error.message] ||
          errorMessages["UNKNOWN_ERROR"],
      },
    };
  }

  return {
    status: "error",
    error: {
      message: errorMessages["UNKNOWN_ERROR"],
    },
  };
}
