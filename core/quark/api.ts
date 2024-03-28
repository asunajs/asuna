import type { Http } from '@asign/types'
import type { Info, SignResult } from './types.js'

export function createApi(http: Http) {
  const driveUrl = 'https://drive-m.quark.cn/1/clouddrive/capacity/growth'

  return {
    getInfo() {
      return http.get<Info>(`${driveUrl}/info?pr=ucpro&fr=pc&uc_param_str=`)
    },
    sign() {
      return http.post<SignResult>(`${driveUrl}/sign?pr=ucpro&fr=pc&uc_param_str=`, {
        sign_cyclic: true,
      })
    },
  }
}

export type ApiType = ReturnType<typeof createApi>
