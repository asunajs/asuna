export interface LoginEmail {
  /**
   * S_OK
   *
   * S008
   */
  code: string
  summary: string
  var?: {
    uin: string
    userNumber: string
    userNumberEnc: string
    partid: string
    sid: string
    rmkey: string
    maildomain: string
    prov: string
    areacode: string
    serviceItem: string
    cardType: string
    serviceIds: string
    serviceitems: string
    defaultSender: string
    lastlogintime: string
    lastloginip: string
    userLevel: string
    levelimg: string
    effectIntergal: string
    weathercode: string
    userType: string
    userAttrType: string
    trueName: string
    aliases: {
      aliasName: string
      aliasNameEnc: string
      alaisFetion: string
      alaisFetionEnc: string
    }
    configs: {
      id: string
      val1: string
      val2: string
      type: string
    }[]
    autoSecretKey: string
    passwdState: string
    pictureState: string
    loginSuccessUrl: string
    behaviorid: string
    level2SecretKey: string
    loginProcessFlag: string
    eMode: string
    UserNowState: string
  }
}
