import type {
  SignInInfo,
  SignInList,
  SignInReward,
  TokenRefresh,
  DeviceRoom,
  AlbumsInfo,
  CreateFile,
  DeviceApplet,
  DeviceRoomRewardInfoToday,
  BaseResult,
  DeviceRoomRewardEnergy,
} from './types';
import type { Http } from '@asunajs/types';

export function createApi(http: Http) {
  const memberUrl: string = 'https://member.aliyundrive.com';
  const aliyundriveUrl: string = 'https://api.aliyundrive.com';
  const authUrl: string = 'https://auth.aliyundrive.com';
  const apiUrl: string = 'https://api.alipan.com';

  function refreshToken(refreshToken: string) {
    return http.post<TokenRefresh>(`${aliyundriveUrl}/token/refresh`, {
      refresh_token: refreshToken,
    });
  }

  function getAccessToken(refreshToken: string) {
    return http.post<TokenRefresh>(`${authUrl}/v2/account/token`, {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
  }

  function signInList() {
    return http.post<SignInList>(
      `${memberUrl}/v2/activity/sign_in_list?_rx-s=mobile`,
      {
        '_rx-s': 'mobile',
      }
    );
  }

  function signIn() {
    return http.post<SignInInfo>(
      `${memberUrl}/v2/activity/sign_in_info?_rx-s=mobile`,
      {}
    );
  }

  function signInReward(signInDay: number) {
    return http.post<SignInReward>(
      `${memberUrl}/v1/activity/sign_in_reward?_rx-s=mobile`,
      {
        signInDay: signInDay,
      }
    );
  }

  function signInTaskReward(signInDay: number) {
    return http.post(`${memberUrl}/v2/activity/sign_in_task_reward`, {
      signInDay: signInDay,
    });
  }

  function updateDeviceExtras() {
    return http.post<BaseResult<boolean>>(
      `${apiUrl}/users/v1/users/update_device_extras`,
      {
        albumAccessAuthority: true,
        albumBackupLeftFileTotal: 0,
        albumBackupLeftFileTotalSize: 0,
        albumFile: 0,
        autoBackupStatus: true,
        // totalSize: 0,
        // useSize: 0,
        brand: 'xiaomi',
        systemVersion: 'Android 13',
      }
    );
  }

  function createSession(
    deviceId: string,
    refreshToken: string,
    pubKey: string,
    deviceName: string,
    modelName: string
  ) {
    return http.post<BaseResult<boolean>>(
      `https://api.alipan.com/users/v1/users/device/create_session`,
      {
        deviceName: deviceName,
        modelName: modelName,
        nonce: '0',
        pubKey: pubKey,
        refreshToken: refreshToken,
      },
      {
        headers: {
          'x-device-id': deviceId,
        },
      }
    );
  }

  function getDeviceAppletList() {
    return http.post<DeviceApplet>(
      `${apiUrl}/adrive/v2/backup/device_applet_list_summary`,
      {}
    );
  }

  function getDeviceList() {
    return http.post(`${apiUrl}/users/v2/users/device_list`, {});
  }

  function getAlbumsInfo() {
    return http.post<AlbumsInfo>(
      `${aliyundriveUrl}/adrive/v1/user/albums_info`,
      {}
    );
  }

  function getDeviceRoomList() {
    return http.post<DeviceRoom>(
      `https://user.aliyundrive.com/v1/deviceRoom/listDevice`,
      {}
    );
  }

  function getDeviceRoomRewardInfoToday() {
    return http.post<DeviceRoomRewardInfoToday>(
      `${memberUrl}/v1/deviceRoom/rewardInfoToday`,
      {}
    );
  }

  function getDeviceRoomRewardEnergy(deviceId: string) {
    return http.post<DeviceRoomRewardEnergy>(
      `${memberUrl}/v1/deviceRoom/rewardEnergy`,
      {
        deviceId: deviceId,
      }
    );
  }

  function createFile(deviceId: string, driveId: string) {
    const size = Math.floor(Math.random() * 30000);
    return http.post<CreateFile>(
      `${aliyundriveUrl}/adrive/v2/biz/albums/file/create`,
      {
        drive_id: driveId,
        part_info_list: [
          {
            part_number: 1,
            part_size: size,
          },
        ],
        parent_file_id: 'root',
        name: Math.floor(Math.random() * 100000000) + '.jpg',
        type: 'file',
        check_name_mode: 'auto_rename',
        size: size,
        create_scene: 'album_autobackup',
        hidden: false,
        content_type: 'image/jpeg',
      },
      {
        headers: {
          'x-device-id': deviceId,
        },
      }
    );
  }

  function completeUpload(
    deviceId: string,
    driveId: string,
    fileId: string,
    uploadId: string
  ) {
    return http.post(
      `${aliyundriveUrl}/v2/file/complete`,
      {
        drive_id: driveId,
        upload_id: uploadId,
        file_id: fileId,
      },
      {
        headers: {
          'x-device-id': deviceId,
        },
      }
    );
  }

  function completeAlbumsUpload(
    deviceId: string,
    driveId: string,
    fileId: string,
    contentHash: string
  ) {
    return http.post<{ code: string; message: string; resultCode: string }>(
      `${aliyundriveUrl}/adrive/v2/biz/albums/file/complete`,
      {
        drive_id: driveId,
        file_id: fileId,
        content_hash: contentHash,
        content_hash_name: 'sha1',
      },
      {
        headers: {
          'x-device-id': deviceId,
        },
      }
    );
  }

  function deleteFile(deviceId: string, driveId: string, fileId: string) {
    return http.post(
      `${apiUrl}/adrive/v4/batch`,
      {
        requests: [
          {
            body: {
              drive_id: driveId,
              file_id: fileId,
            },
            id: fileId,
            method: 'POST',
            url: '/file/delete',
          },
        ],
        resource: 'file',
      },
      {
        headers: {
          'x-device-id': deviceId,
        },
      }
    );
  }

  function home() {
    return http.post(`${aliyundriveUrl}/apps/v2/users/home/widgets`, {});
  }

  return {
    home,
    signIn,
    signInList,
    createFile,
    deleteFile,
    refreshToken,
    signInReward,
    getAlbumsInfo,
    createSession,
    getDeviceList,
    getAccessToken,
    completeUpload,
    signInTaskReward,
    getDeviceRoomList,
    updateDeviceExtras,
    getDeviceAppletList,
    completeAlbumsUpload,
    getDeviceRoomRewardEnergy,
    getDeviceRoomRewardInfoToday,
  };
}

export type ApiType = ReturnType<typeof createApi>;
