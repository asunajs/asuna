export function arrayMap<T = any>(arr: T[], cb: (item: any, index: number, arr: T[]) => any) {
  const _arr = []
  for (let i = 0; i < arr.length; i++) {
    _arr.push(cb(arr[i], i, arr))
  }
  return _arr
}
