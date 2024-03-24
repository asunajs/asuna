import assert from 'node:assert'
import test from 'node:test'
import { _aesDecrypt, _aesEncrypt, decryptCaiyun, encryptCaiyun } from '../index.js'

const text =
  'dFEy3gnB3tfSbY1pCKYRFNOvL29NHC/NzQpqZt2U/C0jGm20ctb8z8913yfjk6OAChbygUNf9NT2aqxS3uljmZl/dUlpi7O4lt6UniHdKTVe5MnJhVG3f68q7fd0cRMiwiUBPNz04vGr4aW1Hl7vM1vtl8eynEQj4mjvBbnqsYfwXaKP0a2k/6+MfaQnpJ0SoaRrm06dM2BqavHHuY3afsIR0/gmyY7nUanLQmv6zb07SbqxJoLu6tGF0q4o4vayc6vUHD+1DbSCN4gWd2Q+TQU31MLYWac4oyW1oLBdE7vBmVMKY14Yg3RIfvkEzmri4QrOk+cwaWimZosd2p8KTb97lRF5Ahy/G0ENvszOV9UJ8bDvgkCU9T32UZI+qrdRvOblvKciU7rB4dUAhDlcakzuM3vwtynZGBR21Q8NOJ6SBZGkfm1aKQzXcvBo6wnkDcyW8Il0WbW+0Kn9FwKRliG4Q4cWEWto3G3FVX0nj8+uecGwr5zKDLYXkZPItteR6p/dyjMwElLamOy6RqDqvGTIoeCKrA4FIPJE8o+yaInyrDjqAN6BXQ3+ktTa78YW+oPp/mV6ZYVHK3k0lNNsSrQ2m3+G9D6+jVb1iCrZ3EbaBlmBT0oHE6D6L33ZR6Lt'

const xml =
  '<?xml version="1.0" encoding="UTF-8"?><result resultCode="0"><uploadResult><uploadTaskID>2swcGFp</uploadTaskID><newContentIDList length="1"><newContent><contentID>1D11rPNF7A5T18920240319221148535</contentID><contentName>IMG_20240319_195233.jpg</contentName><isNeedUpload>0</isNeedUpload><fileEtag>1881502553506057480</fileEtag><overridenFlag>0</overridenFlag><fileVersion>1881490571142887732</fileVersion></newContent></newContentIDList></uploadResult></result>'

test('加密/解密基本函数', async (t) => {
  const key = 'f5624c3f06a320e8777715f4ae95d469'
  const iv = '680ee8b0b6f03a07be63dd63f0aac308'
  const text = 'hello world'
  const eText = '1120d48393b2681bf052600f0f183e5a'

  await t.test('加密', () => {
    assert.strictEqual(
      _aesEncrypt(text, key, iv),
      eText,
    )
  })

  await t.test('解密', () => {
    assert.strictEqual(
      _aesDecrypt(eText, key, iv),
      text,
    )
  })
})

test('解密 caiyun 请求', () => {
  assert.strictEqual(
    decryptCaiyun(text),
    xml,
  )
})

test('加密 caiyun 请求', () => {
  assert.strictEqual(
    decryptCaiyun(encryptCaiyun(xml)),
    xml,
  )
})
