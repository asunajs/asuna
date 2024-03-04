interface HttpOptions {
  headers?: Record<string, string>;
  timeout?: string;
  retry?: string;
  cookieJar?: any;
}

export function createHttp(httpOptions: HttpOptions) {
  const options = Object.assign({}, httpOptions);

  function get(url: string, config?: Record<string, any>) {}

  async function post(
    url: string,
    data?: Record<string, any>,
    config?: Record<string, any>
  ) {
    let body: any = data;
    if (options.headers?.['content-type']?.startsWith('application/json')) {
      body = JSON.stringify(body);
    } else if (
      options.headers?.['content-type']?.startsWith(
        'application/x-www-form-urlencoded'
      )
    ) {
      body = new URLSearchParams(data);
    } else {
      try {
        body = JSON.stringify(data);
      } catch {}
    }
    const res = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        ...options.headers,
        ...config,
      },
    });
    return await res.json();
  }

  async function put(
    url: string,
    data?: Record<string, any>,
    config?: Record<string, any>
  ) {
    let body: any = data;
    if (options.headers?.['content-type']?.startsWith('application/json')) {
      body = JSON.stringify(body);
    } else if (
      options.headers?.['content-type']?.startsWith(
        'application/x-www-form-urlencoded'
      )
    ) {
      body = new URLSearchParams(data);
    } else {
      try {
        body = JSON.stringify(data);
      } catch {}
    }
    const res = await fetch(url, {
      method: 'PUT',
      body,
      headers: {
        ...options.headers,
        ...config,
      },
    });
    return await res.json();
  }

  return {
    post,
    put,
  };
}
