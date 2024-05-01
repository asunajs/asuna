import type { Http } from '@asign/types'
import type { AccessToken, AppConf, EncryptConf, ListGrow, PrizeMarket, UserBrief, UserSign } from './types'

type LoginRedirect = {
  lt: string
  reqId: string
  appId: string
}

type LoginSubmit = {
  result: number
  msg: string
  toUrl: string
}

export function createApi(http: Http) {
  const logboxUrl = 'https://open.e.189.cn/api/logbox' as const
  const oauth2Url = logboxUrl + '/oauth2'

  return {
    loginSubmit({ username, password, returnUrl, paramId, pre = '{NRP}' }) {
      return http.post<LoginSubmit>(oauth2Url + '/loginSubmit.do', {
        version: 'v2.0',
        appKey: 'cloud',
        apToken: '',
        accountType: '01',
        userName: `${pre}${username}`,
        epd: `${pre}${password}`,
        validateCode: '',
        captchaToken: '',
        captchaType: '',
        dynamicCheck: 'FALSE',
        clientType: 1,
        returnUrl,
        mailSuffix: '@189.cn',
        paramId,
        cb_SaveName: 3,
      })
    },
    async loginRedirect(): Promise<LoginRedirect> {
      // 之所以要分开获取，是为兼容 wps
      const loginUrlResp = await http.get('https://cloud.189.cn/api/portal/loginUrl.action', {
        native: true,
        followRedirect: false,
      })

      const loginUrl = loginUrlResp.headers.location

      if (!loginUrl) {
        throw new Error('获取登录链接loginUrl失败')
      }

      const htmlUrlResp = await http.get(loginUrl, {
        native: true,
        followRedirect: false,
      })

      const htmlUrl = htmlUrlResp.headers.location

      if (!htmlUrl) {
        throw new Error('获取登录链接htmlUrl失败')
      }

      const search = htmlUrl.split('.html?')[1]

      return search.split('&').reduce((acc: Record<string, string>, cur: string) => {
        const [key, value] = cur.split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
    },
    appConf() {
      return http.post<AppConf>(oauth2Url + '/appConf.do', { appKey: 'cloud' })
    },
    encryptConf() {
      return http.post<EncryptConf>(logboxUrl + '/config/encryptConf.do', 'appId=cloud')
    },
    loginCallback(toUrl: string) {
      return http.get(toUrl)
    },
    drawPrizeMarket(taskId: 'TASK_SIGNIN' | 'TASK_SIGNIN_PHOTOS' | 'TASK_2022_FLDFS_KJ') {
      return http.get<PrizeMarket>(
        `https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=${taskId}&activityId=ACT_SIGNIN&noCache=${Math.random()}`,
      )
    },
    userSign(version = '10.1.4', model = 'iPhone14') {
      return http.get<UserSign>(
        `https://api.cloud.189.cn/mkt/userSign.action?rand=${
          new Date().getTime()
        }&clientType=TELEANDROID&version=${version}&model=${model}`,
        {
          headers: {
            HOST: 'm.cloud.189.cn',
          },
        },
      )
    },
    getUserBriefInfo() {
      return http.get<UserBrief>(
        'https://cloud.189.cn/api/portal/v2/getUserBriefInfo.action',
      )
    },
    getAccessTokenBySsKey(sessionKey: string, headers: Record<string, string>) {
      return http.get<AccessToken>(
        `https://cloud.189.cn/api/open/oauth2/getAccessTokenBySsKey.action?sessionKey=${sessionKey}`,
        {
          headers,
        },
      )
    },
    getFamilyList(headers: Record<string, string>) {
      return http.get<string>('https://api.cloud.189.cn/open/family/manage/getFamilyList.action', {
        headers,
      })
    },
    familySign(familyId: string, headers: Record<string, string>) {
      return http.get<string>(
        `https://api.cloud.189.cn/open/family/manage/exeFamilyUserSign.action?familyId=${familyId}`,
        {
          headers,
        },
      )
    },
    getListGrow() {
      return http.get<ListGrow>(
        `https://cloud.189.cn/api/portal/listGrow.action?noCache=${Math.random()}`,
      )
    },
    http,
  }
}

export type ApiType = ReturnType<typeof createApi>
