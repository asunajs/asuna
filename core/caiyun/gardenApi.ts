import type { InitTree, TaskList } from './GardenType'
import type { Http } from '@asign/types'
import type {
  CartoonResult,
  GivenTask,
  SignIn,
  SignInfo,
  TaskResult,
} from './GardenType'

export type CartoonType = 'color' | 'cloud' | 'widget' | 'mail'

export interface ClientTypeHeaders {
  'user-agent'?: string
  'x-requested-with'?: string
}

/**
 * @description http 可能需要 headers 'X-Requested-With': 'com.chinamobile.mcloud'
 */
export function createGardenApi(http: Http) {
  const gardenUrl = 'https://happy.mail.10086.cn/jsp/cn/garden'

  return {
    login(token: string, account: string | number) {
      return http.get(
        `${gardenUrl}/login/caiyunsso.do?token=${token}&account=${account}&targetSourceId=001208&sourceid=1014&enableShare=1`,
        {
          followRedirect: false,
          native: true,
        },
      )
    },
    checkinInfo() {
      return http.get<SignInfo>(`${gardenUrl}/task/checkinInfo.do`)
    },
    initTree() {
      return http.get<InitTree>(`${gardenUrl}/user/initTree.do`)
    },
    /**
     * 需要对应 ua
     */
    getTaskList(headers: ClientTypeHeaders = {}) {
      return http.get<TaskList>(`${gardenUrl}/task/taskList.do?clientType=PE`, {
        headers,
      })
    },
    getTaskStateList(headers: ClientTypeHeaders = {}) {
      return http.get<TaskList>(`${gardenUrl}/task/taskState.do`, {
        headers,
      })
    },
    checkin() {
      return http.get<SignIn>(`${gardenUrl}/task/checkin.do`)
    },
    clickCartoon(cartoonType: CartoonType) {
      return http.get<CartoonResult>(
        `${gardenUrl}/user/clickCartoon.do?cartoonType=${cartoonType}`,
      )
    },
    doTask(taskId: number, headers: ClientTypeHeaders = {}) {
      return http.get<TaskResult>(
        `${gardenUrl}/task/doTask.do?taskId=${taskId}`,
        {
          headers,
        },
      )
    },
    givenWater(taskId: number, headers: ClientTypeHeaders = {}) {
      return http.get<GivenTask>(
        `${gardenUrl}/task/givenWater.do?taskId=${taskId}`,
        {
          headers,
        },
      )
    },
  }
}

export type GardenApiType = ReturnType<typeof createGardenApi>
