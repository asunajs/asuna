import type { LoggerType } from '@asign/types'
import type { ApiType } from './api.js'

import type { Alipan } from './options.js'

export type Config = Alipan

export interface M {
  api: ApiType
  logger: LoggerType
  config: Alipan
  DATA: {
    'refreshToken'?: string
    'deviceId'?: string
    'userId'?: string
    'x-signature'?: string
    'afterTask': (() => any)[]
  }
  sleep: (time: number) => Promise<number>
}

export interface TokenRefresh {
  default_sbox_drive_id: string
  role: string
  device_id: string
  user_name: string
  need_link: boolean
  expire_time: string
  pin_setup: boolean
  need_rp_verify: boolean
  avatar: string
  user_data: {
    DingDingRobotUrl: string
    EncourageDesc: string
    FeedBackSwitch: boolean
    FollowingDesc: string
    back_up_config: {
      手机备份: {
        folder_id: string
        photo_folder_id: string
        sub_folder: {}
        video_folder_id: string
      }
    }
    ding_ding_robot_url: string
    encourage_desc: string
    feed_back_switch: boolean
    following_desc: string
    share: string
  }
  token_type: string
  access_token: string
  default_drive_id: string
  domain_id: string
  refresh_token: string
  is_first_login: boolean
  hlogin_url: string
  user_id: string
  nick_name: string
  exist_link: any[]
  state: string
  expires_in: number
  status: string
}

export interface SignInInfo {
  success: boolean
  code?: any
  message?: any
  totalCount?: any
  nextToken?: any
  maxResults?: any
  result: {
    isSignIn: boolean
    year: string
    month: string
    day: string
    signInDay: number
    blessing: string
    subtitle: string
    themeIcon: string
    themeAction: string
    theme: string
    action: string
    rewards: {
      id?: any
      name: string
      rewardImage?: string
      rewardDesc?: string
      nameIcon: string
      type: 'dailyBuyVip' | 'dailyTask' | 'dailySignIn'
      actionText?: any
      action?: string
      status: 'unfinished' | 'finished' | 'verification' | 'notStart'
      remind: string
      remindIcon: string
      expire?: any
      position: number
      idempotent?: any
    }[]
  }
  arguments?: any
}

export interface SignInList {
  success: boolean
  code?: any
  message?: any
  totalCount?: any
  nextToken?: any
  maxResults?: any
  result: {
    isSignIn: boolean
    month: string
    signInCount: number
    themeIcon: string
    signInInfos: {
      day: string
      date?: string
      blessing: string
      status: string
      subtitle?: string
      theme?: string
      icon?: string
      rewards: {
        id?: any
        name: string
        rewardImage?: string
        rewardDesc?: string
        nameIcon?: (null | string)[]
        type: 'dailyBuyVip' | 'dailyTask' | 'dailySignIn'
        actionText?: (null | string)[]
        action?: string | string
        status: 'unfinished' | 'finished' | 'verification' | 'notStart'
        remind: string
        remindIcon?: (null | string)[]
        expire?: any
        position: number
        idempotent?: any
      }[]
    }[]
  }
  arguments?: any
}

export interface SignInReward {
  success: boolean
  code?: any
  message?: any
  totalCount?: any
  nextToken?: any
  maxResults?: any
  result: {
    goodsId: number
    name: string
    description: string
    background: string
    color: string
    action: string
    detailAction: string
    notice: string
    subNotice: string
    bottleId?: any
    bottleName?: any
    bottleShareId?: any
  }
  arguments?: any
}

export interface DeviceRoom {
  items: {
    gmtCollectEnergy: string
    gmtGenerateEnergy: string
    deviceNameInfo: {
      deviceType: string
      deviceName: string
      deviceModel: string
      displayName: string
    }
    new: boolean
    order: number
    isNew: boolean
    canCollectEnergy: boolean
    type: string
    name: string
    icon: string
    id: string
    gmCreate: string
    gmtModified: string
  }[]
}

export interface AlbumsInfo {
  code: string
  message: string
  data: {
    driveId: string
    driveName: string
  }
  resultCode: string
}

export interface CreateFile {
  type: string
  parent_file_id: string
  drive_id: string
  file_id: string
  revision_id: string
  encrypt_mode: string
  domain_id: string
  trashed_at?: any
  file_name: string
  upload_id: string
  location: string
  rapid_upload: boolean
  part_info_list: {
    part_number: number
    upload_url: string
    content_type: string
  }[]
}

export interface DeviceApplet {
  earlyBackupTime: number
  deviceItems: DeviceItem[]
  appletItems: AppletItem[]
}

export interface AppletItem {
  fileCount: number
  totalSize: number
  latestBackupTime: number
  earlyBackupTime: number
  enable: boolean
  defaultDriveFileCount?: number
  defaultDriveFileSize?: number
  name: string
  description: string
  action: string
  icon: string
  appletIcon: string
  channel: string
  backupViews: BackupView[]
  priority: number
}

export interface DeviceItem {
  fileCount: number
  totalSize: number
  latestBackupTime: number
  earlyBackupTime: number
  enable: boolean
  defaultDriveFileCount?: number
  albumDriveFileCount?: number
  defaultDriveFileSize?: number
  albumDriveFileSize?: number
  deviceId: string
  backupViews: BackupView[]
  icon: string
  deviceBrandIcon: string
  description: string
  deviceName: string
  deviceModel: string
  deviceType: string
  deviceSystemVersion?: string
  deviceRegisterDay: number
  deviceCapacity: {
    useSize: number
    totalSize: number
  }
  albumBackupSetting: {
    accessAuthority: boolean
    autoStatus: boolean
    leftFileTotal: number
    leftFileTotalSize: number
    backupTimeLast?: number
  }
  updateTime?: number
  displayName: string
  deviceBrandLogo?: string
}

interface BackupView {
  driveId: string
  view: 'album' | 'file'
}

export interface DeviceRoomRewardInfoToday {
  success: boolean
  code?: any
  message?: any
  totalCount?: any
  nextToken?: any
  maxResults?: any
  result: {
    rewardTotalSize: number
    rewardCountToday: number
  }
  arguments?: any
}

export interface BaseResult<T = any> {
  success: boolean
  code: string | null
  message: string | null
  result: T
}

export interface DeviceRoomRewardEnergy {
  success: true
  code: string | null
  message: string | null
  totalCount: null
  nextToken: null
  maxResults: null
  result: { size: number }
  arguments?: any
}
