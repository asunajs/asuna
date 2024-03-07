interface Option {
  native?: boolean;
  [x: string]: any;
}

export interface Http {
  post<T = any>(
    url: string,
    data?: Record<string, any> | string,
    options?: Option
  ): Promise<T>;
  get<T = any>(url: string, options?: Option): Promise<T>;
  setOption?(option: Option): void;
}

export type Method = 'POST' | 'GET' | 'PUT' | 'DELETE';
