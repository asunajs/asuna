import { writeFile } from 'fs/promises'
import { chromium, devices } from 'playwright'
import { parse } from 'tough-cookie'

const cookieString = process.env.COOKIE

const cookie = cookieString.split(/;\s?/).map((cookie) => {
  const c = parse(cookie)
  return {
    name: c.key,
    value: c.value,
    domain: '.mail.10086.cn',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Strict' as 'Strict' | 'Lax' | 'None',
  }
})

const browser = await chromium.launch({
  headless: false,
})
const context = await browser.newContext(devices['iPhone 14 Pro Max'])
const page = await context.newPage()

await context.addCookies(cookie)

await page.goto('https://appmail.mail.10086.cn/m6/html/index.html')

const newCookies = await context.cookies()

// 写入本地
await writeFile('cookies.json', JSON.stringify(newCookies))

await page.locator('p').filter({ hasText: '天天开盲盒' }).click()

await context.close()

await browser.close()
