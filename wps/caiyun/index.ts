import {
  createCookieJar,
  createRequest,
  getPushConfig,
  sendWpsNotify,
} from '@asunajs/wps-utils';
import { createLogger, getHostname } from '@asunajs/utils-pure';
import {
  M,
  createApi,
  createGardenApi,
  refreshToken,
  run,
} from '@asunajs/caiyun-core';

export type Config = {
  token: string;
  phone: string;
  auth?: string;
};

export async function main(index, config: Config, option?) {
  const basicToken = config.token.startsWith('Basic')
    ? config.token
    : `Basic ${config.token}`;
  const cookieJar = createCookieJar();
  const logger = createLogger({ pushData: option && option.pushData });
  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36';

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  };

  logger.info(`--------------`);
  logger.info(`你好：${config.phone}`);

  let jwtToken: string;

  const headers = {
    'user-agent': DATA.baseUA,
    'x-requested-with': DATA.mcloudRequested,
    charset: 'utf-8',
    'content-type': 'application/json;charset=UTF-8',
  };

  function getHeaders(url) {
    if (getHostname(url) === 'caiyun.feixin.10086.cn') {
      if (jwtToken)
        return {
          ...headers,
          cookie: cookieJar.getCookieString(),
          jwttoken: jwtToken,
        };
    }
    return {
      ...headers,
      authorization: basicToken,
    };
  }

  const http = createRequest({ cookieJar, getHeaders });

  const $ = {
    api: createApi(http),
    logger: logger as any,
    DATA,
    sleep: Time.sleep,
    config,
    gardenApi: createGardenApi(http),
  };

  jwtToken = await refreshToken($, config.phone);
  if (!jwtToken) return;

  return await run($);
}

const columnA = ActiveSheet.Columns('A');
// 获取当前工作表的使用范围
const usedRange = ActiveSheet.UsedRange;
const len = usedRange.Row + usedRange.Rows.Count - 1,
  BColumn = ActiveSheet.Columns('B'),
  CColumn = ActiveSheet.Columns('C');
const pushData = [];

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i);
  if (cell.Text) {
    console.log(`执行第 ${i} 行`);
    main(
      i,
      {
        token: BColumn.Rows(i).Text,
        phone: cell.Text,
        auth: CColumn.Rows(i).Text,
      },
      {
        pushData,
      }
    );
  }
}

sendWpsNotify(pushData, getPushConfig());
