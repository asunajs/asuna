export function rsaEncrypt(pubKey: string, usernameRaw: string, passwordRaw: string) {
  pubKey = pubKey.replace('-----BEGIN PUBLIC KEY-----\n', '')
  pubKey = pubKey.replace('\n-----END PUBLIC KEY-----', '')

  const { error, username, password } = HTTP.get(
    `https://as.js.cool/api/ecloud/rsa?pubkey=${pubKey}&username=${usernameRaw}&password=${passwordRaw}`,
  )
    .json() as any

  if (error) {
    throw new Error(error)
  }

  return {
    username,
    password,
  }
}
