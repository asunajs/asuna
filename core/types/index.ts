interface Option {
  native?: boolean
  [x: string]: any
}

export interface Http {
  post<T = any>(
    url: string,
    data?: Record<string, any> | string,
    options?: Option,
  ): Promise<T>
  get<T = any>(url: string, options?: Option): Promise<T>
  request?<T = any>(options?: Option): Promise<T>
  setOptions?(option: Option): void
  setHeader?(key: string, value: string): void
  setCookie?(key: string, value: string, currentUrl: string): void
}

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE'

export interface LoggerType {
  info(...args: any[]): void
  error(...args: any[]): void
  warn(...args: any[]): void
  debug(...args: any[]): void
  start(...args: any[]): void
  success(...args: any[]): void
  fail(...args: any[]): void
  fatal(...args: any[]): void
}
