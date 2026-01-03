// Error Boundary
import { logger } from "./logger.js";
export class ErrorBoundary {
    static wrap(fn, fallback) {
        try {
            return fn();
        }
        catch (error) {
            logger.error("Error in wrapped function: ", error);
            return fallback;
        }
    }
    static async wrapAsync(fn, fallback) {
        try {
            return await fn();
        }
        catch (error) {
            logger.error("Error in async function: ", error);
            return fallback;
        }
    }
    static setupGlobalErrorHandler() {
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
