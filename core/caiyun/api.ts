import type { Http } from '@asign/types'
import { hashCode } from '@asign/utils-pure'
import type { TaskList } from './TaskType.js'
import type {
  BatchList,
  BlindboxInfo,
  BlindboxUser,
  CloudRecord,
  CreateBatchOprTask,
  DiskResult,
  DrawInfoInWx,
  DrawInWx,
  NoteBooks,
  OpenBlindbox,
  Orchestration,
  PcUploadFile,
  QuerySpecToken,
  Shake,
  SignInfoInWx,
  SignInInfo,
  TyrzLogin,
} from './types.js'

export * from './gardenApi.js'

export function createApi(http: Http) {
  const yun139Url = 'https://yun.139.com'
  const caiyunUrl = 'https://caiyun.feixin.10086.cn'
  const mnoteUrl = 'https://mnote.caiyun.feixin.10086.cn'

  return {
    querySpecToken(account: string | number, toSourceId = '001005') {
      return http.post<QuerySpecToken>(
        `${yun139Url}/orchestration/auth-rebuild/token/v1.0/querySpecToken`,
        {
          toSourceId,
          account: String(account),
          commonAccountInfo: { account: String(account), accountType: 1 },
        },
        {
          headers: {
            'referer': 'https://yun.139.com/w/',
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json;charset=UTF-8',
            'accept-language': 'zh-CN,zh;q=0.9',
          },
        },
      )
    },
    authTokenRefresh(token: string, account: string | number) {
      return http.post<string>(
        `https://aas.caiyun.feixin.10086.cn/tellin/authTokenRefresh.do`,
        `<?xml version="1.0" encoding="utf-8"?><root><token>${token}</token><account>${account}</account><clienttype>656</clienttype></root>`,
        {
          headers: {
            'accept': '*/*',
            'content-type': 'application/json; charset=utf-8',
          },
          responseType: 'text',
        },
      )
    },
    getNoteAuthToken: async function getNoteAuthToken(
      token: string,
      account: string | number,
    ): Promise<{
      app_auth: string
      app_number: string
      note_token: string
    }> {
      const resp = await http.post(
        `${mnoteUrl}/noteServer/api/authTokenRefresh.do`,
        {
          authToken: token,
          userPhone: String(account),
        },
        {
          headers: {
            APP_CP: 'pc',
            APP_NUMBER: String(account),
            CP_VERSION: '7.7.1.20240115',
          },
          native: true,
        },
      )

      const headers = resp.headers
      if (!headers.app_auth) return
      return {
        app_auth: headers.app_auth,
        app_number: headers.app_number,
        note_token: headers.note_token,
      }
    },
    syncNoteBook: function syncNoteBook(headers: Record<string, string>) {
      return http.post<NoteBooks>(
        `${mnoteUrl}/noteServer/api/syncNotebook.do `,
        { addNotebooks: [], delNotebooks: [], updateNotebooks: [] },
        {
          headers: {
            APP_CP: 'pc',
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    createNote: function createNote(
      noteId: string,
      title: string,
      account: string | number,
      headers: Record<string, string>,
      tags: {
        id: string
        orderIndex?: string
        text?: string
      }[] = [],
    ) {
      return http.post<{}>(
        `${mnoteUrl}/noteServer/api/createNote.do`,
        {
          archived: 0,
          attachmentdir: '',
          attachmentdirid: '',
          attachments: [],
          contentid: '',
          contents: [
            {
              data: '<span></span>',
              noteId: noteId,
              sortOrder: 0,
              type: 'TEXT',
            },
          ],
          cp: '',
          createtime: String(Date.now()),
          description: '',
          expands: { noteType: 0 },
          landMark: [],
          latlng: '',
          location: '',
          noteid: noteId,
          remindtime: '',
          remindtype: 0,
          revision: '1',
          system: '',
          tags: tags,
          title: title,
          topmost: '0',
          updatetime: String(Date.now()),
          userphone: String(account),
          version: '',
          visitTime: String(Date.now()),
        },
        {
          headers: {
            APP_CP: 'pc',
            APP_NUMBER: String(account),
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    deleteNote(noteid: string, headers: Record<string, string>) {
      return http.post<{}>(
        `${mnoteUrl}/noteServer/api/moveToRecycleBin.do`,
        { noteids: [{ noteid }] },
        {
          headers: {
            APP_CP: 'pc',
            CP_VERSION: '7.7.1.20240115',
            ...headers,
          },
        },
      )
    },
    tyrzLogin: function tyrzLogin(ssoToken: string) {
      return http.get<TyrzLogin>(
        `${caiyunUrl}/portal/auth/tyrzLogin.action?ssoToken=${ssoToken}`,
      )
    },
    signInInfo: function signInInfo() {
      return http.get<SignInInfo>(
        `${caiyunUrl}/market/signin/page/info?client=app`,
      )
    },
    getDrawInWx: function getDrawInWx() {
      return http.get<DrawInfoInWx>(`${caiyunUrl}/market/playoffic/drawInfo`)
    },
    drawInWx: function getWxDrawInfo() {
      return http.get<DrawInWx>(`${caiyunUrl}/market/playoffic/draw`)
    },
    signInfoInWx: function signInfoInWx() {
      return http.get<SignInfoInWx>(
        `${caiyunUrl}/market/playoffic/followSignInfo?isWx=true`,
      )
    },
    getDisk(account: string | number, catalogID: string) {
      return http.post<DiskResult>(
        `${yun139Url}/orchestration/personalCloud/catalog/v1.0/getDisk`,
        {
          commonAccountInfo: { account: String(account) },
          catalogID,
          catalogType: -1,
          sortDirection: 1,
          catalogSortType: 0,
          contentSortType: 0,
          filterType: 1,
          startNumber: 1,
          endNumber: 40,
        },
      )
    },
    queryBatchList: function queryBatchList() {
      return http.post<BatchList>(
        `https://grdt.middle.yun.139.com/openapi/pDynamicInfo/queryBatchList`,
        {
          encodeData: 'WBvKN8KKSLovAM=',
          encodeType: 2,
          pageSize: 3,
          dynamicType: 2,
        },
      )
    },
    uploadFileRequest(
      options: UploadXml,
    ) {
      return http.post<string>(
        `https://ose.caiyun.feixin.10086.cn/richlifeApp/devapp/IUploadAndDownload`,
        getUploadXml(options),
        {
          headers: {
            // 'hcy-cool-flag': '1',
            'x-yun-app-channel': '10000023',
            'x-huawei-channelSrc': '10000023',
            'Content-Type': 'application/xml; charset=UTF-8',
          },
        },
      )
    },
    pcUploadFileRequest(
      account: string | number,
      parentCatalogID: string,
      contentSize: number,
      contentName: string,
      digest: string,
    ) {
      return http.post<PcUploadFile>(
        `${yun139Url}/orchestration/personalCloud/uploadAndDownload/v1.0/pcUploadFileRequest`,
        {
          commonAccountInfo: { account: String(account) },
          fileCount: 1,
          totalSize: contentSize,
          uploadContentList: [
            {
              contentName: contentName,
              contentSize: contentSize,
              comlexFlag: 0,
              digest: digest,
            },
          ],
          newCatalogName: '',
          parentCatalogID: parentCatalogID,
          operation: 0,
          path: '',
          manualRename: 2,
          autoCreatePath: [],
          tagID: '',
          tagType: '',
          seqNo: '',
        },
      )
    },
    createBatchOprTask(account: string, contentIds: string[]) {
      return http.post<CreateBatchOprTask>(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/createBatchOprTask`,
        {
          createBatchOprTaskReq: {
            taskType: 2,
            actionType: 201,
            taskInfo: {
              contentInfoList: contentIds,
              catalogInfoList: [],
              newCatalogID: '',
            },
            commonAccountInfo: {
              account,
              accountType: 1,
            },
          },
        },
      )
    },
    queryBatchOprTaskDetail(account: string, taskID: string) {
      return http.post<Orchestration>(
        `${yun139Url}/orchestration/personalCloud/batchOprTask/v1.0/queryBatchOprTaskDetail`,
        {
          queryBatchOprTaskDetailReq: {
            taskID,
            commonAccountInfo: {
              account,
              accountType: 1,
            },
          },
        },
      )
    },
    clickTask(id: number) {
      return http.get<{ code: number; msg: string }>(
        `${caiyunUrl}/market/signin/task/click?key=task&id=${id}`,
      )
    },
    getTaskList(marketname: 'sign_in_3' | 'newsign_139mail' = 'sign_in_3') {
      return http.get<TaskList>(
        `${caiyunUrl}/market/signin/task/taskList?marketname=${marketname}&clientVersion=`,
      )
    },
    receive() {
      return http.get(`${caiyunUrl}/market/signin/page/receive`)
    },
    shake() {
      return http.post<Shake>(
        `${caiyunUrl}/market/shake-server/shake/shakeIt?flag=1`,
      )
    },
    beinviteHecheng1T() {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/beinvite`)
    },
    finishHecheng1T() {
      return http.get(`${caiyunUrl}/market/signin/hecheng1T/finish?flag=true`)
    },
    getOutLink(account: string, coIDLst: string[], dedicatedName: string) {
      return http.post<Orchestration<{ getOutLinkRes: any }>>(
        `${yun139Url}/orchestration/personalCloud-rebuild/outlink/v1.0/getOutLink`,
        {
          getOutLinkReq: {
            subLinkType: 0,
            encrypt: 1,
            coIDLst,
            caIDLst: [],
            pubType: 1,
            dedicatedName,
            period: 1,
            periodUnit: 1,
            viewerLst: [],
            extInfo: {
              isWatermark: 0,
              shareChannel: '3001',
            },
            commonAccountInfo: {
              account,
              accountType: 1,
            },
          },
        },
      )
    },
    getBlindboxTask() {
      return http.post<BlindboxInfo>(
        `${caiyunUrl}/market/task-service/task/api/blindBox/queryTaskInfo`,
        {
          marketName: 'National_BlindBox',
          clientType: 1,
        },
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    registerBlindboxTask(taskId: number) {
      return http.post(
        `${caiyunUrl}/market/task-service/task/api/blindBox/register`,
        {
          marketName: 'National_BlindBox',
          taskId,
        },
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    blindboxUser() {
      return http.post<BlindboxUser>(
        `${caiyunUrl}/ycloud/blindbox/user/info`,
        { from: 'main' },
        {
          headers: {
            accept: 'application/json',
          },
        },
      )
    },
    openBlindbox() {
      return
      return http.post<OpenBlindbox>(
        `${caiyunUrl}/ycloud/blindbox/draw/openBox?from=main`,
        { from: 'main' },
        {
          headers: {
            'accept': 'application/json',
            'x-requested-with': 'cn.cj.pe',
            'referer':
              'https://caiyun.feixin.10086.cn:7071/portal/caiyunOfficialAccount/index.html?path=blindBox&sourceid=1016',
            'origin': 'https://caiyun.feixin.10086.cn',
            'user-agent':
              'Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.106 Mobile Safari/537.36(139PE_WebView_Android_10.2.2_mcloud139)',
          },
        },
      )
    },
    datacenter(base64: string) {
      return http.post(
        'https://datacenter.mail.10086.cn/datacenter/',
        `data=${base64}&ext=${'crc=' + hashCode(base64)}`,
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'platform': 'h5',
          },
        },
      )
    },
    getCloudRecord(pn = 1, ps = 10, type = 1) {
      return http.get<CloudRecord>(
        `${caiyunUrl}/market/signin/public/cloudRecord?type=${type}&pageNumber=${pn}&pageSize=${ps}`,
      )
    },
  }
}

export type ApiType = ReturnType<typeof createApi>

export interface UploadXml {
  phone: string
  manualRename?: number
  parentCatalogID: string
  createTime: string
  digest: string
  contentName: string
  contentSize: string | number
}
function getUploadXml({
  phone,
  manualRename = 2,
  parentCatalogID,
  createTime,
  digest,
  contentName,
  contentSize,
}: UploadXml) {
  return `<pcUploadFileRequest>
  <ownerMSISDN>${phone}</ownerMSISDN>
  <fileCount>1</fileCount>
  <totalSize>${contentSize}</totalSize>
  <uploadContentList length="1">
     <uploadContentInfo>
        <comlexFlag>0</comlexFlag>
        <contentDesc><![CDATA[]]></contentDesc>
        <contentName><![CDATA[${contentName}]]></contentName>
        <contentSize>${contentSize}</contentSize>
        <contentTAGList></contentTAGList>
        <digest>${digest}</digest>
        <exif>
           <createTime>${createTime}</createTime>
        </exif>
        <fileEtag>0</fileEtag>
        <fileVersion>0</fileVersion>
        <updateContentID></updateContentID>
     </uploadContentInfo>
  </uploadContentList>
  <newCatalogName></newCatalogName>
  <parentCatalogID>${parentCatalogID}</parentCatalogID>
  <operation>0</operation>
  <path></path>
  <manualRename>${manualRename}</manualRename>
  <autoCreatePath length="0"/>
  <tagID></tagID>
  <tagType></tagType>
</pcUploadFileRequest>`
}
