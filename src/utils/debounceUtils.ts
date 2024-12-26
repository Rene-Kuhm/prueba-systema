import type { DebouncedFunc } from 'lodash';

export const createDebounce = async <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): Promise<DebouncedFunc<T>> => {
  const { debounce } = await import('lodash');
  return debounce(func, wait);
};

export const createThrottle = async <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): Promise<DebouncedFunc<T>> => {
  const { throttle } = await import('lodash');
  return throttle(func, wait);
};
