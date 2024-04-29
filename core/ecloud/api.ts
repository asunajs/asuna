import type { Http } from '@asign/types'

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
  const apiUrl = 'https://open.e.189.cn/api/logbox' as const
  const oauth2Url = apiUrl + '/oauth2'

  return {
    loginSubmit({ usernameEncrypt, passwordEncrypt, returnUrl, paramId, pre = '{NRP}' }) {
      return http.post<LoginSubmit>(oauth2Url + '/loginSubmit.do', {
        version: 'v2.0',
        appKey: 'cloud',
        apToken: '',
        accountType: '01',
        userName: `${pre}${usernameEncrypt}`,
        epd: `${pre}${passwordEncrypt}`,
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
      return http.post(oauth2Url + '/appConf.do', { appKey: 'cloud' })
    },
    encryptConf() {
      // fuck typescript， 不写在这居然是 any
      return http.post<
        {
          result: number
          data: {
            upSmsOn: string
            pre: string // {NRP}
            preDomain: string // card.e.189.cn
            pubKey: string
          }
        }
      >(apiUrl + '/config/encryptConf.do', 'appId=cloud')
    },
    loginCallback(toUrl: string) {
      return http.get(toUrl)
    },
    drawPrizeMarket(taskId: 'TASK_SIGNIN' | 'TASK_SIGNIN_PHOTOS' | 'TASK_2022_FLDFS_KJ') {
      return http.get<
        {
          prizeId: 'SIGNIN_CLOUD_50M'
          prizeName: '天翼云盘50M空间'
          prizeGrade: number
          prizeType: number
          description: string
          useDate: string
          userId: number
          isUsed: number
          activityId: 'ACT_SIGNIN'
          prizeStatus: number
          showPriority: number
          errorCode?: 'User_Not_Chance'
          errorMsg?: string
        }
      >(
        `https://m.cloud.189.cn/v2/drawPrizeMarketDetails.action?taskId=${taskId}&activityId=ACT_SIGNIN&noCache=${Math.random()}`,
      )
    },
    userSign(version = '10.1.4', model = 'iPhone14') {
      return http.get<{
        userSignId: string
        userId: number
        signTime: string
        /** 1 -50 */
        netdiskBonus: number
        isSign: boolean
      }>(
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
    http,
  }
}

export type ApiType = ReturnType<typeof createApi>
