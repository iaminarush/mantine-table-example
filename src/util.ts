export function parseFromValuesOrFunc<T, U>(
  fn: T | ((arg: U) => T) | undefined,
  arg: U
): T | undefined {
  return fn instanceof Function ? fn(arg) : fn;
}
