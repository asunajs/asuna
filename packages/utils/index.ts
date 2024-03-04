import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export function sleep(time: number) {
  return new Promise<number>((res) => setTimeout(() => res(time), time));
}

export interface LoggerPushData {
  level: number;
  type: string;
  msg: string;
  date: Date;
}

export async function createLogger(options?: { pushData: LoggerPushData[] }) {
  const { createConsola, consola } = await import('consola');
  consola.options.level = 5;
  return createConsola({
    level: 5,
    reporters: [
      {
        log: ({ type, args, level, date }) => {
          if (options && options.pushData) {
            const msg = args
              .reduce<string>((str, cur) => `${str} ${cur}`, '')
              .substring(1);
            options.pushData.push({ msg, type, level, date });
          }
          consola[type].apply(consola, args);
        },
      },
    ],
  });
}

export function sha256(input: string) {
  const hash = crypto.createHash('sha256').update(input);
  return hash.digest('hex');
}

/**
 * 读取 JSON 文件
 */
export function readJsonFile(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`文件 ${path} 不存在`);
  }
  return new Function(`return ${fs.readFileSync(path, 'utf-8')}`)();
}

/**
 * @description 传入 demo.json 自动增加 demo.json5
 */
export function getConfig(name: string) {
  const resolveCwd = (str: string) => path.resolve(process.cwd(), str);
  const resolveDir = (str: string) => path.resolve(__dirname, str);
  const configPath = Array.from(
    new Set<string>([
      resolveCwd(name + '5'),
      resolveDir(name + '5'),
      resolveCwd(name),
      resolveDir(name),
    ])
  ).find((path) => fs.existsSync(path));
  return configPath ? readJsonFile(configPath) : undefined;
}

export type LoggerType = Awaited<ReturnType<typeof createLogger>>;
