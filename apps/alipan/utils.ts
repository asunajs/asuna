import { sha256 } from '@asunajs/utils'
import secp256k1 from 'secp256k1'

const { publicKeyCreate, ecdsaSign } = secp256k1

export function getSignature(nonce: number, user_id: string, deviceId: string) {
  const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')
  const toU8 = (str: string) => new Uint8Array(Buffer.from(str, 'hex'))
  const privateKey = toU8(sha256(user_id))
  const publicKey = '04' + toHex(publicKeyCreate(privateKey))
  const appId = '5dde4e1bdf9e4966b387ba58f4b3fdc3'
  const signature = toHex(
    ecdsaSign(
      toU8(sha256(`${appId}:${deviceId}:${user_id}:${nonce}`)),
      privateKey,
    ).signature,
  ) + '01'
  return { signature, publicKey }
}
