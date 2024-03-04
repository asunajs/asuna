export function randomHex(length: number) {
  return Array.from({
    length,
  })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

export function getXmlElement(xml: string, tag: string) {
  const m = xml.match(`<${tag}>(.*)<\/${tag}>`);
  return m ? m[1] : '';
}

export interface LoggerPushData {
  type: string;
  msg: string;
  date: Date;
}

export function createLogger(options?: { pushData: LoggerPushData[] }) {
  const wrap = (type: string, ...args: any[]) => {
    if (options && options.pushData) {
      const msg = args
        .reduce<string>((str, cur) => `${str} ${cur}`, '')
        .substring(1);
      options.pushData.push({ msg, type, date: new Date() });
    }
    console[type](...args);
  };
  return {
    info: (...args: any[]) => wrap('info', ...args),
    error: (...args: any[]) => wrap('error', ...args),
    debug: (...args: any[]) => wrap('info', ...args),
  };
}

export function getHostname(url: string) {
  return url.split('/')[2].split('?')[0];
}

export async function asyncForEach<I = any>(
  array: I[],
  task: (arg: I) => Promise<any>,
  cb?: () => Promise<any>
) {
  const len = array.length;
  for (let index = 0; index < len; index++) {
    const item = array[index];
    await task(item);
    if (index < len - 1) {
      cb && (await cb());
    }
  }
}
