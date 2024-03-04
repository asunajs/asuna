declare global {
  const HTTP: any;
  const ActiveSheet: any;
  const Time: { sleep: (time: number) => Promise<number> };
}

export {};
