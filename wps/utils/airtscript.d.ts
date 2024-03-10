declare global {
  const HTTP: any
  const ActiveSheet: any
  const Time: { sleep: (time: number) => Promise<number> }
  const Application: any
  const SMTP: any
}

export {}
