import type { Http } from '@asign/types'
import { mw2TogetherUrl } from '../constant/index.js'

export interface MailChatTask {
  /**
   * 'S_OK'
   */
  code: string
  summary: string
  taskId: string
  queueSize: number
}

export interface MailChatMsg {
  /**
   * 'S_OK'
   */
  code: string
  summary: string
  queueSize: number
  mailLink: string
  caiyunLink: string
  var: { result: string }
}

export function createMailChatApi(http: Http) {
  function _together<T = any>(name: string, sid: string, data: string): Promise<T> {
    return http.post(
      `${mw2TogetherUrl}?func=together:${name}&sid=${sid}&behaviorData=&rnd=${Math.random()}&cguid=2348352175888&k=5921&comefrom=2066`,
      data,
    )
  }

  return {
    mailChatTask(sid: string, question: string) {
      return _together<MailChatTask>(
        'mailChatTask',
        sid,
        `<object>
      <string name="content">你是位猜灯谜大师，请根据我提供的灯谜谜面，创作对应谜底，返回的格式要求：需要返回谜面和谜底，灯谜谜面为：${question}</string>
      <string name="clientId">10109</string>
      <string name="configId">707</string>
      <string name="model">blian</string>
      <string name="talkType">1</string>
      <string name="createSession" />
      <string name="title">猜灯谜——${question}</string>
      <string name="defaultQuestion">{&quot;question&quot;:&quot;${question}&quot;,&quot;orderTip&quot;:&quot;猜灯谜&quot;,&quot;businessCode&quot;:&quot;14&quot;}</string>
      <string name="userActiveType">0</string>
    </object>`,
      )
    },
    mailChatMsg(sid: string, taskId: string) {
      return _together<MailChatMsg>(
        'mailChatMsg',
        sid,
        `<object>
      <string name="taskId">${taskId}</string>
      <string name="model">blian</string>
    </object>`,
      )
    },
  }
}
