// Error Boundary
import { logger } from "./logger.js";

export class ErrorBoundary {
  static wrap<T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      logger.error("Error in wrapped function: ", error);
      return fallback;
    }
  }

  static async wrapAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      logger.error("Error in async function: ", error);
      return fallback;
    }
  }

  static setupGlobalErrorHandler(): void {
    window.addEventListener("error", (event) => {
      logger.error("Global error: ", event.error);
      event.preventDefault();
    });

    window.addEventListener("unhandledrejection", (event) => {
      logger.error("Unhandled promise rejection: ", event.reason);
      event.preventDefault();
    });
  }
}
