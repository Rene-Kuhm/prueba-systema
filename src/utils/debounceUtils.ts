import type { DebouncedFunc } from 'lodash';

type AnyFunction = (...args: unknown[]) => unknown;
type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

export const createDebounce = async <T extends AnyFunction>(
  func: T,
  wait: number
): Promise<DebouncedFunc<T>> => {
  const { debounce } = await import('lodash');
  return debounce(func, wait);
};

export const createThrottle = async <T extends AsyncFunction>(
  func: T,
  wait: number
): Promise<DebouncedFunc<T>> => {
  const { throttle } = await import('lodash');
  return throttle(func, wait);
};
