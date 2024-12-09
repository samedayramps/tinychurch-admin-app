export const log = {
  info: (message: string, data?: Record<string, any>) => {
    console.log(`INFO: ${message}`, data || '');
  },
  warn: (message: string, data?: Record<string, any>) => {
    console.warn(`WARN: ${message}`, data || '');
  },
  error: (message: string, data?: Record<string, any>) => {
    console.error(`ERROR: ${message}`, data || '');
  },
}; 