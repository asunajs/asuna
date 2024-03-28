declare global {
  const HTTP: any
  const ActiveSheet: any
  const Application: any
  const Time: { sleep: (time: number) => Promise<number> }
}

export {}
