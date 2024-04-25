import { deepEqual, equal } from 'node:assert'
import { deepStrictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mergeOptions } from '../index'

describe('配置合并', () => {
  it('默认配置', () => {
    const options = mergeOptions({}, {
      prefixUrl: '',
      method: 'GET',
      responseType: 'json',
    })

    deepStrictEqual(options, {
      method: 'GET',
      prefixUrl: '',
      responseType: 'json',
      headers: {},
    })
  })

  it('请求头合并', () => {
    const options = mergeOptions({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, {
      headers: {
        // 需要注意的是，这里已经提前小写了所有的请求头 Key
        'content-type': 'application/json',
      },
    })

    deepStrictEqual(options, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  })

  it('超时合并', () => {
    const options = mergeOptions({
      timeout: 10086,
    }, {
      timeout: {
        request: 20000,
        response: 10000,
      },
    })

    deepStrictEqual(options, {
      timeout: {
        request: 10086,
        response: 10000,
      },
      headers: {},
    })
  })

  it('合并请求体/json', () => {
    const options = mergeOptions({
      body: {
        b: 2,
      },
    }, {})

    deepStrictEqual(options, {
      body: '{"b":2}',
      headers: {},
    })
  })

  it('合并请求体/form', () => {
    const options = mergeOptions({
      body: {
        b: 2,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, {})

    deepStrictEqual(options, {
      body: 'b=2',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
  })

  it('合并请求体/buffer', () => {
    const options = mergeOptions({
      body: Buffer.from('hello world'),
    }, {})

    deepEqual(options.body, Buffer.from('hello world'))
  })

  it('合并请求体/Generator', () => {
    const options = mergeOptions({
      body: async function*() {
        yield 'hello '
        yield 'world'
      },
    }, {})

    // 断言 body 为 Generator
    equal(typeof options.body, 'function')
    // @ts-ignore
    equal(typeof options.body(), 'object')
  })
})
