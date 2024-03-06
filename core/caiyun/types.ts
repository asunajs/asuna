import type { ApiType, GardenApiType } from './api';
import { LoggerType } from '@asunajs/utils';
import { Config } from './config';

export interface M {
  api: ApiType;
  gardenApi?: GardenApiType;
  logger: LoggerType;
  config: Config;
  DATA: {
    baseUA: string;
    mailUaEnd: string;
    mailRequested: string;
    mcloudRequested: string;
  };
  sleep: (time: number) => Promise<number>;
  store: {
    files?: string[];
    [key: string]: any;
  };
}

export interface QuerySpecToken {
  success: boolean;
  code: string;
  message: string;
  data: {
    result: {
      resultCode: string;
      resultDesc: string;
    };
    resultCode: string;
    token: string;
  };
}

export interface TyrzLogin {
  code: number;
  message?: string;
  result: {
    areaCode: string;
    token: string;
    provCode: string;
    account: string;
  };
}

export interface SignInInfo {
  code: number;
  msg: string;
  result: {
    todaySignIn: boolean;
    total: number;
    canExchangeText: string;
    provinceCode: string;
    signInPoints: number;
    signCount: number;
    /** 可领取 */
    toReceive: number;
    isGuide: number;
    time: number;
    maxType: string;
    cal: {
      /**
       * 几号？
       */
      d: number;
      /** 是否完成 */
      s: boolean;
      n: number;
      p: number;
      /** 是否是今日 */
      t: boolean;
      /** 是否是当前月 */
      currentMonth: 0 | 1;
    }[];
    remind: number;
  };
}

export interface DrawInfoInWx {
  code: number;
  msg: string;
  result: {
    /** 剩余次数 */ surplusNumber: number;
    /** 剩余积分 */ surplusPoints: number;
  };
}

export interface DrawInWx {
  code: number;
  msg: string;
  result: {
    oid?: any;
    servNumber: string;
    prizeId: number;
    /** 15云朵 */
    prizeName: string;
    flag: number;
    insertTime: string;
    linkUrl?: any;
    type: number;
    /** 15 */
    uorder: number;
    reasons: string;
    memo: string;
    updateTime: string;
    marketName: string;
    sourceId: string;
    orderType: number;
    expireTime: string;
    source?: any;
    device?: any;
  };
}

export interface SignInfoInWx {
  code: number;
  msg: string;
  result: {
    todaySignIn: boolean;
    isFollow: boolean;
    total: number;
    week: [
      '1' | '0',
      '1' | '0',
      '1' | '0',
      '1' | '0',
      '1' | '0',
      '1' | '0',
      '1' | '0'
    ];
    signState: 'signin';
    provinceCode: '23';
  };
}

export interface DiskResult {
  success: boolean;
  code: string;
  message: string;
  data: {
    result: {
      resultCode: string;
      resultDesc?: any;
    };
    getDiskResult: {
      parentCatalogID: string;
      nodeCount: number;
      catalogList: {
        catalogID: string;
        catalogName: string;
        catalogType: number;
        createTime: string;
        updateTime: string;
        isShared: boolean;
        catalogLevel: number;
        shareDoneeCount: number;
        openType: number;
        parentCatalogId: string;
        dirEtag: number;
        tombstoned: number;
        proxyID?: any;
        moved: number;
        isFixedDir: number;
        isSynced?: any;
        owner: string;
        modifier: string;
        path: string;
        shareType: number;
        softLink?: any;
        extProp1?: any;
        extProp2?: any;
        extProp3?: string;
        extProp4?: any;
        extProp5?: any;
        ETagOprType: number;
      }[];
      contentList?: any;
      isCompleted: number;
    };
  };
}

export interface BatchList {
  resultCode: number;
  resultMsg: string;
  resultData: {
    list: {
      id: number;
      dynamicType: number;
      contentType: number;
      terminalType?: any;
      createTime: string;
      updateTime: string;
      dynamicInfoId: number;
      dynamicContentTotal: number;
      dynamicContentInfos: {
        contentID: string;
        contentName: string;
        contentType: string;
        contentSuffix: string;
        contentSize: string;
        md5Digest: string;
        parentCatalogID: string;
        path: string;
        modifier: string;
        phyFileID: string;
        site: string;
        contPath: string;
        extInfo: {
          size: string;
          item: {
            key: string;
            value: string;
          }[];
        };
        thumbnailURL: string;
        bigthumbnailURL: string;
        midthumbnailURL: string;
        extProp4: string;
        presentURL: string;
        presentHURL: string;
        presentLURL: string;
        uploadTime: string;
        collectionFlag: string;
        namePath?: any;
        dynamicContentInfoId: number;
        terminalType?: any;
        contentSchedule?: any;
        recordId?: any;
        updateTimestamp: string;
      }[];
      startDate?: any;
      updateTimestamp: string;
      tn: string;
    }[];
    total: number;
  };
  msgId?: any;
}

export type PcUploadFile = Orchestration<{
  uploadResult: {
    uploadTaskID: string;
    redirectionUrl: string;
    newContentIDList: {
      contentID: string;
      contentName: string;
      isNeedUpload: string;
      fileEtag: number;
      fileVersion: number;
      overridenFlag: number;
    }[];
    catalogIDList?: any;
    isSlice?: any;
  };
}>;

export interface NoteBooks {
  notebooks: {
    parentName: string;
    isDefault: number;
    /** sourceNotebookId 和 notebookId 一致 */
    sourceNotebookId: string;
    userphone: string;
    notebookId: string;
    text: string;
  }[];
  notebookRefs: {
    notebookId: string;
    noteId: string;
  }[];
}

export interface Shake {
  code: number;
  msg: string;
  result: {
    shakePrizeconfig?: {
      id: number;
      name: string;
      img: string;
      fragment: number;
      maximum: number;
      cloud: number;
      type: number;
      buttonTxt: string;
      tips: string;
      title: string;
      appFlag: string;
      netFlag: number;
      typeName: string;
      prizeId: number;
      totalCount: number;
      dailyCount: number;
      smsCheck: number;
      prizeDesc: any;
    };
    shakeRecommend?: {
      id: number;
      title: string;
      explain: string;
      img: string;
      content?: string;
      buttonTxt: string;
      tips?: string;
      type: number;
      flag: string;
      onLine: number;
    };
  };
}

export interface Orchestration<T = any> {
  success: boolean;
  code: string;
  message: string;
  data: {
    result: {
      resultCode: string;
      resultDesc?: any;
    };
  } & T;
}

export type CreateBatchOprTask = Orchestration<{
  createBatchOprTaskRes: {
    taskID: string;
  };
}>;
