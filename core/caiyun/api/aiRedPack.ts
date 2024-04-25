import type { Http } from '@asign/types'
import { riddlesUrl } from '../constant'
import type { BaseType } from '../types.js'

type PuzzleCard = BaseType<
  {
    id: string
    puzzleTitleType: number
    puzzleTitleContext?: string
    puzzleTitleImgUrl?: string
    puzzleTipType: number
    puzzleTipContext: string
    puzzleTipImgUrl?: any
    backgroundImageUrl: string
    answer?: any
    adContent?: any
    bootConfiguration: string
    status: number
    riddlesType: number
  }[]
>

type Awarding = BaseType<
  {
    prizeName: string
    lanterPrizeType: string
    memo: string
    isLastClaimable: number
  }
>

export function createAiRedPackApi(http: Http) {
  return {
    submitAnswered(puzzleId: string, answered: string) {
      return http.get<BaseType>(
        `${riddlesUrl}/submitAnswered?puzzleId=${puzzleId}&answered=${answered}`,
      )
    },
    getIndexPuzzleCard() {
      return http.get<PuzzleCard>(
        `${riddlesUrl}/getIndexPuzzleCard`,
      )
    },
    getAwarding(puzzleId: string) {
      return http.post<Awarding>(
        `${riddlesUrl}/awarding`,
        {
          puzzleId,
        },
      )
    },
  }
}
