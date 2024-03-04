export interface Http {
  post<T = any>(
    url: string,
    data?: Record<string, any> | string,
    options?: Record<string, any>
  ): Promise<T>;
  get<T = any>(url: string, options?: Record<string, any>): Promise<T>;
  setOption?(option: Record<string, any>): void;
}

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';
