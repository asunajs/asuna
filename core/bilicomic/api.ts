import type { Http } from '@asign/types'

export function createApi(http: Http) {
  const mangaUrl = 'https://manga.bilibili.com/twirp'
  return {
    signIn() {
      return http.post(
        `${mangaUrl}/activity.v1.Activity/ClockIn?platform=android`,
      )
    },
    shareComic() {
      return http.post(
        `${mangaUrl}/activity.v1.Activity/ShareComic?platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0`,
      )
    },
    getSeason() {
      return http.post(
        `${mangaUrl}/user.v1.SeasonV2/GetSeasonInfo?device=android&platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0`,
        { body: 'type=1' },
      )
    },
    getMangaDetail(comic_id: number) {
      return http.post(
        `${mangaUrl}/comic.v1.Comic/ComicDetail?device=android&platform=android&version=4.16.0&mobi_app=android_comic&is_teenager=0`,
        { comic_id },
      )
    },
  }
}
