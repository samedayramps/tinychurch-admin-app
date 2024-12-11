export const log = {
  debug: (message: string, data?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'debug', message, ...data }))
    }
  },
  info: (message: string, data?: Record<string, any>) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', message, ...data }))
  },
  warn: (message: string, data?: Record<string, any>) => {
    console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'warn', message, ...data }))
  },
  error: (message: string, data?: Record<string, any>) => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message, ...data }))
  }
}

export type Logger = {
  debug: (message: string, data?: Record<string, any>) => void
  info: (message: string, data?: Record<string, any>) => void
  warn: (message: string, data?: Record<string, any>) => void
  error: (message: string, data?: Record<string, any>) => void
} 